/**
 * Store hours: Tue–Thu 11am–9pm, Fri–Sat 11am–10pm, Sun 12noon–9pm, Monday closed.
 * getDay(): 0 = Sunday, 1 = Monday, ..., 6 = Saturday.
 */
const HOURS: Record<number, { open: number; close: number } | null> = {
  0: { open: 12, close: 21 },   // Sun 12pm–9pm
  1: null,                       // Mon closed
  2: { open: 11, close: 21 },   // Tue 11am–9pm
  3: { open: 11, close: 21 },   // Wed
  4: { open: 11, close: 21 },   // Thu
  5: { open: 11, close: 22 },   // Fri 11am–10pm
  6: { open: 11, close: 22 },   // Sat
};

export const OPEN_DAYS = [0, 2, 3, 4, 5, 6] as const; // Sun, Tue–Sat
export const CLOSED_DAY = 1; // Monday

export function isOpenOnDay(dayOfWeek: number): boolean {
  return HOURS[dayOfWeek] != null;
}

export function getHoursForDay(dayOfWeek: number): { open: number; close: number } | null {
  return HOURS[dayOfWeek] ?? null;
}

/** Format hour (0–23) as "11:00 AM" etc. */
export function formatTimeSlot(hour: number, minute: number): string {
  const h = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const ampm = hour < 12 ? "AM" : "PM";
  const m = minute === 0 ? "00" : String(minute).padStart(2, "0");
  return `${h}:${m} ${ampm}`;
}

/** Get 15-min time slots for a given date; only future slots if date is today. */
export function getTimeSlotsForDate(date: Date): { value: string; label: string }[] {
  const day = date.getDay();
  const hours = getHoursForDay(day);
  if (!hours) return [];

  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const slots: { value: string; label: string }[] = [];
  for (let h = hours.open; h < hours.close; h++) {
    for (const m of [0, 15, 30, 45]) {
      const value = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      const slotDate = new Date(date);
      slotDate.setHours(h, m, 0, 0);
      if (isToday && slotDate <= now) continue;
      slots.push({ value, label: formatTimeSlot(h, m) });
    }
  }
  return slots;
}

/** Today in YYYY-MM-DD (local). */
export function getTodayDateString(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

/** Minimum date for date picker: next open day (today if open, else skip closed days). */
export function getMinScheduleDate(): string {
  const d = new Date();
  while (!isOpenOnDay(d.getDay())) {
    d.setDate(d.getDate() + 1);
  }
  return d.toISOString().slice(0, 10);
}

/** True if we're open today (for same-day schedule). */
export function isOpenToday(): boolean {
  return isOpenOnDay(new Date().getDay());
}

/** Check if a date string is an open day (not Monday). */
export function isDateOpen(dateStr: string): boolean {
  const d = new Date(dateStr + "T12:00:00");
  return isOpenOnDay(d.getDay());
}
