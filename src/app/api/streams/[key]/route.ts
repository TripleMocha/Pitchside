import { NextResponse } from "next/server";
import { getStream } from "@/lib/streamfree";
import { KEY_RE, clientIp, rateLimit } from "@/lib/security";

export async function GET(req: Request, { params }: { params: Promise<{ key: string }> }) {
  if (!rateLimit(clientIp(req))) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const { key } = await params;
  if (!KEY_RE.test(key)) return NextResponse.json({ error: "Bad key" }, { status: 400 });
  try {
    const stream = await getStream(key);
    if (!stream) return NextResponse.json({ error: "Not live" }, { status: 404 });
    return NextResponse.json(stream, { headers: { "Cache-Control": "public, s-maxage=15, stale-while-revalidate=30" } });
  } catch {
    return NextResponse.json({ error: "Upstream unavailable" }, { status: 502 });
  }
}
