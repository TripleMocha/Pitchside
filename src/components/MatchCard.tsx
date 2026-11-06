"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import SportIcon from "./SportIcon";
import { isLive, type Stream } from "@/lib/types";

export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
export const fmtTime = (ts: number) =>
  new Date(ts * 1000).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
const fmtDay = (ts: number) => new Date(ts * 1000).toLocaleDateString([], { month: "short", day: "numeric" });

function Thumb({ s }: { s: Stream }) {
  const [broken, setBroken] = useState(false);
  const [a, b] = s.name.split(/\s+vs\.?\s+/i);
  return (
    <div className="relative aspect-video overflow-hidden rounded-lg bg-tile">
      {s.thumbnail_url && !broken ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={s.thumbnail_url} alt="" loading="lazy" onError={() => setBroken(true)}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
      ) : (
        <div className="flex h-full items-center justify-center gap-3 px-4 text-center">
          <SportIcon category={s.category} className="h-6 w-6 text-mute" />
          <span className="line-clamp-2 text-sm font-semibold text-mute">{b ? `${a} · ${b}` : s.name}</span>
        </div>
      )}
      <span className="absolute left-2.5 top-2.5 rounded bg-black/70 px-2 py-0.5 text-[11px] font-semibold">
        {fmtDay(s.match_timestamp)}
      </span>
      {isLive(s) && (
        <span className="absolute right-2.5 top-2.5 flex items-center gap-1.5 rounded bg-live px-2 py-0.5 text-[11px] font-bold">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> LIVE
        </span>
      )}
    </div>
  );
}

export function MatchCard({ s }: { s: Stream }) {
  return (
    <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
      <Link href={`/watch/${s.stream_key}`} className="group block">
        <Thumb s={s} />
        <h3 className="mt-2.5 truncate text-sm font-semibold">{s.name}</h3>
        <p className="truncate text-xs text-mute">{cap(s.category)} | {s.league || "—"} | {fmtTime(s.match_timestamp)}</p>
      </Link>
    </motion.div>
  );
}

export function MatchRow({ s }: { s: Stream }) {
  return (
    <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      <Link href={`/watch/${s.stream_key}`}
        className="flex items-center gap-4 rounded-lg bg-panel px-4 py-3 transition-colors hover:bg-tile">
        <SportIcon category={s.category} className="h-5 w-5 shrink-0 text-mute" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{s.name}</p>
          <p className="truncate text-xs text-mute">{cap(s.category)} | {s.league || "—"}</p>
        </div>
        {isLive(s) ? (
          <span className="rounded bg-live px-2 py-0.5 text-[11px] font-bold">LIVE</span>
        ) : (
          <span className="text-xs text-mute">{fmtTime(s.match_timestamp)}</span>
        )}
      </Link>
    </motion.div>
  );
}
