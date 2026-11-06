/** Input validation, host allow-lists and a small in-memory rate limiter. */
export const KEY_RE = /^[a-z0-9][a-z0-9._-]{0,120}$/i;
export const CAT_RE = /^[a-z]{2,24}$/;
const EMBED_HOSTS = new Set(["strmfree.st", "streamfree.top"]);
const IMG_HOSTS = new Set(["streamfree.top", "strmfree.st"]);

function safeUrl(raw: unknown, hosts: Set<string>): string | null {
  if (typeof raw !== "string" || raw.length > 500) return null;
  try {
    const u = new URL(raw);
    return u.protocol === "https:" && hosts.has(u.hostname) ? u.toString() : null;
  } catch { return null; }
}
export const safeEmbedUrl = (u: unknown) => safeUrl(u, EMBED_HOSTS);
export const safeImageUrl = (u: unknown) => safeUrl(u, IMG_HOSTS);

const hits = new Map<string, { n: number; reset: number }>();
export function rateLimit(ip: string, limit = 90, windowMs = 60_000): boolean {
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || h.reset < now) {
    hits.set(ip, { n: 1, reset: now + windowMs });
    if (hits.size > 5000) for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
    return true;
  }
  return ++h.n <= limit;
}
export function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
}
