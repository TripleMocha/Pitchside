export type Quality = "SD" | "HD" | "FHD" | "4K";
export interface Source { quality: Quality; url: string; live: boolean }
export interface Stream {
  name: string;
  category: string;
  league: string;
  stream_key: string;
  match_timestamp: number;
  sources: Source[];
  thumbnail_url?: string;
}
export const isLive = (s: Stream) => s.sources.some((x) => x.live);
