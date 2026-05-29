export type MailDateGroupKey = "today" | "yesterday" | "thisWeek" | "older";

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function diffInDays(a: Date, b: Date) {
  const ms = startOfDay(a).getTime() - startOfDay(b).getTime();
  return Math.floor(ms / (24 * 60 * 60 * 1000));
}

function startOfWeek(date: Date) {
  // Monday as week start
  const d = startOfDay(date);
  const day = d.getDay(); // 0..6 (Sun..Sat)
  const delta = (day + 6) % 7; // Mon=0 ... Sun=6
  d.setDate(d.getDate() - delta);
  return d;
}

export function getMailDateGroupKey(dateIso: string): MailDateGroupKey {
  const date = new Date(dateIso);
  const now = new Date();
  const daysAgo = diffInDays(now, date);

  if (daysAgo === 0) return "today";
  if (daysAgo === 1) return "yesterday";

  const thisWeekStart = startOfWeek(now).getTime();
  if (startOfDay(date).getTime() >= thisWeekStart) return "thisWeek";

  return "older";
}

