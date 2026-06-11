import { forbiddenReason, type BoardStone } from "./renju-forbidden";

const SIZE = 15;
const DIRECTIONS = [
  [1, 0],
  [0, 1],
  [1, 1],
  [1, -1],
] as const;
const MAX_FORCED_DEFENSES = 4;

export type ThreatMode = "vsf";
export type ThreatKind = "win" | "four";

export interface ThreatMove {
  x: number;
  y: number;
  kind: ThreatKind;
}

type Player = BoardStone["player"];
type BoardMap = Map<string, Player>;

const key = (x: number, y: number) => `${x},${y}`;
const inBounds = (x: number, y: number) => x >= 0 && x < SIZE && y >= 0 && y < SIZE;

function boardMap(stones: BoardStone[]): BoardMap {
  const out: BoardMap = new Map();
  for (const stone of stones) out.set(key(stone.x, stone.y), stone.player);
  return out;
}

function cell(board: BoardMap, x: number, y: number): Player | undefined | "wall" {
  if (!inBounds(x, y)) return "wall";
  return board.get(key(x, y));
}

function countSide(board: BoardMap, x: number, y: number, dx: number, dy: number, player: Player): number {
  let count = 0;
  let nx = x + dx;
  let ny = y + dy;
  while (cell(board, nx, ny) === player) {
    count++;
    nx += dx;
    ny += dy;
  }
  return count;
}

function lineCount(board: BoardMap, x: number, y: number, dx: number, dy: number, player: Player): number {
  return 1 + countSide(board, x, y, dx, dy, player) + countSide(board, x, y, -dx, -dy, player);
}

function withMove(board: BoardMap, x: number, y: number, player: Player): BoardMap {
  const next = new Map(board);
  next.set(key(x, y), player);
  return next;
}

function isLegalCandidate(stones: BoardStone[], board: BoardMap, x: number, y: number, player: Player): boolean {
  if (cell(board, x, y) !== undefined) return false;
  if (player === "black" && forbiddenReason(stones, x, y)) return false;
  return true;
}

function candidatePoints(stones: BoardStone[]): { x: number; y: number }[] {
  if (stones.length === 0) {
    return Array.from({ length: SIZE * SIZE }, (_, i) => ({ x: i % SIZE, y: Math.floor(i / SIZE) }));
  }

  const seen = new Set<string>();
  const out: { x: number; y: number }[] = [];
  for (const stone of stones) {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const x = stone.x + dx;
        const y = stone.y + dy;
        if (!inBounds(x, y)) continue;
        const pointKey = key(x, y);
        if (seen.has(pointKey)) continue;
        seen.add(pointKey);
        out.push({ x, y });
      }
    }
  }
  return out.sort((a, b) => a.y - b.y || a.x - b.x);
}

function createsFive(board: BoardMap, x: number, y: number, player: Player): boolean {
  return DIRECTIONS.some(([dx, dy]) => lineCount(board, x, y, dx, dy, player) >= 5);
}

function immediateWins(stones: BoardStone[], board: BoardMap, player: Player): ThreatMove[] {
  const out: ThreatMove[] = [];
  for (const { x, y } of candidatePoints(stones)) {
    if (!isLegalCandidate(stones, board, x, y, player)) continue;
    const next = withMove(board, x, y, player);
    if (createsFive(next, x, y, player)) out.push({ x, y, kind: "win" });
  }
  return out;
}

function immediateWinsFromAnchor(stones: BoardStone[], board: BoardMap, anchorX: number, anchorY: number, player: Player): ThreatMove[] {
  const out: ThreatMove[] = [];
  const seen = new Set<string>();

  for (const [dx, dy] of DIRECTIONS) {
    for (let i = -4; i <= 4; i++) {
      if (i === 0) continue;
      const x = anchorX + dx * i;
      const y = anchorY + dy * i;
      const pointKey = key(x, y);
      if (seen.has(pointKey)) continue;
      if (!isLegalCandidate(stones, board, x, y, player)) continue;

      const next = withMove(board, x, y, player);
      if (lineCount(next, x, y, dx, dy, player) >= 5) {
        seen.add(pointKey);
        out.push({ x, y, kind: "win" });
      }
    }
  }

  return sortThreatMoves(out);
}

function opponent(player: Player): Player {
  return player === "black" ? "white" : "black";
}

function forcingMoves(stones: BoardStone[], board: BoardMap, player: Player): ThreatMove[] {
  const wins = immediateWins(stones, board, player);
  if (wins.length > 0) return wins;

  const out: ThreatMove[] = [];
  const seen = new Set<string>();

  const add = (move: ThreatMove) => {
    const moveKey = key(move.x, move.y);
    if (seen.has(moveKey)) return;
    seen.add(moveKey);
    out.push(move);
  };

  for (const { x, y } of candidatePoints(stones)) {
    if (!isLegalCandidate(stones, board, x, y, player)) continue;
    const next = withMove(board, x, y, player);
    const nextStones = [...stones, { x, y, player }];
    if (createsFive(next, x, y, player)) {
      add({ x, y, kind: "win" });
      continue;
    }
    if (immediateWinsFromAnchor(nextStones, next, x, y, player).length > 0) {
      add({ x, y, kind: "four" });
    }
  }

  return sortThreatMoves(out);
}

function sortThreatMoves(moves: ThreatMove[]): ThreatMove[] {
  const priority: Record<ThreatKind, number> = { win: 0, four: 1 };
  return moves.sort((a, b) => priority[a.kind] - priority[b.kind] || a.y - b.y || a.x - b.x);
}

function isUnavoidableFour(stones: BoardStone[], board: BoardMap, attacker: Player, move: ThreatMove): boolean {
  const attackBoard = withMove(board, move.x, move.y, attacker);
  const attackStones = [...stones, { x: move.x, y: move.y, player: attacker }];
  if (createsFive(attackBoard, move.x, move.y, attacker)) return true;

  const defender = opponent(attacker);
  if (immediateWins(attackStones, attackBoard, defender).length > 0) return false;

  const wins = immediateWinsFromAnchor(attackStones, attackBoard, move.x, move.y, attacker);
  if (wins.length === 0) return false;
  if (wins.length > MAX_FORCED_DEFENSES) return false;

  const defenses = wins
    .filter((defense) => isLegalCandidate(attackStones, attackBoard, defense.x, defense.y, defender));

  if (defenses.length === 0) return true;

  return defenses.every((defense) => {
    const defenseBoard = withMove(attackBoard, defense.x, defense.y, defender);
    const defenseStones = [...attackStones, { x: defense.x, y: defense.y, player: defender }];
    return immediateWins(defenseStones, defenseBoard, attacker).length > 0;
  });
}

export function hasFive(stones: BoardStone[], player: Player): boolean {
  const board = boardMap(stones);
  return stones.some((stone) => stone.player === player && createsFive(board, stone.x, stone.y, player));
}

export function findThreatMoves(stones: BoardStone[], player: Player, mode: ThreatMode): ThreatMove[] {
  const board = boardMap(stones);
  return sortThreatMoves(forcingMoves(stones, board, player).filter((move) => {
    if (move.kind === "win") return true;
    if (move.kind === "four") return isUnavoidableFour(stones, board, player, move);
    return false;
  }));
}

export function threatSummary(mode: ThreatMode, player: Player, moves: ThreatMove[]): string {
  const side = player === "black" ? "흑" : "백";
  const label = mode.toUpperCase();
  if (moves.length === 0) return `${side} ${label} 후보가 없습니다.`;
  return `${side} ${label} 후보 ${moves.length}개`;
}
