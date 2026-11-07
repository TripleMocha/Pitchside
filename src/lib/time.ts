import { isLive, type Stream } from "./types";

const HALF_DAY = 12 * 3600;

/** A live stream whose scheduled time is far from now (24/7 channels, stale timestamps). */
export const isStale = (s: Stream, now = Date.now()) => isLive(s) && Math.abs(s.match_timestamp - now / 1000) > HALF_DAY;
/** Live streams with a stale schedule are treated as happening today. */
export const effectiveTs = (s: Stream, now = Date.now()) => (isStale(s, now) ? now / 1000 : s.match_timestamp);

export function dayDiff(ts: number, now = Date.now()) {
  const a = new Date(ts * 1000); a.setHours(0, 0, 0, 0);
  const b = new Date(now); b.setHours(0, 0, 0, 0);
  return Math.round((a.getTime() - b.getTime()) / 864e5);
}
export function dayLabel(ts: number, now = Date.now()) {
  const d = dayDiff(ts, now);
  return d === 0 ? "Today" : d === 1 ? "Tomorrow" : new Date(ts * 1000).toLocaleDateString([], { weekday: "short" });
}
export function chipLabel(s: Stream, now = Date.now()) {
  const ts = effectiveTs(s, now), d = dayDiff(ts, now);
  return d === 0 ? "Today" : d === 1 ? "Tomorrow" : new Date(ts * 1000).toLocaleDateString([], { month: "short", day: "numeric" });
}
export const fmtClock = (ts: number) => new Date(ts * 1000).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
export const timeLabel = (s: Stream, now = Date.now()) => (isStale(s, now) ? "Live channel" : fmtClock(s.match_timestamp));
