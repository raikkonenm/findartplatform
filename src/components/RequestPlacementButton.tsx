"use client";

import { requestAdvertisingPlacement } from "./AdvertisingRequestForm";

/**
 * Small client-side anchor that lives inside the server-rendered
 * PlacementCard. On click it dispatches the shared "request placement"
 * event — AdvertisingRequestForm listens for it and smooth-scrolls
 * itself into view with the right format preselected.
 */
export function RequestPlacementButton({
  format,
}: {
  format: "billboard" | "pinned-feed";
}) {
  return (
    <button
      type="button"
      onClick={() => requestAdvertisingPlacement(format)}
      className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-neutral-900 transition-opacity hover:opacity-55"
    >
      Request this placement <span aria-hidden="true">↗</span>
    </button>
  );
}
