"use client";
import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { sequenceDisplayName } from "@/lib/sequence-title";
import { Board, type Stone } from "./Board";
import type { Sequence, MoveNode } from "@/lib/types";
import { forbiddenPoints, forbiddenReason } from "@/lib/renju-forbidden";
import { findThreatMoves, threatSummary, type ThreatMode, type ThreatMove } from "@/lib/renju-threats";

const AUTO_DELAY = 500;
const HINT_AFTER = 3;
type SessionMode = "practice" | "free";
type HistoryMove = Stone & {
  optionsAfter: MoveNode[];
  modeAfter: SessionMode;
};
type ThreatResult = {
  mode: ThreatMode;
  moves: ThreatMove[];
  message: string;
};

function pickWhite(options: MoveNode[]): MoveNode {
  return options[Math.floor(Math.random() * options.length)];
}

export function PracticeSession({ sequence }: { sequence: Sequence }) {
  const [history, setHistory] = useState<HistoryMove[]>([]);
  const [cursor, setCursor] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [error, setError] = useState(false);
  const [forbiddenError, setForbiddenError] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [threatResult, setThreatResult] = useState<ThreatResult | null>(null);
  const [autoWhite, setAutoWhite] = useState(true);
  const [pendingAutoWhite, setPendingAutoWhite] = useState(false);
  const cursorRef = useRef(cursor);
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    cursorRef.current = cursor;
  }, [cursor]);

  useEffect(
    () => () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    },
    []
  );

  const clearAutoTimer = useCallback(() => {
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    autoTimerRef.current = null;
    setPendingAutoWhite(false);
  }, []);

  const clearFeedback = useCallback(() => {
    setForbiddenError(false);
    setError(false);
    setWrongCount(0);
    setRevealed(false);
    setThreatResult(null);
  }, []);

  const reset = useCallback(() => {
    clearAutoTimer();
    setHistory([]);
    setCursor(0);
    setWrongCount(0);
    setError(false);
    setForbiddenError(false);
    setRevealed(false);
    setThreatResult(null);
  }, [clearAutoTimer]);

  const changeMode = useCallback(
    (auto: boolean) => {
      if (!auto) clearAutoTimer();
      setAutoWhite(auto);
      clearFeedback();
    },
    [clearAutoTimer, clearFeedback]
  );

  const placed = useMemo<Stone[]>(
    () =>
      history.slice(0, cursor).map((move, index) => ({
        x: move.x,
        y: move.y,
        player: move.player,
        num: index + 1,
      })),
    [history, cursor]
  );
  const currentMode: SessionMode = cursor === 0 ? "practice" : history[cursor - 1]?.modeAfter ?? "practice";
  const options = currentMode === "practice" ? (cursor === 0 ? sequence.root : history[cursor - 1]?.optionsAfter ?? sequence.root) : [];
  const practiceTurn = options[0]?.player;
  const freeTurn: Stone["player"] = cursor % 2 === 0 ? "black" : "white";
  const turn = currentMode === "free" ? freeTurn : practiceTurn;
  const isReviewingPast = cursor < history.length;

  const appendMove = useCallback(
    (move: Omit<HistoryMove, "num">, baseCursor = cursor) => {
      setHistory((prev) => [...prev.slice(0, baseCursor), move]);
      setCursor(baseCursor + 1);
    },
    [cursor]
  );

  const stepPrev = useCallback(() => {
    if (pendingAutoWhite) return;
    clearFeedback();
    setCursor((value) => Math.max(0, value - 1));
  }, [clearFeedback, pendingAutoWhite]);

  const stepNext = useCallback(() => {
    if (pendingAutoWhite) return;
    clearFeedback();
    setCursor((value) => Math.min(history.length, value + 1));
  }, [clearFeedback, history.length, pendingAutoWhite]);

  const handlePoint = useCallback(
    (x: number, y: number) => {
      if (pendingAutoWhite) return;
      if (turn === "black" && forbiddenReason(placed, x, y)) {
        setForbiddenError(true);
        setError(false);
        setWrongCount(0);
        setRevealed(false);
        return;
      }
      if (currentMode === "free") {
        clearFeedback();
        appendMove({ x, y, player: freeTurn, optionsAfter: [], modeAfter: "free" });
        return;
      }

      const match = options.find((o) => o.x === x && o.y === y);
      if (!match) {
        setForbiddenError(false);
        setError(true);
        setWrongCount((c) => c + 1);
        return;
      }
      clearFeedback();
      const next = match.children;

      if (match.player === "white") {
        // 수동으로 백을 둠 → 흑 차례
        appendMove({ x, y, player: match.player, optionsAfter: next, modeAfter: next.length === 0 ? "free" : "practice" });
        return;
      }

      // 흑을 둠
      if (next.length === 0) {
        appendMove({ x, y, player: match.player, optionsAfter: [], modeAfter: "free" });
        return;
      }
      if (autoWhite) {
        // 백 자동 착수: 후보 중 하나를 무작위로 둔다.
        const white = pickWhite(next);
        const blackCursor = cursor + 1;
        appendMove({ x, y, player: match.player, optionsAfter: next, modeAfter: "practice" });
        setPendingAutoWhite(true);
        autoTimerRef.current = setTimeout(() => {
          setHistory((prev) => {
            if (cursorRef.current !== blackCursor) return prev;
            return [
              ...prev.slice(0, blackCursor),
              {
                x: white.x,
                y: white.y,
                player: "white",
                optionsAfter: white.children,
                modeAfter: white.children.length === 0 ? "free" : "practice",
              },
            ];
          });
          setCursor((value) => (value === blackCursor ? blackCursor + 1 : value));
          setPendingAutoWhite(false);
          autoTimerRef.current = null;
        }, AUTO_DELAY);
      } else {
        // 백 수동 → 사용자가 백을 직접 둠
        appendMove({ x, y, player: match.player, optionsAfter: next, modeAfter: "practice" });
      }
    },
    [appendMove, autoWhite, clearFeedback, currentMode, cursor, freeTurn, options, pendingAutoWhite, placed, turn]
  );

  const findThreats = useCallback(
    (mode: ThreatMode) => {
      if (!turn || pendingAutoWhite) return;
      const moves = findThreatMoves(placed, turn, mode);
      setThreatResult({ mode, moves, message: threatSummary(mode, turn, moves) });
      setForbiddenError(false);
      setError(false);
      setRevealed(false);
    },
    [pendingAutoWhite, placed, turn]
  );

  const showHints = currentMode === "practice" && (revealed || (error && wrongCount >= HINT_AFTER));
  const hints = showHints ? options.map((o) => ({ x: o.x, y: o.y })) : undefined;

  const forbidden = useMemo(() => {
    if (pendingAutoWhite || turn !== "black") return undefined;
    return forbiddenPoints(placed);
  }, [pendingAutoWhite, placed, turn]);
  // 백 수동 모드에서 백 차례일 때만 — 가능한 백 후보 위치를 모두 표시 (자동 모드/흑 차례엔 숨김)
  const candidates =
    !autoWhite && currentMode === "practice" && turn === "white"
      ? options.map((o) => ({ x: o.x, y: o.y }))
      : undefined;
  const threats = threatResult?.moves.map((move) => ({ ...move, mode: threatResult.mode }));
  const guide = forbiddenError
      ? "금수입니다. 다른 흑 수를 선택하세요."
      : error
      ? "틀렸습니다. 다시 시도해보세요."
      : pendingAutoWhite
        ? "백이 응수하는 중입니다."
      : isReviewingPast
        ? "복기 중 — 앞으로 가거나 새 수를 두면 이후 수순이 바뀝니다."
      : currentMode === "free"
        ? `완료! 자유 착수 — ${turn === "black" ? "흑" : "백"} 차례입니다.`
      : turn === "white"
        ? "백 차례 — 백을 직접 두세요."
        : cursor === 0
          ? "흑 차례 — 천원(정중앙)에 두며 시작하세요."
          : "흑 차례 — 다음 정답 수를 두세요.";
  const guideColor =
    currentMode === "free" && !forbiddenError && !error
      ? "#16a34a"
      : forbiddenError || error
        ? "#dc2626"
        : turn === "white"
          ? "#6b6560"
          : "#374151";

  return (
    <div data-testid="practice-shell" className="practice-shell">
      <div data-testid="session-toolbar" className="session-toolbar">
        <h2 className="session-title">{sequenceDisplayName(sequence)}</h2>
        <Segmented
          options={[
            { label: "백 자동", value: true },
            { label: "백 수동", value: false },
          ]}
          value={autoWhite}
          onChange={changeMode}
        />
      </div>
      <p data-testid="session-status" className="session-status" style={{ color: guideColor }}>
        {guide}
      </p>
      <div className="board-wrap">
        <Board stones={placed} onPoint={handlePoint} hints={hints} candidates={candidates} forbidden={forbidden} threats={threats} />
      </div>
      <div data-testid="move-nav" className="move-nav">
        <button
          data-testid="prev-move"
          className="icon-btn"
          aria-label="이전 수"
          onClick={stepPrev}
          disabled={cursor === 0 || pendingAutoWhite}
        >
          {"<"}
        </button>
        <span data-testid="move-counter" className="move-counter">
          {cursor}수 / {history.length}수
        </span>
        <button
          data-testid="next-move"
          className="icon-btn"
          aria-label="다음 수"
          onClick={stepNext}
          disabled={cursor === history.length || pendingAutoWhite}
        >
          {">"}
        </button>
      </div>
      {threatResult && (
        <p data-testid="threat-summary" className="threat-summary">
          {threatResult.message}
        </p>
      )}
      <div data-testid="practice-actions" className="practice-actions" style={actionBarStyle}>
        {currentMode === "practice" && (
          <button className="tool-btn" onClick={() => setRevealed(true)} style={btnStyle}>
            정답 보기
          </button>
        )}
        <button className="tool-btn" onClick={() => findThreats("vsf")} style={btnStyle} disabled={!turn || pendingAutoWhite}>
          VSF 찾기
        </button>
        <button className="tool-btn" onClick={reset} style={btnStyle}>
          {currentMode === "free" ? "다시 연습" : "처음부터"}
        </button>
      </div>
    </div>
  );
}

function Segmented({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: boolean }[];
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="segmented">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.label}
            className={active ? "segmented-button segmented-button-active" : "segmented-button"}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  whiteSpace: "nowrap",
};

const actionBarStyle: React.CSSProperties = {
  flexWrap: "wrap",
};
