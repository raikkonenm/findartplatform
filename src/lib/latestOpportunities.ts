import { OPPORTUNITIES } from "@/data/opportunities";

// Match the archive: a date-only deadline stays open through that day.
export function opportunityToday(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function getLatestOpportunities(today: string) {
  return OPPORTUNITIES
    .filter((opportunity) => opportunity.deadlineDate >= today)
    .sort((a, b) => a.deadlineDate.localeCompare(b.deadlineDate))
    .slice(0, 4);
}
