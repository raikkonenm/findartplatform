// Default slot content for the `@modal` parallel route.
// Returns null when no intercepting route is active, so direct visits to any
// non-intercepted URL (or the homepage) render no overlay.
export default function ModalDefault() {
  return null;
}
