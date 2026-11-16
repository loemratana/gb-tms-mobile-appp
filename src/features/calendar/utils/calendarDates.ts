/** Local-time `YYYY-MM-DD` key, matching the API's date-only `dueDate` format. */
export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export function isSameDay(a: Date, b: Date): boolean {
  return toDateKey(a) === toDateKey(b);
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/** True when `dateKey` ("YYYY-MM-DD") falls in the month containing `monthDate`. */
export function isInMonth(dateKey: string, monthDate: Date): boolean {
  return dateKey.startsWith(toDateKey(monthDate).slice(0, 7));
}

/** Monday-to-Sunday week containing `referenceDate`. */
function getWeekDays(referenceDate: Date): Date[] {
  const day = referenceDate.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = addDays(referenceDate, mondayOffset);
  return Array.from({ length: 7 }, (_, index) => addDays(monday, index));
}

function getIsoWeekNumber(date: Date): number {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  return Math.ceil(((target.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/** e.g. "Week 51, December 18 - 24" for the Mon–Sun week containing `referenceDate`. */
export function formatWeekDividerLabel(referenceDate: Date): string {
  const days = getWeekDays(referenceDate);
  const start = days[0];
  const end = days[6];
  const startLabel = start.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  const endLabel =
    start.getMonth() === end.getMonth()
      ? `${end.getDate()}`
      : end.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  return `Week ${getIsoWeekNumber(start)}, ${startLabel} - ${endLabel}`;
}
