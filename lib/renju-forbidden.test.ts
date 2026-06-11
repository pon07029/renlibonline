import { describe, expect, it } from "vitest";
import { forbiddenReason, forbiddenPoints } from "./renju-forbidden";

const black = (x: number, y: number) => ({ x, y, player: "black" as const });
const white = (x: number, y: number) => ({ x, y, player: "white" as const });

describe("renju forbidden moves", () => {
  it("detects overline", () => {
    const stones = [black(2, 7), black(3, 7), black(4, 7), black(5, 7), black(6, 7)];
    expect(forbiddenReason(stones, 7, 7)).toBe("overline");
  });

  it("detects double four", () => {
    const stones = [
      black(5, 7),
      black(6, 7),
      black(8, 7),
      black(7, 5),
      black(7, 6),
      black(7, 8),
    ];
    expect(forbiddenReason(stones, 7, 7)).toBe("double-four");
  });

  it("detects double three", () => {
    const stones = [black(6, 7), black(8, 7), black(7, 6), black(7, 8)];
    expect(forbiddenReason(stones, 7, 7)).toBe("double-three");
  });

  it("does not mark occupied or blocked points", () => {
    expect(forbiddenReason([black(7, 7)], 7, 7)).toBeNull();
    expect(forbiddenReason([white(5, 7), black(6, 7), black(8, 7), white(9, 7)], 7, 7)).toBeNull();
  });

  it("lists forbidden points on the board", () => {
    const points = forbiddenPoints([black(6, 7), black(8, 7), black(7, 6), black(7, 8)]);
    expect(points).toContainEqual({ x: 7, y: 7, reason: "double-three" });
  });
});
