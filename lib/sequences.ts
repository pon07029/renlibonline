import type { SequenceMeta } from "./types";
import data from "@/public/sequences-index.json";

const visibleSources = new Set([
  "1+2포인트/금성 1포인트+2포인트.lib",
  "1+2포인트/수월 1포+2포 흑승.lib",
  "1+2포인트/수월 1포인트+2포인트.lib",
  "1+2포인트/은월 1포인트+2포인트~.lib",
  "1+2포인트/협계월 1포인트+2포인트.lib",
  "1포인트만/명월1p.lib",
  "1포인트만/운월 1p 일부.lib",
]);

export const sequences: SequenceMeta[] = (data as SequenceMeta[]).filter((sequence) => visibleSources.has(sequence.source));

export function getSequence(id: string): SequenceMeta | undefined {
  return sequences.find((s) => s.id === id);
}
