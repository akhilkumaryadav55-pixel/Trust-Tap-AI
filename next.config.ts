import type { NextConfig } from "next";

/**
 * TrustTap AI — Next.js configuration.
 *
 * Deliberate choices:
 * - `cacheComponents` is intentionally NOT enabled. TrustTap AI is a
 *   client-state driven app (saved checks live on the device, analysis happens
 *   in Route Handlers). Cache Components adds Suspense-boundary requirements
 *   that buy us nothing here and make the model harder to reason about.
 * - Tailwind is wired up through `postcss.config.mjs`, not `turbopack.rules`.
 *   See the comment in that file for why.
 * - `tesseract.js` is externalized because it loads worker scripts and WASM from
 *   disk at runtime; bundling it breaks the worker bootstrap.
 * - Security headers are applied globally. The CSP is strict and permits no
 *   third-party script origins.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js injects inline bootstrap scripts; the theme script is inlined
      // in <head> and Turbopack injects its own bootstrap as well.
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self' blob:",
      "worker-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["tesseract.js"],
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
