import type { MoveNode, PackedSequence, Sequence } from "./types";

export function inflatePackedSequence(packed: PackedSequence): Sequence {
  const cache = new Map<number, MoveNode>();

  const build = (index: number): MoveNode => {
    const cached = cache.get(index);
    if (cached) return cached;

    const node = packed.nodes[index];
    if (!node) throw new Error(`Invalid packed move index: ${index}`);

    const [x, y, player, firstChild, childCount] = node;
    let children: MoveNode[] | undefined;

    const move: MoveNode = {
      x,
      y,
      player: player === 0 ? "black" : "white",
      get children() {
        if (!children) {
          children = [];
          if (firstChild >= 0) {
            for (let i = 0; i < childCount; i++) {
              children.push(build(firstChild + i));
            }
          }
        }
        return children;
      },
    };
    cache.set(index, move);
    return move;
  };

  return {
    id: packed.id,
    name: packed.name,
    root: packed.roots.map(build),
  };
}
