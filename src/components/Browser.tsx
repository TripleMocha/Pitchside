"use client";
import { useEffect, useMemo, useState } from "react";
import { LayoutGrid, List, Search } from "lucide-react";
import SportIcon from "./SportIcon";
import Hero from "./Hero";
import { MatchCard, MatchRow, cap } from "./MatchCard";
import { isLive, type Stream } from "@/lib/types";

const dayLabel = (ts: number) => {
  const d = new Date(ts * 1000), t = new Date();
  const tomorrow = new Date(t.getTime() + 864e5);
  if (d.toDateString() === t.toDateString()) return "Today";
  if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return d.toLocaleDateString([], { weekday: "short" });
};

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

  const live = filtered.filter(isLive);
  const featured = live.find((s) => s.thumbnail_url) ?? live[0];
  const groups = useMemo(() => {
    const m = new Map<string, { label: string; day: number; items: Stream[] }>();
    for (const s of filtered) {
      const d = new Date(s.match_timestamp * 1000);
      const key = d.toDateString();
      if (!m.has(key)) m.set(key, { label: dayLabel(s.match_timestamp), day: d.getDate(), items: [] });
      m.get(key)!.items.push(s);
    }
    return [...m.values()];
  }, [filtered]);

  const tab = (id: string, label: string) => (
    <button key={id} onClick={() => setCategory(id)} aria-pressed={category === id}
      className={`flex h-24 w-28 shrink-0 flex-col items-center justify-center gap-1.5 rounded-xl border text-sm font-semibold transition-colors sm:h-28 sm:w-32 ${
        category === id ? "border-live/70 bg-live/10 text-white" : "border-line bg-panel text-mute hover:bg-tile hover:text-white"}`}>
      <SportIcon category={id} className={`h-6 w-6 ${category === id ? "text-live" : ""}`} />
      {label}
      <span className="text-[11px] font-medium text-mute">{counts[id] ?? 0}</span>
    </button>
  );

  return (
    <div className="mt-8 space-y-10">
      {loading && <div className="skeleton h-64 rounded-2xl sm:h-72" />}
      {featured && !query && <Hero s={featured} />}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-24 w-28 shrink-0 rounded-xl sm:h-28 sm:w-32" />)
            : <>{tab("all", "All")}{categories.map((c) => tab(c, cap(c)))}</>}
        </div>
        <label className="relative block w-full lg:w-96">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" aria-hidden />
          <input value={query} onChange={(e) => setQuery(e.target.value.slice(0, 60))} placeholder="Search match or league"
            aria-label="Search match or league" maxLength={60}
            className="h-12 w-full rounded-xl border border-line bg-panel pl-11 pr-4 text-sm placeholder:text-mute focus:border-live/70 focus:outline-none" />
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
                <div key={g.label + g.day} className="flex flex-col gap-4 md:flex-row md:gap-6">
                  <div className="flex shrink-0 items-baseline gap-3 md:w-24 md:flex-col md:gap-0 md:pt-1">
                    <p className="text-sm font-bold text-live">{g.label}</p>
                    <p className="text-4xl font-bold leading-tight">{g.day}</p>
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
