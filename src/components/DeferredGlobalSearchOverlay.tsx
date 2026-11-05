"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useSearchPanel } from "./SearchPanelContext";

const SearchOverlay = dynamic(
  () => import("./GlobalSearchOverlay").then((module) => module.GlobalSearchOverlay),
  { ssr: false },
);

export function DeferredGlobalSearchOverlay() {
  const { open } = useSearchPanel();
  const [requested, setRequested] = useState(false);

  // Load the search UI and build its index on first use. Keep it mounted
  // afterwards so closing/reopening still preserves the current query.
  if (open && !requested) setRequested(true);

  return requested ? <SearchOverlay /> : null;
}
