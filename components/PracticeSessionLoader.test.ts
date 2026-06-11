import { afterEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { render } from "@testing-library/react";
import { PracticeSessionLoader, sequenceDataUrl } from "./PracticeSessionLoader";
import type { SequenceMeta } from "@/lib/types";

const sequence: SequenceMeta = {
  id: "seq-8",
  name: "은월",
  category: "test",
  source: "test.lib",
  file: "seq-8.rseq.json",
  maxDepth: 60,
  branchCount: 1,
  nodeCount: 2,
};

describe("sequenceDataUrl", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads sequence data from the app root on localhost", () => {
    expect(sequenceDataUrl("seq-8.rseq.json", "/practice/seq-8")).toBe("/sequences/seq-8.rseq.json");
  });

  it("preserves a port-forwarding path prefix", () => {
    expect(sequenceDataUrl("seq-8.rseq.json", "/proxy/3001/practice/seq-8")).toBe(
      "/proxy/3001/sequences/seq-8.rseq.json"
    );
  });

  it("handles practice paths with trailing slashes", () => {
    expect(sequenceDataUrl("seq-8.rseq.json", "/proxy/3001/practice/seq-8/")).toBe(
      "/proxy/3001/sequences/seq-8.rseq.json"
    );
  });

  it("uses concise opening titles while loading sequence data", () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise<Response>(() => {}))
    );

    const { getByText, queryByText } = render(
      createElement(PracticeSessionLoader, { sequence: { ...sequence, name: "은월 1포인트+2포인트~" } })
    );

    expect(getByText("은월 주형 불러오는 중...")).toBeInTheDocument();
    expect(queryByText("은월 1포인트+2포인트~ 불러오는 중...")).not.toBeInTheDocument();
  });

  it("aborts in-flight sequence data fetches when the loader unmounts", () => {
    const signals: AbortSignal[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn((_url: string, init?: RequestInit) => {
        if (init?.signal) signals.push(init.signal);
        return new Promise<Response>(() => {});
      })
    );

    const { unmount } = render(createElement(PracticeSessionLoader, { sequence }));

    expect(signals).toHaveLength(1);
    expect(signals[0].aborted).toBe(false);

    unmount();

    expect(signals[0].aborted).toBe(true);
  });
});
