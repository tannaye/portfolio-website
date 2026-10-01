/**
 * Usage analytics via Umami Cloud (cookieless, no consent banner needed).
 *
 * Always call `track()` rather than Umami's `data-umami-event` attributes: on
 * same-tab links those make Umami cancel the click and hard-reload the page,
 * which breaks smooth scrolling and the page-transition curtain.
 */

type EventData = Record<string, string | number | boolean>;

declare global {
  interface Window {
    umami?: { track: (event: string, data?: EventData) => void };
  }
}

export function track(event: string, data?: EventData) {
  try {
    window.umami?.track(event, data);
  } catch {
    // Analytics must never break the site.
  }
}

/** Track an event at most once per page load (e.g. "reached this section"). */
const seen = new Set<string>();
export function trackOnce(event: string, data?: EventData) {
  const key = event + JSON.stringify(data ?? {});
  if (seen.has(key)) return;
  seen.add(key);
  track(event, data);
}
