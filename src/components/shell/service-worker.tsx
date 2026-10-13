"use client";

import { useEffect } from "react";

/**
 * Registers the service worker after load.
 *
 * Registration is skipped in development so a stale cache can never mask a code
 * change during local work, and the whole thing is best-effort — the app is fully
 * functional without a service worker.
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Offline support is a bonus; failing to register changes nothing else.
      });
    };

    if (document.readyState === "complete") {
      register();
      return;
    }
    window.addEventListener("load", register);
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
