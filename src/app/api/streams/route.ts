import { NextResponse } from "next/server";
import { getStreams } from "@/lib/streamfree";
import { CAT_RE, clientIp, rateLimit } from "@/lib/security";

export async function GET(req: Request) {
  if (!rateLimit(clientIp(req))) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const category = new URL(req.url).searchParams.get("category") ?? undefined;
  if (category && !CAT_RE.test(category)) return NextResponse.json({ error: "Bad category" }, { status: 400 });
  try {
    const streams = await getStreams(category);
    return NextResponse.json({ streams }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } });
  } catch {
    return NextResponse.json({ error: "Upstream unavailable" }, { status: 502 });
  }
}
