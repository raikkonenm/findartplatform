type IconProps = { className?: string };

export function ExternalArrowIcon({ className = "h-[0.9em] w-[0.9em]" }: IconProps) {
  return (
    <svg
      viewBox="0 0 12 12"
      className={`inline-block shrink-0 align-[-0.08em] ${className}`}
      fill="none"
      aria-hidden="true"
    >
      <path d="M4 1h7v7M11 1 3 9" stroke="currentColor" strokeWidth="1.35" />
    </svg>
  );
}

export function ArrowRightIcon({ className = "h-[0.9em] w-[0.9em]" }: IconProps) {
  return (
    <svg
      viewBox="0 0 12 12"
      className={`inline-block shrink-0 align-[-0.08em] ${className}`}
      fill="none"
      aria-hidden="true"
    >
      <path d="M1 6h9M7 2.5 10.5 6 7 9.5" stroke="currentColor" strokeWidth="1.35" />
    </svg>
  );
}

export function ChevronIcon({
  direction,
  className = "h-[0.8em] w-[0.8em]",
}: IconProps & { direction: "up" | "down" }) {
  return (
    <svg
      viewBox="0 0 10 10"
      className={`inline-block shrink-0 align-[-0.08em] ${className}`}
      fill="none"
      aria-hidden="true"
    >
      <path
        d={direction === "up" ? "M1.5 6.5 5 3l3.5 3.5" : "M1.5 3.5 5 7l3.5-3.5"}
        stroke="currentColor"
        strokeWidth="1.35"
      />
    </svg>
  );
}

export function CloseIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={`inline-block shrink-0 ${className}`}
      fill="none"
      aria-hidden="true"
    >
      <path d="m2.5 2.5 11 11m0-11-11 11" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}
