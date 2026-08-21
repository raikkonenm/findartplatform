// Visibility flags for header/nav items. Flip these to restore an item.
// Components that render nav links are expected to gate the Practice
// link with `SHOW_PRACTICE_NAV` so it can be hidden site-wide from one
// place without deleting any JSX or routes.
export const SHOW_PRACTICE_NAV = false;

// Hides the Collect tab everywhere (header nav, mobile menu, footer,
// home nav) without touching /collect page files or data. Flip to
// `true` to bring it back.
export const SHOW_COLLECT_NAV = false;
