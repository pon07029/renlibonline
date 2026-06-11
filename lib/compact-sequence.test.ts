import { describe, expect, it } from "vitest";
import { inflatePackedSequence } from "./compact-sequence";
import type { PackedSequence } from "./types";

describe("inflatePackedSequence", () => {
  it("rebuilds every packed node into the nested practice tree", () => {
    const packed: PackedSequence = {
      id: "seq-test",
      name: "테스트",
      roots: [0, 4],
      nodes: [
        [7, 7, 0, 1, 2],
        [8, 6, 1, 3, 1],
        [6, 7, 1, -1, 0],
        [8, 7, 0, -1, 0],
        [3, 3, 0, -1, 0],
      ],
    };

    expect(inflatePackedSequence(packed)).toEqual({
      id: "seq-test",
      name: "테스트",
      root: [
        {
          x: 7,
          y: 7,
          player: "black",
          children: [
            { x: 8, y: 6, player: "white", children: [{ x: 8, y: 7, player: "black", children: [] }] },
            { x: 6, y: 7, player: "white", children: [] },
          ],
        },
        { x: 3, y: 3, player: "black", children: [] },
      ],
    });
  });
});
