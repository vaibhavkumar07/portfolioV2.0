/**
 * Fire-and-forget analytics beacon (client-side). sendBeacon survives page
 * unloads and needs no preflight; falls back to keepalive fetch. Never throws.
 */
export function track(event: string): void {
  try {
    const body = JSON.stringify({ event });
    if (
      typeof navigator !== "undefined" &&
      typeof navigator.sendBeacon === "function" &&
      navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }))
    ) {
      return;
    }
    void fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* analytics must never break the page */
  }
}
