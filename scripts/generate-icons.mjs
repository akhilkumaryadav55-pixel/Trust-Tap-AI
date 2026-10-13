/**
 * Generates the PWA icon set as real PNG files.
 *
 * Why a script instead of committing opaque binaries: the icons are derived
 * from a documented shape, so they can be regenerated or adjusted in review
 * rather than being an unexplained blob in the repository.
 *
 * Run with:  node scripts/generate-icons.mjs
 *
 * The PNG encoder here is deliberately minimal (RGBA, no interlacing, a single
 * zlib stream) because it avoids adding an image dependency for two files.
 */

import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

// --- PNG encoding -----------------------------------------------------------

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  return table;
})();

function crc32(buffer) {
  let c = 0xffffffff;
  for (const byte of buffer) {
    c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeAndData = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData), 0);
  return Buffer.concat([length, typeAndData, crc]);
}

/** Encode RGBA pixels (Buffer of size width*height*4) into a PNG buffer. */
function encodePng(width, height, rgba) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  // Each scanline is prefixed with a filter byte (0 = None).
  const raw = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y += 1) {
    const rowStart = y * (1 + width * 4);
    raw[rowStart] = 0;
    rgba.copy(raw, rowStart + 1, y * width * 4, (y + 1) * width * 4);
  }

  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// --- Shape definitions ------------------------------------------------------

const COLORS = {
  background: [6, 11, 24, 255], // deep navy
  shield: [75, 139, 251, 255], // primary blue
  check: [255, 255, 255, 255],
  transparent: [0, 0, 0, 0],
};

/** Shield outline as a normalised polygon (x, y in 0..1). */
const SHIELD_POLYGON = [
  [0.5, 0.16],
  [0.78, 0.27],
  [0.78, 0.5],
  [0.72, 0.68],
  [0.5, 0.85],
  [0.28, 0.68],
  [0.22, 0.5],
  [0.22, 0.27],
];

function pointInPolygon(x, y, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

/** Distance from a point to a line segment — used to draw the check mark. */
function distanceToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const lengthSquared = dx * dx + dy * dy;
  const t = Math.max(
    0,
    Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (lengthSquared || 1)),
  );
  const cx = ax + t * dx;
  const cy = ay + t * dy;
  return Math.hypot(px - cx, py - cy);
}

const CHECK_SEGMENTS = [
  { a: [0.375, 0.5], b: [0.465, 0.6] },
  { a: [0.465, 0.6], b: [0.645, 0.4] },
];

function isRoundedSquare(x, y, radius) {
  const r = radius;
  const cx = x < r ? r : x > 1 - r ? 1 - r : x;
  const cy = y < r ? r : y > 1 - r ? 1 - r : y;
  return Math.hypot(x - cx, y - cy) <= r + 1e-9;
}

function colorAt(x, y, { maskable }) {
  // Maskable icons must keep content inside a safe circle, so the shield is
  // scaled down and the background fills the whole square.
  if (!maskable && !isRoundedSquare(x, y, 0.22)) {
    return COLORS.transparent;
  }

  const scale = maskable ? 0.72 : 1;
  const offset = (1 - scale) / 2;
  const sx = (x - offset) / scale;
  const sy = (y - offset) / scale;
  if (sx < 0 || sx > 1 || sy < 0 || sy > 1) return COLORS.background;

  for (const segment of CHECK_SEGMENTS) {
    if (
      distanceToSegment(sx, sy, segment.a[0], segment.a[1], segment.b[0], segment.b[1]) <
      0.055
    ) {
      return COLORS.check;
    }
  }
  if (pointInPolygon(sx, sy, SHIELD_POLYGON)) {
    return COLORS.shield;
  }
  return COLORS.background;
}

/** Supersample 3x3 for smooth edges. */
function render(size, options) {
  const rgba = Buffer.alloc(size * size * 4);
  const samples = 3;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      for (let sy = 0; sy < samples; sy += 1) {
        for (let sx = 0; sx < samples; sx += 1) {
          const px = (x + (sx + 0.5) / samples) / size;
          const py = (y + (sy + 0.5) / samples) / size;
          const [cr, cg, cb, ca] = colorAt(px, py, options);
          const alpha = ca / 255;
          r += cr * alpha;
          g += cg * alpha;
          b += cb * alpha;
          a += ca;
        }
      }
      const total = samples * samples;
      const alphaAvg = a / total;
      const weight = alphaAvg === 0 ? 1 : alphaAvg / 255;
      const index = (y * size + x) * 4;
      rgba[index] = Math.round(r / total / weight);
      rgba[index + 1] = Math.round(g / total / weight);
      rgba[index + 2] = Math.round(b / total / weight);
      rgba[index + 3] = Math.round(alphaAvg);
    }
  }
  return encodePng(size, size, rgba);
}

// --- Output -----------------------------------------------------------------

const outputs = [
  { file: "public/icons/icon-192.png", size: 192, maskable: false },
  { file: "public/icons/icon-512.png", size: 512, maskable: false },
  { file: "public/icons/maskable-512.png", size: 512, maskable: true },
  { file: "src/app/icon.png", size: 192, maskable: false },
];

for (const output of outputs) {
  const target = resolve(root, output.file);
  mkdirSync(dirname(target), { recursive: true });
  const png = render(output.size, { maskable: output.maskable });
  writeFileSync(target, png);
  console.log(`wrote ${output.file} (${output.size}px, ${png.length} bytes)`);
}
