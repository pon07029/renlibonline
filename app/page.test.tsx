import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "./page";

describe("Home design", () => {
  it("uses a restrained app shell without gradient hero text", () => {
    const { container } = render(<Home />);

    expect(screen.getByTestId("home-shell")).toHaveClass("home-shell");
    expect(screen.getByRole("heading", { name: "렌주 무적수 연습" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /은월 주형/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /운월 주형/ })).toBeInTheDocument();
    expect(screen.queryByText("은월 1포인트+2포인트~")).not.toBeInTheDocument();
    expect(container.querySelector(".grad")).toBeNull();
  });
});
