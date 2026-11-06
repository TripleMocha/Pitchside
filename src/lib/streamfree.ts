import "server-only";
import { CAT_RE, KEY_RE, safeEmbedUrl, safeImageUrl } from "./security";
import type { Source, Stream } from "./types";

const BASE = "https://streamfree.top/api/v1";
const QUALITIES = new Set(["SD", "HD", "FHD", "4K"]);
const str = (v: unknown, max = 120) => (typeof v === "string" ? v.slice(0, max) : "");

/** Cached upstream fetch: Next's data cache keeps us off the upstream on every request. */
async function upstream(path: string, revalidate: number) {
  const res = await fetch(`${BASE}${path}`, {
    next: { revalidate },
    signal: AbortSignal.timeout(8000),
    headers: { Accept: "application/json" },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Upstream ${res.status}`);
  return res.json();
}

/** Never trust upstream: validate shape, drop unknown hosts, clamp strings. */
function clean(raw: any): Stream | null {
  if (!raw || typeof raw !== "object") return null;
  const key = str(raw.stream_key);
  const category = str(raw.category, 24).toLowerCase();
  if (!KEY_RE.test(key) || !CAT_RE.test(category)) return null;
  const sources: Source[] = (Array.isArray(raw.sources) ? raw.sources : [])
    .map((s: any) => {
      const url = safeEmbedUrl(s?.url);
      return url && QUALITIES.has(s?.quality) ? { quality: s.quality, url, live: s.live === true } : null;
    })
    .filter(Boolean);
  const ts = Number(raw.match_timestamp);
  return {
    name: str(raw.name) || key,
    category,
    league: str(raw.league),
    stream_key: key,
    match_timestamp: Number.isFinite(ts) ? ts : 0,
    sources,
    thumbnail_url: safeImageUrl(raw.thumbnail_url) ?? undefined,
  };
}

export async function getStreams(category?: string): Promise<Stream[]> {
  const q = category && CAT_RE.test(category) ? `?category=${category}` : "";
  const data = await upstream(`/streams${q}`, 60);
  const list: unknown[] = Array.isArray(data?.streams) ? data.streams : [];
  return list.map(clean).filter((s): s is Stream => !!s).sort((a, b) => a.match_timestamp - b.match_timestamp);
}

export async function getStream(key: string): Promise<Stream | null> {
  if (!KEY_RE.test(key)) return null;
  const data = await upstream(`/streams/${encodeURIComponent(key)}`, 15);
  return data ? clean(data) : null;
}
