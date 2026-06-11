import { describe, expect, it } from "vitest";
import { getSequence, sequences } from "./sequences";

describe("visible sequences", () => {
  it("exposes Eunwol plus six lower-capacity sequences", () => {
    expect(sequences.map((s) => s.source)).toEqual([
      "1+2포인트/금성 1포인트+2포인트.lib",
      "1+2포인트/수월 1포+2포 흑승.lib",
      "1+2포인트/수월 1포인트+2포인트.lib",
      "1+2포인트/은월 1포인트+2포인트~.lib",
      "1+2포인트/협계월 1포인트+2포인트.lib",
      "1포인트만/명월1p.lib",
      "1포인트만/운월 1p 일부.lib",
    ]);

    expect(sequences.find((s) => s.id === "seq-8")).toMatchObject({
      name: "은월 1포인트+2포인트~",
      maxDepth: 60,
      nodeCount: 1713152,
    });
    expect(sequences.find((s) => s.id === "seq-18")).toMatchObject({
      name: "운월 1p 일부",
      maxDepth: 35,
      branchCount: 32,
      nodeCount: 912,
    });
    expect(sequences.filter((s) => s.id !== "seq-8").every((s) => s.nodeCount < 100000)).toBe(true);
  });

  it("does not resolve hidden sequences by direct id", () => {
    expect(getSequence("seq-0")).toBeUndefined();
    expect(getSequence("seq-16")).toBeUndefined();
    expect(getSequence("seq-1")?.source).toBe("1+2포인트/금성 1포인트+2포인트.lib");
    expect(getSequence("seq-8")?.source).toBe("1+2포인트/은월 1포인트+2포인트~.lib");
    expect(getSequence("seq-18")?.source).toBe("1포인트만/운월 1p 일부.lib");
  });
});
