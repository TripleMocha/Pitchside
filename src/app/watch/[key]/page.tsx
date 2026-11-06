import { notFound } from "next/navigation";
import Player from "@/components/Player";
import { KEY_RE } from "@/lib/security";

export const metadata = { title: "Watch — Pitchside", robots: { index: false } };

export default async function Watch({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!KEY_RE.test(key)) notFound();
  return <Player streamKey={key} />;
}
