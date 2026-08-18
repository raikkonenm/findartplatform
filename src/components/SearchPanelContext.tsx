"use client";

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

type SearchPanelContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const SearchPanelContext = createContext<SearchPanelContextValue | null>(null);

export function SearchPanelProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <SearchPanelContext.Provider value={{ open, setOpen }}>
      {children}
    </SearchPanelContext.Provider>
  );
}

/**
 * Read the search-panel state. Returns a no-op fallback if used outside a
 * provider so the Header can render on pages that haven't wrapped the tree
 * yet without exploding.
 */
export function useSearchPanel(): SearchPanelContextValue {
  const value = useContext(SearchPanelContext);
  if (!value) {
    return { open: false, setOpen: () => {} };
  }
  return value;
}
