export interface MoveNode {
  x: number; // 0-14
  y: number; // 0-14
  player: "black" | "white";
  children: MoveNode[];
}

export interface Sequence {
  id: string;
  name: string;
  root: MoveNode[]; // 첫 수들 (보통 흑 천원 하나)
}

export interface SequenceMeta {
  id: string;
  name: string;
  category: string;
  source: string;
  file: string;
  maxDepth: number;
  branchCount: number;
  nodeCount: number;
}

// [x, y, player, firstChildIndex, childCount], player: 0=black, 1=white
export type PackedMoveNode = [number, number, 0 | 1, number, number];

export interface PackedSequence {
  id: string;
  name: string;
  roots: number[];
  nodes: PackedMoveNode[];
}
