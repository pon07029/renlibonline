import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PracticeSession } from "./PracticeSession";
import type { Sequence } from "@/lib/types";

// 흑(7,7) → 백(7,6) → 흑(8,6) [leaf]
const linear: Sequence = {
  id: "lin",
  name: "선형",
  root: [
    {
      x: 7, y: 7, player: "black",
      children: [
        {
          x: 7, y: 6, player: "white",
          children: [{ x: 8, y: 6, player: "black", children: [] }],
        },
      ],
    },
  ],
};

// 흑(7,7) → 백이 두 가지: (7,6) 또는 (6,7), 각각 흑 응수 있음
const branching: Sequence = {
  id: "br",
  name: "분기",
  root: [
    {
      x: 7, y: 7, player: "black",
      children: [
        { x: 7, y: 6, player: "white", children: [{ x: 9, y: 9, player: "black", children: [] }] },
        { x: 6, y: 7, player: "white", children: [{ x: 10, y: 10, player: "black", children: [] }] },
      ],
    },
  ],
};

const nearWhiteBranching: Sequence = {
  id: "near",
  name: "가까운 백 선택",
  root: [
    {
      x: 7, y: 7, player: "black",
      children: [
        { x: 0, y: 0, player: "white", children: [] },
        { x: 7, y: 6, player: "white", children: [] },
      ],
    },
  ],
};

const multiBlackAnswer: Sequence = {
  id: "multi-black",
  name: "흑 정답 여러 개",
  root: [
    {
      x: 7, y: 7, player: "black",
      children: [
        {
          x: 8, y: 6, player: "white",
          children: [
            { x: 8, y: 7, player: "black", children: [] },
            { x: 9, y: 7, player: "black", children: [] },
          ],
        },
      ],
    },
  ],
};

const forbiddenTurn: Sequence = {
  id: "forbidden",
  name: "금수 표시",
  root: [
    {
      x: 6,
      y: 7,
      player: "black",
      children: [
        {
          x: 0,
          y: 0,
          player: "white",
          children: [
            {
              x: 8,
              y: 7,
              player: "black",
              children: [
                {
                  x: 1,
                  y: 0,
                  player: "white",
                  children: [
                    {
                      x: 7,
                      y: 6,
                      player: "black",
                      children: [
                        {
                          x: 2,
                          y: 0,
                          player: "white",
                          children: [
                            {
                              x: 7,
                              y: 8,
                              player: "black",
                              children: [
                                {
                                  x: 3,
                                  y: 0,
                                  player: "white",
                                  children: [{ x: 10, y: 10, player: "black", children: [] }],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

const threatTurn: Sequence = {
  id: "threat",
  name: "위협 찾기",
  root: [
    {
      x: 5,
      y: 7,
      player: "black",
      children: [
        {
          x: 0,
          y: 0,
          player: "white",
          children: [
            {
              x: 6,
              y: 7,
              player: "black",
              children: [
                {
                  x: 1,
                  y: 0,
                  player: "white",
                  children: [{ x: 8, y: 7, player: "black", children: [] }],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

describe("PracticeSession (tree)", () => {
  it("places correct black move and auto-plays white response", async () => {
    render(<PracticeSession sequence={linear} />);
    fireEvent.click(screen.getByTestId("point-7-7"));
    expect(await screen.findByTestId("stone-7-7")).toBeInTheDocument();
    expect(await screen.findByTestId("stone-7-6")).toBeInTheDocument();
  });

  it("shows error on a wrong black move and keeps board state", () => {
    render(<PracticeSession sequence={linear} />);
    fireEvent.click(screen.getByTestId("point-0-0"));
    expect(screen.getByText(/틀렸습니다/)).toBeInTheDocument();
    expect(screen.queryByTestId("stone-0-0")).not.toBeInTheDocument();
  });

  it("completes after reaching a leaf", async () => {
    render(<PracticeSession sequence={linear} />);
    fireEvent.click(screen.getByTestId("point-7-7"));
    await screen.findByTestId("stone-7-6");
    fireEvent.click(screen.getByTestId("point-8-6"));
    expect(await screen.findByText(/완료/)).toBeInTheDocument();
  });

  it("reveals the correct next move when 정답 보기 is clicked", () => {
    render(<PracticeSession sequence={linear} />);
    fireEvent.click(screen.getByText("정답 보기"));
    // 정답(흑 7,7)이 힌트로 표시된다
    expect(screen.getByTestId("hint-7-7")).toBeInTheDocument();
  });

  it("reveals all correct black moves when multiple answers are available", async () => {
    render(<PracticeSession sequence={multiBlackAnswer} />);
    fireEvent.click(screen.getByTestId("point-7-7"));
    expect(await screen.findByTestId("stone-8-6")).toBeInTheDocument();

    fireEvent.click(screen.getByText("정답 보기"));

    expect(screen.getByTestId("hint-8-7")).toBeInTheDocument();
    expect(screen.getByTestId("hint-9-7")).toBeInTheDocument();
  });

  it("manual white mode: user places white themselves (no auto-play)", async () => {
    render(<PracticeSession sequence={linear} />);
    fireEvent.click(screen.getByText("백 수동"));
    // 모드 전환 후 처음부터 — 흑(7,7) 두기
    fireEvent.click(screen.getByTestId("point-7-7"));
    expect(await screen.findByTestId("stone-7-7")).toBeInTheDocument();
    // 자동 착수 안 됨 → 백(7,6)은 아직 없고, "백 차례" 안내
    expect(screen.queryByTestId("stone-7-6")).not.toBeInTheDocument();
    expect(screen.getByText(/백 차례/)).toBeInTheDocument();
    // 사용자가 직접 백(7,6)을 둔다
    fireEvent.click(screen.getByTestId("point-7-6"));
    expect(await screen.findByTestId("stone-7-6")).toBeInTheDocument();
  });

  it("keeps the current board when switching between auto and manual white modes", async () => {
    render(<PracticeSession sequence={linear} />);
    fireEvent.click(screen.getByTestId("point-7-7"));
    expect(await screen.findByTestId("stone-7-6")).toBeInTheDocument();

    fireEvent.click(screen.getByText("백 수동"));

    expect(screen.getByTestId("stone-7-7")).toBeInTheDocument();
    expect(screen.getByTestId("stone-7-6")).toBeInTheDocument();
    expect(screen.getByTestId("move-counter")).toHaveTextContent("2수 / 2수");
  });

  it("manual white mode: shows all candidate white positions on white's turn", async () => {
    render(<PracticeSession sequence={branching} />);
    fireEvent.click(screen.getByText("백 수동"));
    // 흑(7,7)을 두면 백 차례 — 가능한 백 후보 (7,6), (6,7) 모두 표시된다
    fireEvent.click(screen.getByTestId("point-7-7"));
    expect(await screen.findByTestId("stone-7-7")).toBeInTheDocument();
    expect(screen.getByTestId("candidate-7-6")).toBeInTheDocument();
    expect(screen.getByTestId("candidate-6-7")).toBeInTheDocument();
  });

  it("auto mode: does NOT show candidate markers (no spoiling)", async () => {
    render(<PracticeSession sequence={branching} />);
    // 자동 모드(기본) — 흑(7,7)을 두어도 백 후보는 표시되지 않는다
    fireEvent.click(screen.getByTestId("point-7-7"));
    expect(await screen.findByTestId("stone-7-7")).toBeInTheDocument();
    expect(screen.queryByTestId("candidate-7-6")).not.toBeInTheDocument();
    expect(screen.queryByTestId("candidate-6-7")).not.toBeInTheDocument();
  });

  it("auto mode: selects the white response by random candidate index", async () => {
    const random = vi.spyOn(Math, "random").mockReturnValue(0.99);
    render(<PracticeSession sequence={branching} />);
    fireEvent.click(screen.getByTestId("point-7-7"));
    expect(await screen.findByTestId("stone-6-7")).toBeInTheDocument();
    expect(screen.queryByTestId("stone-7-6")).not.toBeInTheDocument();
    random.mockRestore();
  });

  it("auto mode: can randomly choose a far white candidate", async () => {
    const random = vi.spyOn(Math, "random").mockReturnValue(0);
    render(<PracticeSession sequence={nearWhiteBranching} />);
    fireEvent.click(screen.getByTestId("point-7-7"));
    expect(await screen.findByTestId("stone-0-0")).toBeInTheDocument();
    expect(screen.queryByTestId("stone-7-6")).not.toBeInTheDocument();
    random.mockRestore();
  });

  it("marks forbidden black moves and blocks placing them", async () => {
    render(<PracticeSession sequence={forbiddenTurn} />);
    fireEvent.click(screen.getByTestId("point-6-7"));
    expect(await screen.findByTestId("stone-0-0")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("point-8-7"));
    expect(await screen.findByTestId("stone-1-0")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("point-7-6"));
    expect(await screen.findByTestId("stone-2-0")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("point-7-8"));
    expect(await screen.findByTestId("stone-3-0")).toBeInTheDocument();

    expect(screen.getByTestId("forbidden-7-7")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("point-7-7"));

    expect(screen.getByText(/금수입니다/)).toBeInTheDocument();
    expect(screen.queryByTestId("stone-7-7")).not.toBeInTheDocument();
  });

  it("continues with alternating free moves after the sequence is complete", async () => {
    render(<PracticeSession sequence={linear} />);
    fireEvent.click(screen.getByTestId("point-7-7"));
    expect(await screen.findByTestId("stone-7-6")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("point-8-6"));

    expect(await screen.findByText(/완료/)).toBeInTheDocument();
    expect(screen.getByTestId("move-counter")).toHaveTextContent("3수 / 3수");

    fireEvent.click(screen.getByTestId("point-9-6"));
    expect(screen.getByTestId("stone-9-6")).toBeInTheDocument();
    expect(screen.getByTestId("stone-num-9-6")).toHaveTextContent("4");

    fireEvent.click(screen.getByTestId("point-9-7"));
    expect(screen.getByTestId("stone-9-7")).toBeInTheDocument();
    expect(screen.getByTestId("stone-num-9-7")).toHaveTextContent("5");
    expect(screen.getByTestId("move-counter")).toHaveTextContent("5수 / 5수");
  });

  it("moves backward and forward through the current move history", async () => {
    render(<PracticeSession sequence={linear} />);
    fireEvent.click(screen.getByTestId("point-7-7"));
    expect(await screen.findByTestId("stone-7-6")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("point-8-6"));
    fireEvent.click(screen.getByTestId("point-9-6"));

    expect(screen.getByTestId("move-counter")).toHaveTextContent("4수 / 4수");
    fireEvent.click(screen.getByTestId("prev-move"));
    expect(screen.queryByTestId("stone-9-6")).not.toBeInTheDocument();
    expect(screen.getByTestId("move-counter")).toHaveTextContent("3수 / 4수");

    fireEvent.click(screen.getByTestId("next-move"));
    expect(screen.getByTestId("stone-9-6")).toBeInTheDocument();
    expect(screen.getByTestId("move-counter")).toHaveTextContent("4수 / 4수");
  });

  it("cuts future moves when placing a new move after stepping back", async () => {
    render(<PracticeSession sequence={linear} />);
    fireEvent.click(screen.getByTestId("point-7-7"));
    expect(await screen.findByTestId("stone-7-6")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("point-8-6"));
    fireEvent.click(screen.getByTestId("point-9-6"));
    fireEvent.click(screen.getByTestId("point-9-7"));

    fireEvent.click(screen.getByTestId("prev-move"));
    fireEvent.click(screen.getByTestId("prev-move"));
    expect(screen.getByTestId("move-counter")).toHaveTextContent("3수 / 5수");

    fireEvent.click(screen.getByTestId("point-10-6"));
    expect(screen.getByTestId("stone-10-6")).toBeInTheDocument();
    expect(screen.queryByTestId("stone-9-6")).not.toBeInTheDocument();
    expect(screen.queryByTestId("stone-9-7")).not.toBeInTheDocument();
    expect(screen.getByTestId("move-counter")).toHaveTextContent("4수 / 4수");
  });

  it("renders move navigation after the board for mobile flow", () => {
    const { container } = render(<PracticeSession sequence={linear} />);
    const board = container.querySelector("svg");
    const nav = screen.getByTestId("move-nav");

    expect(board).toBeInTheDocument();
    expect(nav).toBeInTheDocument();
    expect(board?.compareDocumentPosition(nav) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("wraps action controls on narrow screens without breaking button text", () => {
    render(<PracticeSession sequence={linear} />);

    expect(screen.getByTestId("practice-actions")).toHaveStyle({ flexWrap: "wrap" });
    expect(screen.getByText("정답 보기")).toHaveStyle({ whiteSpace: "nowrap" });
    expect(screen.getByText("VSF 찾기")).toHaveStyle({ whiteSpace: "nowrap" });
    expect(screen.queryByText("VST 찾기")).not.toBeInTheDocument();
    expect(screen.getByText("처음부터")).toHaveStyle({ whiteSpace: "nowrap" });
  });

  it("renders the practice surface as a restrained tool layout", () => {
    render(<PracticeSession sequence={linear} />);

    expect(screen.getByTestId("practice-shell")).toHaveClass("practice-shell");
    expect(screen.getByTestId("session-toolbar")).toHaveClass("session-toolbar");
    expect(screen.getByTestId("session-status")).toHaveClass("session-status");
  });

  it("shows concise opening titles in the session header", () => {
    render(<PracticeSession sequence={{ ...linear, id: "seq-8", name: "은월 1포인트+2포인트~" }} />);

    expect(screen.getByRole("heading", { name: "은월 주형" })).toBeInTheDocument();
    expect(screen.queryByText("은월 1포인트+2포인트~")).not.toBeInTheDocument();
  });

  it("finds and marks VSF candidates for the current side", async () => {
    render(<PracticeSession sequence={threatTurn} />);
    fireEvent.click(screen.getByTestId("point-5-7"));
    expect(await screen.findByTestId("stone-0-0")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("point-6-7"));
    expect(await screen.findByTestId("stone-1-0")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("point-8-7"));
    fireEvent.click(screen.getByTestId("point-14-14"));

    fireEvent.click(screen.getByText("VSF 찾기"));

    expect(screen.getByText(/흑 VSF 후보/)).toBeInTheDocument();
    expect(screen.getByTestId("threat-vsf-7-7")).toBeInTheDocument();
  });

});
