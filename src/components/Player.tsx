"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Radio } from "lucide-react";
import { safeEmbedUrl } from "@/lib/security";
import type { Stream } from "@/lib/types";

type State = { status: "loading" } | { status: "ready"; stream: Stream } | { status: "missing" } | { status: "error" };

export default function Player({ streamKey }: { streamKey: string }) {
  const [state, setState] = useState<State>({ status: "loading" });
  const [picked, setPicked] = useState<string | null>(null);

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
    const t = setInterval(load, 20_000); // keeps live / starts-soon state in sync
    return () => { alive = false; clearInterval(t); };
  }, [streamKey]);

  const stream = state.status === "ready" ? state.stream : null;
  const active = useMemo(() => {
    if (!stream) return null;
    return stream.sources.find((s) => s.url === picked) ?? stream.sources.find((s) => s.live) ?? stream.sources[0] ?? null;
  }, [stream, picked]);
  const src = active ? safeEmbedUrl(active.url) : null;

  return (
    <div>
      <div className="relative mb-6 flex items-center justify-center border-b border-line pb-4">
        <Link href="/" className="absolute left-0 flex items-center gap-2 rounded-lg border border-line px-3 py-1.5 text-sm text-mute transition-colors hover:text-white">
          <ArrowLeft className="h-4 w-4" aria-hidden /> <span className="hidden sm:inline">Back to matches</span>
        </Link>
        <h1 className="max-w-[60%] truncate text-xl font-bold">{stream?.name ?? "Loading…"}</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="aspect-video overflow-hidden rounded-xl bg-black">
          {src ? (
            <iframe key={src} src={src} title={stream?.name ?? "Live stream"} className="h-full w-full border-0"
              allow="fullscreen; picture-in-picture" allowFullScreen />
          ) : (
            <div className="flex h-full items-center justify-center p-6 text-center text-sm text-mute">
              {state.status === "loading" && "Loading stream…"}
              {state.status === "missing" && "This stream isn’t live. It goes up shortly before the match starts."}
              {state.status === "error" && "The stream couldn’t be loaded. Refresh to try again."}
              {state.status === "ready" && "No sources available yet."}
            </div>
          )}
        </motion.div>

        <aside>
          <h2 className="mb-3 text-xs font-semibold text-mute">Stream sources</h2>
          <div className="rounded-xl border border-line bg-panel">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <span className="text-sm font-bold">Quality</span>
              <span className="rounded-full bg-live/15 px-2.5 py-0.5 text-[11px] font-semibold text-live">
                {stream?.sources.length ?? 0} streams
              </span>
            </div>
            <p className="px-4 py-3 text-xs text-mute">Pick a quality. Streams that aren’t live yet start on their own once the event goes live.</p>
            <ul>
              {stream?.sources.map((s, i) => {
                const on = active?.url === s.url;
                return (
                  <li key={s.url}>
                    <button onClick={() => setPicked(s.url)} aria-pressed={on}
                      className={`flex w-full items-center gap-3 border-l-2 px-4 py-3 text-left text-sm transition-colors ${
                        on ? "border-live bg-live/10" : "border-transparent hover:bg-tile"}`}>
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
          {stream && <p className="mt-3 text-xs text-mute">{stream.league}</p>}
        </aside>
      </div>
    </div>
  );
}
