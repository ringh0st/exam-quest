/** A local time of day, `HH:MM` (24 h). */
export type TimeOfDay = string;

export function toMinutes(time: TimeOfDay): number {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time);
  if (!match) throw new Error(`Invalid time "${time}"`);
  return Number(match[1]) * 60 + Number(match[2]);
}

/** True if `time` falls in [start, end); ranges may wrap past midnight (22:00–07:00). */
export function isWithin(time: TimeOfDay, range: { start: TimeOfDay; end: TimeOfDay }): boolean {
  const t = toMinutes(time);
  const start = toMinutes(range.start);
  const end = toMinutes(range.end);
  return start <= end ? t >= start && t < end : t >= start || t < end;
}
