"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { Play } from "lucide-react";
import SportIcon from "./SportIcon";
import { chipLabel, timeLabel } from "@/lib/time";
import { isLive, type Stream } from "@/lib/types";

export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function Thumb({ s, className = "aspect-video rounded-xl" }: { s: Stream; className?: string }) {
  const [broken, setBroken] = useState(false);
  const [a, b] = s.name.split(/\s+vs\.?\s+/i);
  return (
    <div className={`relative overflow-hidden bg-tile ${className}`}>
      {s.thumbnail_url && !broken ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={s.thumbnail_url} alt="" loading="lazy" onError={() => setBroken(true)}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
      ) : (
        <div className="flex h-full items-center justify-center gap-3 px-4 text-center">
          <SportIcon category={s.category} className="h-6 w-6 text-mute" />
          <span className="line-clamp-2 text-sm font-semibold text-mute">{b ? `${a} · ${b}` : s.name}</span>
        </div>
      )}
      <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-live"><Play className="h-5 w-5 fill-white" /></span>
      </div>
      <span className="absolute left-2.5 top-2.5 rounded-md bg-black/70 px-2 py-0.5 text-[11px] font-semibold">{chipLabel(s)}</span>
      {isLive(s) && (
        <span className="absolute right-2.5 top-2.5 flex items-center gap-1.5 rounded-md bg-live px-2 py-0.5 text-[11px] font-bold">
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
        <h3 className="mt-3 truncate text-lg font-bold">{s.name}</h3>
        <p className="truncate text-sm text-mute">{cap(s.category)} | {s.league || "—"} | {timeLabel(s)}</p>
      </Link>
    </motion.div>
  );
}

export function MatchRow({ s }: { s: Stream }) {
  return (
    <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      <Link href={`/watch/${s.stream_key}`}
        className="flex items-center gap-4 rounded-xl bg-panel px-4 py-3.5 transition-colors hover:bg-tile">
        <SportIcon category={s.category} className="h-5 w-5 shrink-0 text-mute" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold">{s.name}</p>
          <p className="truncate text-sm text-mute">{cap(s.category)} | {s.league || "—"}</p>
        </div>
        {isLive(s) ? (
          <span className="rounded-md bg-live px-2 py-0.5 text-[11px] font-bold">LIVE</span>
        ) : (
          <span className="text-sm text-mute">{timeLabel(s)}</span>
        )}
      </Link>
    </motion.div>
  );
}
