"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Clock, Link2, Maximize, Radio, RectangleHorizontal, RotateCw } from "lucide-react";
import SportIcon from "./SportIcon";
import { Thumb, cap } from "./MatchCard";
import { timeLabel } from "@/lib/time";
import { safeEmbedUrl } from "@/lib/security";
import { isLive, type Stream } from "@/lib/types";

type State = { status: "loading" } | { status: "ready"; stream: Stream } | { status: "missing" } | { status: "error" };

const FIT = "min(100%, max(20rem, calc((100dvh - 14rem) * 16 / 9)))"; // keeps the player inside the viewport height

function countdown(ts: number, now: number) {
  const d = Math.max(0, Math.floor(ts - now / 1000));
  const h = Math.floor(d / 3600), m = Math.floor((d % 3600) / 60), s = d % 60;
  return d === 0 ? null : `${h > 0 ? `${h}h ` : ""}${m}m ${String(s).padStart(2, "0")}s`;
}

export default function Player({ streamKey }: { streamKey: string }) {
  const [state, setState] = useState<State>({ status: "loading" });
  const [picked, setPicked] = useState<string | null>(null);
  const [theater, setTheater] = useState(false);
  const [copied, setCopied] = useState(false);
  const [frameLoaded, setFrameLoaded] = useState(false);
  const [reload, setReload] = useState(0);
  const [related, setRelated] = useState<Stream[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const r = await fetch(`/api/streams/${encodeURIComponent(streamKey)}`);
        if (r.status === 404) { if (alive) setState({ status: "missing" }); return; }
        if (!r.ok) throw new Error();
        const stream: Stream = await r.json();
        if (alive) setState({ status: "ready", stream });
      } catch { if (alive) setState((s) => (s.status === "ready" ? s : { status: "error" })); }
    };
    load();
    const t = setInterval(load, 20_000);
    return () => { alive = false; clearInterval(t); };
  }, [streamKey]);

  const stream = state.status === "ready" ? state.stream : null;

  useEffect(() => {
    if (!stream) return;
    let alive = true;
    fetch(`/api/streams?category=${stream.category}`).then((r) => (r.ok ? r.json() : null)).then((d) => {
      if (alive && d) setRelated((d.streams as Stream[]).filter((s) => s.stream_key !== streamKey).sort((a, b) => Number(isLive(b)) - Number(isLive(a))).slice(0, 6));
    }).catch(() => {});
    return () => { alive = false; };
  }, [stream?.category, streamKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const live = stream ? isLive(stream) : false;
  useEffect(() => {
    if (!stream || live) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [stream, live]);

  const active = useMemo(() => {
    if (!stream) return null;
    return stream.sources.find((s) => s.url === picked) ?? stream.sources.find((s) => s.live) ?? stream.sources[0] ?? null;
  }, [stream, picked]);
  const src = active ? safeEmbedUrl(active.url) : null;
  useEffect(() => setFrameLoaded(false), [src, reload]);

  const copy = async () => {
    try { await navigator.clipboard.writeText(location.href); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {}
  };
  const eta = stream && !live ? countdown(stream.match_timestamp, now) : null;

  const btn = "flex items-center gap-2 rounded-lg border border-line bg-panel px-3.5 py-2 text-sm font-semibold text-mute transition-colors hover:bg-tile hover:text-white";

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <Link href="/" className={`${btn} shrink-0`} aria-label="Back to matches">
          <ArrowLeft className="h-4 w-4" aria-hidden /> <span className="hidden sm:inline">Back</span>
        </Link>
        <h1 className="min-w-0 truncate text-xl font-bold sm:text-3xl">{stream?.name ?? (state.status === "loading" ? "Loading…" : "Stream")}</h1>
        {stream && (live ? (
          <span className="flex items-center gap-1.5 rounded-md bg-live px-2.5 py-1 text-xs font-bold">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> LIVE
          </span>
        ) : (
          <span className="flex items-center gap-1.5 rounded-md bg-tile px-2.5 py-1 text-xs font-semibold text-mute">
            <Clock className="h-3.5 w-3.5" aria-hidden /> {eta ? `Starts in ${eta}` : "Waiting for stream"}
          </span>
        ))}
        {stream && (
          <p className="flex items-center gap-2 text-sm text-mute lg:ml-auto">
            <SportIcon category={stream.category} className="h-4 w-4" />
            {cap(stream.category)} | {stream.league || "—"} | {timeLabel(stream)}
          </p>
        )}
      </div>

      <div className={`grid gap-5 ${theater ? "" : "xl:grid-cols-[minmax(0,1fr)_380px] 2xl:grid-cols-[minmax(0,1fr)_440px]"}`}>
        <div className="min-w-0">
          <div className="mx-auto" style={{ width: FIT }}>
          <motion.div ref={box} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="glow relative aspect-video overflow-hidden rounded-2xl bg-black">
            {src ? (
              <>
                {!frameLoaded && <div className="skeleton absolute inset-0 flex items-center justify-center text-sm text-mute"><span className="relative z-10">Connecting to stream…</span></div>}
                <iframe key={`${src}-${reload}`} src={src} title={stream?.name ?? "Live stream"} onLoad={() => setFrameLoaded(true)}
                  className="absolute inset-0 h-full w-full border-0" allow="fullscreen; picture-in-picture" allowFullScreen />
              </>
            ) : (
              <div className="flex h-full items-center justify-center p-6 text-center text-sm text-mute">
                {state.status === "loading" && <div className="skeleton absolute inset-0" />}
                {state.status === "missing" && "This stream isn’t live. It goes up shortly before the match starts."}
                {state.status === "error" && "The stream couldn’t be loaded. Refresh to try again."}
                {state.status === "ready" && "No sources available yet."}
              </div>
            )}
          </motion.div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Stream quality">
              {stream?.sources.map((s) => (
                <button key={s.url} onClick={() => setPicked(s.url)} aria-pressed={active?.url === s.url}
                  className={`flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-bold transition-colors ${
                    active?.url === s.url ? "border-live bg-live/15 text-white" : "border-line bg-panel text-mute hover:text-white"}`}>
                  {s.quality}
                  <span className={`h-1.5 w-1.5 rounded-full ${s.live ? "bg-live" : "bg-mute/50"}`} />
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <button className={btn} onClick={() => setReload((n) => n + 1)}><RotateCw className="h-4 w-4" aria-hidden /> Reload</button>
              <button className={`${btn} hidden xl:flex`} onClick={() => setTheater((t) => !t)} aria-pressed={theater}>
                <RectangleHorizontal className="h-4 w-4" aria-hidden /> Theater
              </button>
              <button className={btn} onClick={() => box.current?.requestFullscreen?.()}><Maximize className="h-4 w-4" aria-hidden /> Fullscreen</button>
              <button className={btn} onClick={copy}>
                {copied ? <Check className="h-4 w-4 text-green-400" aria-hidden /> : <Link2 className="h-4 w-4" aria-hidden />} {copied ? "Copied" : "Copy link"}
              </button>
            </div>
          </div>
          </div>
        </div>

        <aside className="space-y-8">
          <div>
            <h2 className="mb-3 text-sm font-semibold text-mute">Stream sources</h2>
            <div className="rounded-2xl border border-line bg-panel">
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <span className="text-sm font-bold">Quality</span>
                <span className="rounded-full bg-live/15 px-2.5 py-0.5 text-[11px] font-semibold text-live">{stream?.sources.length ?? 0} streams</span>
              </div>
              <p className="px-4 py-3 text-xs text-mute">Pick a quality. Streams that aren’t live yet start on their own once the event goes live.</p>
              <ul>
                {stream?.sources.map((s, i) => {
                  const on = active?.url === s.url;
                  return (
                    <li key={s.url}>
                      <button onClick={() => setPicked(s.url)} aria-pressed={on}
                        className={`flex w-full items-center gap-3 border-l-2 px-4 py-3.5 text-left text-sm transition-colors ${on ? "border-live bg-live/10" : "border-transparent hover:bg-tile"}`}>
                        <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${s.quality === "SD" ? "bg-yellow-400/20 text-yellow-300" : "bg-live/25 text-red-300"}`}>{s.quality}</span>
                        <span className="flex-1 font-semibold">Stream {i + 1}</span>
                        <span className={`flex items-center gap-1.5 text-xs ${s.live ? "text-white" : "text-mute"}`}>
                          {s.live ? <Radio className="h-3.5 w-3.5" aria-hidden /> : <Clock className="h-3.5 w-3.5" aria-hidden />}
                          {s.live ? "Live" : "Starts soon"}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {related.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold text-mute">More {stream?.category}</h2>
              <ul className="space-y-3">
                {related.map((s) => (
                  <li key={s.stream_key}>
                    <Link href={`/watch/${s.stream_key}`} className="group flex items-center gap-3 rounded-xl p-1.5 transition-colors hover:bg-panel">
                      <div className="w-32 shrink-0"><Thumb s={s} className="aspect-video rounded-lg" /></div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold">{s.name}</p>
                        <p className="truncate text-xs text-mute">{s.league || "—"} | {timeLabel(s)}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
