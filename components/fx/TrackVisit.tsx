"use client";

import { useEffect } from "react";
import { track } from "@/lib/track";

/** Counts one visit per browser session. Renders nothing. */
export default function TrackVisit() {
  useEffect(() => {
    try {
      // Set the flag BEFORE sending so StrictMode's double-invoked effect
      // can't fire the beacon twice.
      if (sessionStorage.getItem("pv")) return;
      sessionStorage.setItem("pv", "1");
    } catch {
      // Storage unavailable (private mode) — skip rather than double count.
      return;
    }
    track("visit");
  }, []);

  return null;
}
