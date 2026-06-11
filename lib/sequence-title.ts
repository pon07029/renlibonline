import type { Sequence, SequenceMeta } from "./types";

const openingTitleOverrides = new Map<string, string>([
  ["seq-8", "은월 주형"],
  ["seq-18", "운월 주형"],
]);

export function sequenceDisplayName(sequence: Pick<Sequence | SequenceMeta, "id" | "name">): string {
  const override = openingTitleOverrides.get(sequence.id);
  if (override) return override;

  const openingName = sequence.name
    .trim()
    .split(/\s+/)[0]
    ?.replace(/[~]+$/, "")
    .replace(/\d+p$/i, "");
  if (!openingName) return sequence.name;
  if (openingName.endsWith("주형")) return openingName;

  return `${openingName} 주형`;
}
