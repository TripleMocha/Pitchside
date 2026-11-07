"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { cap } from "./MatchCard";
import type { Stream } from "@/lib/types";

export default function Hero({ s }: { s: Stream }) {
  return (
    <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      className="glow relative overflow-hidden rounded-2xl bg-panel">
      {s.thumbnail_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={s.thumbnail_url} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-2xl" />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/80 to-transparent" />
      <div className="relative flex flex-col items-start gap-6 p-6 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-md bg-live px-2.5 py-1 text-xs font-bold">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> LIVE NOW
          </span>
          <h2 className="mt-4 text-3xl font-bold leading-tight sm:text-5xl">{s.name}</h2>
          <p className="mt-2 text-base text-mute sm:text-lg">{cap(s.category)}{s.league ? ` | ${s.league}` : ""}</p>
          <Link href={`/watch/${s.stream_key}`}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-live px-6 py-3 text-base font-bold transition hover:brightness-110">
            <Play className="h-5 w-5 fill-white" aria-hidden /> Watch now
          </Link>
        </div>
        {s.thumbnail_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={s.thumbnail_url} alt="" className="hidden aspect-video w-[min(38vw,560px)] rounded-xl object-cover ring-1 ring-line lg:block" />
        )}
      </div>
    </motion.section>
  );
}
