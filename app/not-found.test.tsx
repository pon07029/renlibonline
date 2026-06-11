import { existsSync } from "fs";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

describe("not found page", () => {
  it("renders a helpful app-level 404 with a home link", async () => {
    const filePath = resolve("app/not-found.tsx");
    expect(existsSync(filePath)).toBe(true);

    const { default: NotFound } = await import(/* @vite-ignore */ pathToFileURL(filePath).href);
    render(<NotFound />);

    expect(screen.getByRole("heading", { name: "페이지를 찾을 수 없습니다" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "무적수 라이브러리로 돌아가기" })).toHaveAttribute("href", "/");
  });
});
