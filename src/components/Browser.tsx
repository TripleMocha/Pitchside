"use client";
import { useEffect, useMemo, useState } from "react";
import { LayoutGrid, List, Search } from "lucide-react";
import SportIcon from "./SportIcon";
import HeroCarousel from "./Hero";
import { MatchCard, MatchRow, cap } from "./MatchCard";
import { dayDiff, dayLabel, effectiveTs, isStale } from "@/lib/time";
import { isLive, type Stream } from "@/lib/types";

const CardSkeleton = () => (
  <div>
    <div className="skeleton aspect-video rounded-xl" />
    <div className="skeleton mt-3 h-5 w-3/4 rounded" />
    <div className="skeleton mt-2 h-4 w-1/2 rounded" />
  </div>
);

export default function Browser() {
  const [streams, setStreams] = useState<Stream[] | null>(null);
  const [error, setError] = useState(false);
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const r = await fetch("/api/streams");
        if (!r.ok) throw new Error();
        const d = await r.json();
        if (alive) { setStreams(d.streams); setError(false); }
      } catch { if (alive) setError(true); }
    };
    load();
    const t = setInterval(load, 60_000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  const loading = streams === null && !error;
  const categories = useMemo(() => Array.from(new Set((streams ?? []).map((s) => s.category))), [streams]);
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: streams?.length ?? 0 };
    for (const s of streams ?? []) c[s.category] = (c[s.category] ?? 0) + 1;
    return c;
  }, [streams]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (streams ?? []).filter(
      (s) => (category === "all" || s.category === category) &&
        (!q || s.name.toLowerCase().includes(q) || s.league.toLowerCase().includes(q)),
    );
  }, [streams, category, query]);

  const live = useMemo(() => {
    const now = Date.now();
    // real matches first, then 24/7 channels
    return filtered.filter(isLive).sort((a, b) => Number(isStale(a, now)) - Number(isStale(b, now)) || a.match_timestamp - b.match_timestamp);
  }, [filtered]);
  const featured = useMemo(() => {
    const withArt = live.filter((s) => s.thumbnail_url);
    return (withArt.length ? withArt : live).slice(0, 6);
  }, [live]);

  // Today first, then tomorrow, then later dates; live streams with stale dates count as today.
  const groups = useMemo(() => {
    const now = Date.now();
    const m = new Map<number, { diff: number; ts: number; items: Stream[] }>();
    for (const s of filtered) {
      const ts = effectiveTs(s, now), diff = dayDiff(ts, now);
      if (!m.has(diff)) m.set(diff, { diff, ts, items: [] });
      m.get(diff)!.items.push(s);
    }
    const rank = (d: number) => (d >= 0 ? d : 10_000 - d);
    return [...m.values()].sort((a, b) => rank(a.diff) - rank(b.diff)).map((g) => ({
      ...g,
      label: dayLabel(g.ts, now),
      day: new Date(g.ts * 1000).getDate(),
      month: new Date(g.ts * 1000).toLocaleDateString([], { month: "short" }),
      items: g.items.sort((a, b) => Number(isLive(b)) - Number(isLive(a)) || effectiveTs(a, now) - effectiveTs(b, now)),
    }));
  }, [filtered]);

  const tab = (id: string, label: string) => (
    <button key={id} onClick={() => setCategory(id)} aria-pressed={category === id}
      className={`flex h-16 items-center gap-3 rounded-xl border px-4 text-left text-sm font-semibold transition-colors ${
        category === id ? "border-live/70 bg-live/10 text-white" : "border-line bg-panel/80 text-mute hover:bg-tile hover:text-white"}`}>
      <SportIcon category={id} className={`h-5 w-5 shrink-0 ${category === id ? "text-live" : ""}`} />
      <span className="flex-1 truncate">{label}</span>
      <span className="rounded-md bg-black/30 px-2 py-0.5 text-xs text-mute">{counts[id] ?? 0}</span>
    </button>
  );

  return (
    <div className="mt-8 space-y-10">
      {loading && <div className="skeleton h-[26rem] rounded-2xl sm:h-[24rem]" />}
      {featured.length > 0 && !query && <HeroCarousel items={featured} />}

      <div className="space-y-4">
        <div className="grid-fluid !gap-3" style={{ "--card": "170px" } as React.CSSProperties}>
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)
            : <>{tab("all", "All")}{categories.map((c) => tab(c, cap(c)))}</>}
        </div>
        <label className="relative block">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" aria-hidden />
          <input value={query} onChange={(e) => setQuery(e.target.value.slice(0, 60))} placeholder="Search match or league"
            aria-label="Search match or league" maxLength={60}
            className="h-12 w-full rounded-xl border border-line bg-panel/80 pl-11 pr-4 text-sm placeholder:text-mute focus:border-live/70 focus:outline-none" />
        </label>
      </div>

      {error && streams === null && <p className="text-sm text-mute">Matches couldn’t be loaded. Refresh to try again.</p>}
      {streams && filtered.length === 0 && <p className="text-sm text-mute">No matches found. Try another sport or search.</p>}

      {(loading || live.length > 0) && (
        <section>
          <h2 className="mb-4 flex items-center gap-3 text-2xl font-bold">
            Live now
            {!loading && <span className="rounded-md bg-live/15 px-2 py-0.5 text-sm font-semibold text-live">{live.length}</span>}
          </h2>
          <div className="grid-fluid">
            {loading ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
              : live.map((s) => <MatchCard key={s.stream_key} s={s} />)}
          </div>
        </section>
      )}

      {(loading || groups.length > 0) && (
        <section>
          <div className="mb-5 flex items-center justify-between border-b border-line pb-3">
            <h2 className="text-2xl font-bold">Matches</h2>
            <div className="flex gap-1.5">
              {([["grid", LayoutGrid], ["list", List]] as const).map(([v, Icon]) => (
                <button key={v} onClick={() => setView(v)} aria-label={`${v} view`} aria-pressed={view === v}
                  className={`rounded-md p-2 transition-colors ${view === v ? "bg-tile text-white" : "text-mute hover:text-white"}`}>
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
          {loading ? (
            <div className="grid-fluid">{Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}</div>
          ) : (
            <div className="space-y-10">
              {groups.map((g) => (
                <div key={g.diff} className="flex flex-col gap-4 md:flex-row md:gap-6">
                  <div className="flex shrink-0 items-baseline gap-3 md:w-24 md:flex-col md:gap-0 md:pt-1">
                    <p className="text-sm font-bold text-live">{g.label}</p>
                    <p className="text-4xl font-bold leading-tight">{g.day}</p>
                    <p className="text-xs font-semibold text-mute">{g.month}</p>
                  </div>
                  <div className={view === "grid" ? "grid-fluid flex-1" : "flex flex-1 flex-col gap-2"}>
                    {g.items.map((s) => view === "grid" ? <MatchCard key={s.stream_key} s={s} /> : <MatchRow key={s.stream_key} s={s} />)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
