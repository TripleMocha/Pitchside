"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { cap } from "./MatchCard";
import type { Stream } from "@/lib/types";

/** Auto-advancing carousel of the top live streams. Pauses on hover/focus. */
export default function HeroCarousel({ items }: { items: Stream[] }) {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);
  const n = items.length;
  const go = (d: number) => { setDir(d); setI((x) => (x + d + n) % n); };

  useEffect(() => {
    if (paused || n < 2) return;
    const t = setInterval(() => { setDir(1); setI((x) => (x + 1) % n); }, 6500);
    return () => clearInterval(t);
  }, [paused, n, i]);

  if (n === 0) return null;
  const s = items[Math.min(i, n - 1)];
  const arrow = "absolute top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-black/50 p-2.5 transition hover:bg-live sm:block";

  return (
    <section role="region" aria-roledescription="carousel" aria-label="Top live now"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}
      className="glow relative h-[26rem] overflow-hidden rounded-2xl bg-panel sm:h-[24rem]">
      <AnimatePresence initial={false} custom={dir} mode="popLayout">
        <motion.div key={s.stream_key} custom={dir}
          variants={{ enter: (d: number) => ({ x: d * 60, opacity: 0 }), center: { x: 0, opacity: 1 }, exit: (d: number) => ({ x: d * -60, opacity: 0 }) }}
          initial="enter" animate="center" exit="exit" transition={{ duration: 0.45, ease: "easeOut" }}
          className="absolute inset-0">
          {s.thumbnail_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={s.thumbnail_url} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-2xl" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/80 to-transparent" />
          <div className="relative flex h-full flex-col justify-center gap-6 px-6 sm:px-14 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-md bg-live px-2.5 py-1 text-xs font-bold">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> LIVE NOW
              </span>
              <h2 className="mt-4 line-clamp-2 text-3xl font-bold leading-tight sm:text-5xl">{s.name}</h2>
              <p className="mt-2 text-base text-mute sm:text-lg">{cap(s.category)}{s.league ? ` | ${s.league}` : ""}</p>
              <Link href={`/watch/${s.stream_key}`}
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-live px-6 py-3 text-base font-bold transition hover:brightness-110">
                <Play className="h-5 w-5 fill-white" aria-hidden /> Watch now
              </Link>
            </div>
            {s.thumbnail_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.thumbnail_url} alt="" className="hidden aspect-video w-[min(36vw,540px)] rounded-xl object-cover ring-1 ring-line lg:block" />
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {n > 1 && (
        <>
          <button onClick={() => go(-1)} aria-label="Previous" className={`${arrow} left-3`}><ChevronLeft className="h-5 w-5" /></button>
          <button onClick={() => go(1)} aria-label="Next" className={`${arrow} right-3`}><ChevronRight className="h-5 w-5" /></button>
          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
            {items.map((x, k) => (
              <button key={x.stream_key} aria-label={`Show ${x.name}`} aria-current={k === i}
                onClick={() => { setDir(k > i ? 1 : -1); setI(k); }}
                className={`h-1.5 rounded-full transition-all ${k === i ? "w-8 bg-live" : "w-3 bg-white/30 hover:bg-white/60"}`} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
