import type { MetadataRoute } from "next";

/**
 * PWA manifest.
 *
 * The app is installable and usable offline for *reading* (saved checks,
 * learning content, emergency steps). Analysis itself needs the network, and the
 * offline screen says so rather than failing silently.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TrustTap AI — Scam Checker",
    short_name: "TrustTap",
    description:
      "Pause. Check. Protect. Check suspicious messages, screenshots and links for scam indicators, in English or Hindi.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#060b18",
    theme_color: "#060b18",
    lang: "en-IN",
    categories: ["security", "utilities", "education"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      { name: "Check a message", url: "/check/text" },
      { name: "I think I've been scammed", url: "/emergency" },
      { name: "India Safety Center", url: "/safety-center" },
    ],
  };
}
