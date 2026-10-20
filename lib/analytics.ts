import { Transaction } from "@/types/database";

export function filterTransactionsByPeriod(
  transactions: Transaction[],
  period: string = "this_month",
  startDateParam?: string | null,
  endDateParam?: string | null
): { filtered: Transaction[]; daysInPeriod: number } {
  const now = new Date();
  let filtered = [...transactions];
  let daysInPeriod = 1;

  if (period === "today") {
    const todayStr = now.toISOString().split("T")[0];
    filtered = filtered.filter((t) => t.date.startsWith(todayStr));
    daysInPeriod = 1;
  } else if (period === "this_week") {
    const dayOfWeek = now.getDay() || 7; // Monday = 1
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek + 1);
    startOfWeek.setHours(0, 0, 0, 0);
    filtered = filtered.filter((t) => new Date(t.date) >= startOfWeek);
    daysInPeriod = Math.max(1, dayOfWeek);
  } else if (period === "this_month") {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);
    filtered = filtered.filter((t) => new Date(t.date) >= startOfMonth);
    daysInPeriod = Math.max(1, now.getDate());
  } else if (period === "custom" && (startDateParam || endDateParam)) {
    const start = startDateParam ? new Date(startDateParam) : new Date(0);
    start.setHours(0, 0, 0, 0);
    const end = endDateParam ? new Date(endDateParam) : new Date();
    end.setHours(23, 59, 59, 999);

    filtered = filtered.filter((t) => {
      const d = new Date(t.date);
      return d >= start && d <= end;
    });

    const diffMs = Math.abs(end.getTime() - start.getTime());
    daysInPeriod = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  }

  return { filtered, daysInPeriod };
}
