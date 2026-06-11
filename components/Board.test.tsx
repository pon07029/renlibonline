import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Board } from "./Board";

describe("Board", () => {
  it("renders a stone at the given position", () => {
    render(<Board stones={[{ x: 7, y: 7, player: "black" }]} onPoint={() => {}} />);
    expect(screen.getByTestId("stone-7-7")).toBeInTheDocument();
  });

  it("calls onPoint with grid coords when an empty intersection is clicked", () => {
    const onPoint = vi.fn();
    render(<Board stones={[]} onPoint={onPoint} />);
    fireEvent.click(screen.getByTestId("point-3-5"));
    expect(onPoint).toHaveBeenCalledWith(3, 5);
  });

  it("exposes empty intersections as keyboard-accessible board buttons", () => {
    const onPoint = vi.fn();
    render(<Board stones={[]} onPoint={onPoint} />);

    expect(screen.getByRole("group", { name: "렌주 보드" })).toBeInTheDocument();
    const center = screen.getByRole("button", { name: "8행 8열 착수" });
    center.focus();
    expect(center).toHaveFocus();

    fireEvent.keyDown(center, { key: "Enter" });
    fireEvent.keyDown(center, { key: " " });

    expect(onPoint).toHaveBeenNthCalledWith(1, 7, 7);
    expect(onPoint).toHaveBeenNthCalledWith(2, 7, 7);
  });

  it("does not render a clickable point where a stone already is", () => {
    render(<Board stones={[{ x: 0, y: 0, player: "black" }]} onPoint={() => {}} />);
    expect(screen.queryByTestId("point-0-0")).not.toBeInTheDocument();
  });

  it("renders the move number on a stone when num is given", () => {
    render(<Board stones={[{ x: 7, y: 7, player: "black", num: 1 }]} onPoint={() => {}} />);
    expect(screen.getByTestId("stone-num-7-7")).toHaveTextContent("1");
  });
});
