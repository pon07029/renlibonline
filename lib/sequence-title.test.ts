import { describe, expect, it } from "vitest";
import { sequenceDisplayName } from "./sequence-title";

describe("sequenceDisplayName", () => {
  it("uses concise opening titles for the public library", () => {
    expect(sequenceDisplayName({ id: "seq-8", name: "은월 1포인트+2포인트~" })).toBe("은월 주형");
    expect(sequenceDisplayName({ id: "seq-18", name: "운월 1p 일부" })).toBe("운월 주형");
  });

  it("falls back to the first opening token", () => {
    expect(sequenceDisplayName({ id: "custom", name: "포월 3수 일부" })).toBe("포월 주형");
    expect(sequenceDisplayName({ id: "seq-14", name: "명월1p" })).toBe("명월 주형");
    expect(sequenceDisplayName({ id: "already", name: "구월 주형" })).toBe("구월 주형");
  });
});
