const SIZE = 15;
const DIRECTIONS = [
  [1, 0],
  [0, 1],
  [1, 1],
  [1, -1],
] as const;

export type ForbiddenReason = "overline" | "double-four" | "double-three";

export interface BoardStone {
  x: number;
  y: number;
  player: "black" | "white";
}

export interface ForbiddenPoint {
  x: number;
  y: number;
  reason: ForbiddenReason;
}

type Cell = "black" | "white" | undefined;
type BoardMap = Map<string, Cell>;

const key = (x: number, y: number) => `${x},${y}`;
const inBounds = (x: number, y: number) => x >= 0 && x < SIZE && y >= 0 && y < SIZE;

function boardMap(stones: BoardStone[]): BoardMap {
  const map: BoardMap = new Map();
  for (const stone of stones) map.set(key(stone.x, stone.y), stone.player);
  return map;
}

function cell(board: BoardMap, x: number, y: number): Cell | "wall" {
  if (!inBounds(x, y)) return "wall";
  return board.get(key(x, y));
}

function countSide(board: BoardMap, x: number, y: number, dx: number, dy: number): number {
  let count = 0;
  let nx = x + dx;
  let ny = y + dy;
  while (cell(board, nx, ny) === "black") {
    count++;
    nx += dx;
    ny += dy;
  }
  return count;
}

function lineCount(board: BoardMap, x: number, y: number, dx: number, dy: number): number {
  return 1 + countSide(board, x, y, dx, dy) + countSide(board, x, y, -dx, -dy);
}

function createsOverline(board: BoardMap, x: number, y: number): boolean {
  return DIRECTIONS.some(([dx, dy]) => lineCount(board, x, y, dx, dy) >= 6);
}

function createsExactFiveInDirection(board: BoardMap, x: number, y: number, dx: number, dy: number): boolean {
  return lineCount(board, x, y, dx, dy) === 5;
}

function withBlack(board: BoardMap, x: number, y: number): BoardMap {
  const next = new Map(board);
  next.set(key(x, y), "black");
  return next;
}

function lineCells(board: BoardMap, x: number, y: number, dx: number, dy: number): string {
  let out = "";
  for (let i = -5; i <= 5; i++) {
    const c = cell(board, x + dx * i, y + dy * i);
    out += c === "black" ? "B" : c === undefined ? "." : "W";
  }
  return out;
}

function hasFourInDirection(board: BoardMap, x: number, y: number, dx: number, dy: number): boolean {
  for (let i = -4; i <= 4; i++) {
    const tx = x + dx * i;
    const ty = y + dy * i;
    if (cell(board, tx, ty) !== undefined) continue;
    const next = withBlack(board, tx, ty);
    if (!createsOverline(next, tx, ty) && createsExactFiveInDirection(next, tx, ty, dx, dy)) return true;
  }
  return false;
}

function countFours(board: BoardMap, x: number, y: number): number {
  return DIRECTIONS.filter(([dx, dy]) => hasFourInDirection(board, x, y, dx, dy)).length;
}

function hasOpenThreeInDirection(board: BoardMap, x: number, y: number, dx: number, dy: number): boolean {
  if (hasFourInDirection(board, x, y, dx, dy)) return false;

  const line = lineCells(board, x, y, dx, dy);
  return line.includes(".BBB.") || line.includes(".BB.B.") || line.includes(".B.BB.");
}

function countOpenThrees(board: BoardMap, x: number, y: number): number {
  return DIRECTIONS.filter(([dx, dy]) => hasOpenThreeInDirection(board, x, y, dx, dy)).length;
}

export function forbiddenReason(stones: BoardStone[], x: number, y: number): ForbiddenReason | null {
  const base = boardMap(stones);
  if (cell(base, x, y) !== undefined) return null;

  const board = withBlack(base, x, y);
  if (createsOverline(board, x, y)) return "overline";
  if (countFours(board, x, y) >= 2) return "double-four";
  if (countOpenThrees(board, x, y) >= 2) return "double-three";
  return null;
}

export function forbiddenPoints(stones: BoardStone[]): ForbiddenPoint[] {
  const out: ForbiddenPoint[] = [];
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const reason = forbiddenReason(stones, x, y);
      if (reason) out.push({ x, y, reason });
    }
  }
  return out;
}
