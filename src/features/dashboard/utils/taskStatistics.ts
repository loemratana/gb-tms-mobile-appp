const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export type MonthlyTaskCount = {
  /** Zero-based month index, 0 = January. */
  month: number;
  label: string;
  count: number;
};

/** Labels server month counts (index 0 = January). Always returns all 12 months. */
export function toMonthlyTaskCounts(months: readonly number[] | undefined): MonthlyTaskCount[] {
  return MONTH_LABELS.map((label, month) => ({ month, label, count: months?.[month] ?? 0 }));
}
