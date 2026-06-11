"use client";

import type { KeyboardEvent } from "react";

const SIZE = 15;
const CELL = 36; // 교차점 간격(px)
const PAD = CELL; // 가장자리 여백
const DIM = PAD * 2 + CELL * (SIZE - 1);
const STONE_R = CELL * 0.43;
const STAR_POINTS = [
  [3, 3],
  [3, 11],
  [11, 3],
  [11, 11],
  [7, 7],
];

export interface Stone {
  x: number;
  y: number;
  player: "black" | "white";
  num?: number; // 수순 번호
}

interface Props {
  stones: Stone[];
  onPoint: (x: number, y: number) => void;
  hints?: { x: number; y: number }[];
  candidates?: { x: number; y: number }[];
  forbidden?: { x: number; y: number; reason: string }[];
  threats?: { x: number; y: number; kind: string; mode: "vsf" }[];
}

function cx(i: number): number {
  return PAD + i * CELL;
}

export function Board({ stones, onPoint, hints, candidates, forbidden, threats }: Props) {
  const occupied = new Set(stones.map((s) => `${s.x}-${s.y}`));
  const last = stones[stones.length - 1];
  const handlePointKey = (event: KeyboardEvent<SVGRectElement>, x: number, y: number) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onPoint(x, y);
  };

  return (
    <svg
      width={DIM}
      height={DIM}
      viewBox={`0 0 ${DIM} ${DIM}`}
      role="group"
      aria-label="렌주 보드"
      style={{
        width: "100%",
        height: "auto",
        maxWidth: DIM,
        display: "block",
        borderRadius: 8,
        boxShadow: "0 12px 30px rgba(21, 24, 23, 0.08)",
        touchAction: "manipulation",
      }}
    >
      <defs>
        <linearGradient id="wood" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ead29a" />
          <stop offset="55%" stopColor="#e2c382" />
          <stop offset="100%" stopColor="#d7b16e" />
        </linearGradient>
        <radialGradient id="blackStone" cx="38%" cy="34%" r="72%">
          <stop offset="0%" stopColor="#5e6461" />
          <stop offset="44%" stopColor="#252928" />
          <stop offset="100%" stopColor="#050606" />
        </radialGradient>
        <radialGradient id="whiteStone" cx="38%" cy="34%" r="78%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="70%" stopColor="#f4f5f3" />
          <stop offset="100%" stopColor="#d9dedb" />
        </radialGradient>
        <filter id="stoneShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="1.25" stdDeviation="1.25" floodColor="#1f2422" floodOpacity="0.24" />
        </filter>
      </defs>

      {/* 보드 바탕 (장식 — 터치 통과) */}
      <rect x={0} y={0} width={DIM} height={DIM} rx={8} fill="url(#wood)" pointerEvents="none" />

      {/* 격자선 (장식 — 터치 통과) */}
      {Array.from({ length: SIZE }).map((_, i) => (
        <g key={`line-${i}`} pointerEvents="none">
          <line x1={cx(0)} y1={cx(i)} x2={cx(SIZE - 1)} y2={cx(i)} stroke="#806033" strokeWidth={1} opacity={0.62} />
          <line x1={cx(i)} y1={cx(0)} x2={cx(i)} y2={cx(SIZE - 1)} stroke="#806033" strokeWidth={1} opacity={0.62} />
        </g>
      ))}

      {/* 화점 (장식 — 터치 통과) */}
      {STAR_POINTS.map(([sx, sy]) => (
        <circle key={`star-${sx}-${sy}`} cx={cx(sx)} cy={cx(sy)} r={3.2} fill="#6c4f27" opacity={0.76} pointerEvents="none" />
      ))}

      {/* 클릭 가능한 교차점 — 칸 전체를 덮는 사각형으로 빈틈 없이 타일링.
          모바일에서 손가락이 교차점 사이에 떨어져도 가장 가까운 점이 잡힌다. */}
      {Array.from({ length: SIZE }).flatMap((_, y) =>
        Array.from({ length: SIZE }).map((_, x) =>
          occupied.has(`${x}-${y}`) ? null : (
            <rect
              key={`pt-${x}-${y}`}
              data-testid={`point-${x}-${y}`}
              role="button"
              tabIndex={0}
              aria-label={`${y + 1}행 ${x + 1}열 착수`}
              x={cx(x) - CELL / 2}
              y={cx(y) - CELL / 2}
              width={CELL}
              height={CELL}
              fill="transparent"
              pointerEvents="all"
              style={{ cursor: "pointer" }}
              onClick={() => onPoint(x, y)}
              onKeyDown={(event) => handlePointKey(event, x, y)}
            />
          )
        )
      )}

      {/* 후보 백 위치 — 빈 점에만, 작은 반투명 점으로 표시 (터치 통과) */}
      {candidates?.map((c) =>
        occupied.has(`${c.x}-${c.y}`) ? null : (
          <circle
            key={`cand-${c.x}-${c.y}`}
            data-testid={`candidate-${c.x}-${c.y}`}
            cx={cx(c.x)}
            cy={cx(c.y)}
            r={STONE_R * 0.52}
            fill="#0f766e"
            opacity={0.48}
            pointerEvents="none"
          />
        )
      )}

      {/* 금수 위치 — 흑 차례에만 PracticeSession에서 전달된다. */}
      {forbidden?.map((f) => {
        if (occupied.has(`${f.x}-${f.y}`)) return null;
        const center = cx(f.x);
        const middle = cx(f.y);
        const r = STONE_R * 0.64;
        return (
          <g key={`forbidden-${f.x}-${f.y}`} data-testid={`forbidden-${f.x}-${f.y}`} pointerEvents="none">
            <circle
              cx={center}
              cy={middle}
              r={STONE_R * 0.8}
              fill="rgba(220, 38, 38, 0.12)"
              stroke="#dc2626"
              strokeWidth={2.4}
            >
              <title>{f.reason}</title>
            </circle>
            <line x1={center - r} y1={middle - r} x2={center + r} y2={middle + r} stroke="#dc2626" strokeWidth={3} strokeLinecap="round" />
            <line x1={center + r} y1={middle - r} x2={center - r} y2={middle + r} stroke="#dc2626" strokeWidth={3} strokeLinecap="round" />
          </g>
        );
      })}

      {/* VSF 위협 후보 */}
      {threats?.map((t, index) => {
        if (occupied.has(`${t.x}-${t.y}`)) return null;
        const color = "#b45309";
        const center = cx(t.x);
        const middle = cx(t.y);
        return (
          <g key={`threat-${t.mode}-${t.x}-${t.y}`} data-testid={`threat-${t.mode}-${t.x}-${t.y}`} pointerEvents="none">
            <circle cx={center} cy={middle} r={STONE_R * 0.92} fill="rgba(255,255,255,0.18)" stroke={color} strokeWidth={3.2} />
            <text
              x={center}
              y={middle}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={CELL * 0.32}
              fontWeight={800}
              fill={color}
              style={{ userSelect: "none" }}
            >
              {index + 1}
            </text>
          </g>
        );
      })}

      {/* 힌트 */}
      {hints?.map((hint) => (
        <circle
          key={`hint-${hint.x}-${hint.y}`}
          data-testid={`hint-${hint.x}-${hint.y}`}
          cx={cx(hint.x)}
          cy={cx(hint.y)}
          r={STONE_R * 1.06}
          fill="none"
          stroke="#0f766e"
          strokeWidth={3.6}
          strokeDasharray="4 3"
          pointerEvents="none"
        >
          <animate attributeName="opacity" values="0.4;1;0.4" dur="1.4s" repeatCount="indefinite" />
        </circle>
      ))}

      {/* 돌 */}
      {stones.map((s) => {
        const isLast = last && s.x === last.x && s.y === last.y;
        return (
          <g key={`stone-${s.x}-${s.y}`} filter="url(#stoneShadow)" pointerEvents="none">
            <circle
              data-testid={`stone-${s.x}-${s.y}`}
              cx={cx(s.x)}
              cy={cx(s.y)}
              r={STONE_R}
              fill={s.player === "black" ? "url(#blackStone)" : "url(#whiteStone)"}
              stroke={s.player === "white" ? "#cbc7bf" : "none"}
              strokeWidth={s.player === "white" ? 0.75 : 0}
            />
            {isLast && (
              <circle
                cx={cx(s.x)}
                cy={cx(s.y)}
                r={STONE_R * 0.38}
                fill="none"
                stroke={s.player === "black" ? "#ffffff" : "#0f766e"}
                strokeWidth={2}
                opacity={0.9}
              />
            )}
            {s.num !== undefined && (
              <text
                data-testid={`stone-num-${s.x}-${s.y}`}
                x={cx(s.x)}
                y={cx(s.y)}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={CELL * 0.38}
                fontWeight={600}
                fill={s.player === "black" ? "#f5f5f5" : "#2a2a2a"}
                style={{ pointerEvents: "none", userSelect: "none" }}
              >
                {s.num}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
