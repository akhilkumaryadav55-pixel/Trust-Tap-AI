/**
 * PostCSS configuration.
 *
 * Tailwind CSS v4 is wired in through PostCSS rather than `turbopack.rules`.
 * That is the documented, supported path for a stylesheet transform: Turbopack's
 * loader rules only support loaders that emit JavaScript, so a CSS-transforming
 * loader silently leaves the stylesheet unprocessed there.
 *
 * `@tailwindcss/postcss` performs the whole v4 pipeline (content detection,
 * `@theme`, `@custom-variant`, `@import "tailwindcss"`), so no other plugin is
 * needed. Do not add `autoprefixer` — v4 handles vendor prefixes itself.
 */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
