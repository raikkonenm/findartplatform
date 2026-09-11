"use client";

import { useEffect, useState } from "react";

/**
 * Small red "N days left" line rendered under a deadline. Recomputes
 * on mount (so SSR and hydration don't fight) and once an hour after,
 * so a tab left open across midnight updates the counter without a
 * refresh.
 */
function computeLabel(isoDate: string, today: Date): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const target = new Date(year, month - 1, day);
  const diffDays = Math.round(
    (target.getTime() - startOfToday.getTime()) / 86_400_000,
  );
  if (diffDays < 0) return "Closed";
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day left";
  return `${diffDays} days left`;
}

type DaysLeftBadgeProps = {
  deadlineDate: string;
  className?: string;
};

export function DaysLeftBadge({
  deadlineDate,
  className = "",
}: DaysLeftBadgeProps) {
  // `null` on SSR / first client render → no text, no hydration mismatch.
  // The real value lands after mount.
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    const recompute = () => setLabel(computeLabel(deadlineDate, new Date()));
    recompute();
    const interval = window.setInterval(recompute, 60 * 60 * 1000);
    return () => window.clearInterval(interval);
  }, [deadlineDate]);

  if (!label) return null;

  return (
    <span className={`text-red-600 ${className}`}>
      {label}
    </span>
  );
}
