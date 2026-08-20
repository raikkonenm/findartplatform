export type DensityValue = "normal" | "dense";

export function DensityToggleButton({
  density,
  onCycle,
}: {
  density: DensityValue;
  onCycle: () => void;
}) {
  const isActive = density === "dense";

  return (
    <button
      type="button"
      onClick={onCycle}
      aria-label={`Feed density: ${density}. Tap to cycle.`}
      className={`shrink-0 p-2 transition-colors duration-200 ease-out ${
        isActive
          ? "text-neutral-900"
          : "text-neutral-500 hover:text-neutral-800"
      }`}
    >
      <svg
        width={16}
        height={16}
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="square"
        aria-hidden="true"
        className={`transition-transform duration-300 ease-out ${
          isActive ? "rotate-90" : "rotate-0"
        }`}
      >
        <line x1="3" y1="3" x2="3" y2="13" />
        <line x1="8" y1="3" x2="8" y2="13" />
        <line x1="13" y1="3" x2="13" y2="13" />
      </svg>
    </button>
  );
}
