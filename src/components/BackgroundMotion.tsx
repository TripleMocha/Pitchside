"use client";
import { motion, useReducedMotion } from "framer-motion";
import { Activity, CircleDot, Dribbble, Flag, Swords, Trophy } from "lucide-react";

const ITEMS = [
  { Icon: CircleDot, left: "6%", top: "14%", size: 220, d: 26, r: 10 },
  { Icon: Trophy, left: "82%", top: "10%", size: 190, d: 30, r: -8 },
  { Icon: Dribbble, left: "72%", top: "58%", size: 260, d: 34, r: 12 },
  { Icon: Flag, left: "12%", top: "64%", size: 170, d: 28, r: -10 },
  { Icon: Activity, left: "46%", top: "36%", size: 150, d: 32, r: 6 },
  { Icon: Swords, left: "30%", top: "86%", size: 180, d: 36, r: -6 },
];

/** Very faint floating sport icons. Static when the user prefers reduced motion. */
export default function BackgroundMotion() {
  const still = useReducedMotion();
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -right-40 -top-40 h-[40rem] w-[40rem] rounded-full bg-live/10 blur-[140px]" />
      {ITEMS.map(({ Icon, left, top, size, d, r }, i) => (
        <motion.div key={i} className="absolute text-white/[0.035]" style={{ left, top }}
          animate={still ? undefined : { y: [0, -36, 0], rotate: [0, r, 0] }}
          transition={{ duration: d, repeat: Infinity, ease: "easeInOut", delay: i * 1.5 }}>
          <Icon width={size} height={size} strokeWidth={0.75} />
        </motion.div>
      ))}
    </div>
  );
}
