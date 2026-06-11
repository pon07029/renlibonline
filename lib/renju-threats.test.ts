import { describe, expect, it } from "vitest";
import { findThreatMoves, hasFive, threatSummary } from "./renju-threats";

const black = (x: number, y: number) => ({ x, y, player: "black" as const });
const white = (x: number, y: number) => ({ x, y, player: "white" as const });

describe("renju threat search", () => {
  it("detects immediate five moves as VSF candidates", () => {
    const stones = [black(3, 7), black(4, 7), black(5, 7), black(6, 7)];
    const moves = findThreatMoves(stones, "black", "vsf");

    expect(moves).toContainEqual({ x: 2, y: 7, kind: "win" });
    expect(moves).toContainEqual({ x: 7, y: 7, kind: "win" });
  });

  it("detects four-making moves as VSF candidates", () => {
    const stones = [black(5, 7), black(6, 7), black(8, 7)];
    const moves = findThreatMoves(stones, "black", "vsf");

    expect(moves).toContainEqual({ x: 7, y: 7, kind: "four" });
  });

  it("does not treat a four as VSF when white can win immediately elsewhere", () => {
    const stones = [
      black(5, 7),
      black(6, 7),
      black(8, 7),
      white(0, 0),
      white(1, 0),
      white(2, 0),
      white(3, 0),
    ];
    const moves = findThreatMoves(stones, "black", "vsf");

    expect(moves).not.toContainEqual({ x: 7, y: 7, kind: "four" });
  });

  it("does not treat a single closed four as a forced VSF win", () => {
    const stones = [white(4, 7), black(5, 7), black(6, 7), black(7, 7)];
    const moves = findThreatMoves(stones, "black", "vsf");

    expect(moves).toEqual([]);
  });

  it("does not list occupied points or black forbidden moves", () => {
    const stones = [black(6, 7), black(8, 7), black(7, 6), black(7, 8)];
    const moves = findThreatMoves(stones, "black", "vsf");

    expect(moves.some((move) => move.x === 7 && move.y === 7)).toBe(false);
  });

  it("recognizes white five as a win", () => {
    const stones = [white(3, 7), white(4, 7), white(5, 7), white(6, 7), white(7, 7)];

    expect(hasFive(stones, "white")).toBe(true);
  });

  it("summarizes found threat candidates", () => {
    expect(threatSummary("vsf", "black", [{ x: 7, y: 7, kind: "four" }])).toBe("흑 VSF 후보 1개");
    expect(threatSummary("vsf", "white", [])).toBe("백 VSF 후보가 없습니다.");
  });
});
