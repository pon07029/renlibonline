import { describe, expect, it } from "vitest";
import nextConfig from "./next.config";
import * as configModule from "./next.config";

describe("next config", () => {
  it("keeps compression enabled and caches sequence data responses", async () => {
    expect(nextConfig.compress).not.toBe(false);

    const headers = await nextConfig.headers?.();
    const sequenceHeaders = headers?.find((entry) => entry.source === "/sequences/:path*");

    expect(sequenceHeaders?.headers).toContainEqual({
      key: "Cache-Control",
      value: "public, max-age=86400, stale-while-revalidate=604800",
    });
  });

  it("keeps dev-only origins environment-driven instead of hard-coded", () => {
    expect(configModule.parseAllowedDevOrigins).toBeTypeOf("function");

    const parseAllowedDevOrigins = configModule.parseAllowedDevOrigins as (value?: string) => string[];

    expect(parseAllowedDevOrigins()).toEqual([]);
    expect(parseAllowedDevOrigins("210.217.27.252, 210.217.27.252:3001")).toEqual([
      "210.217.27.252",
      "210.217.27.252:3001",
    ]);
    expect(nextConfig.allowedDevOrigins).toEqual(parseAllowedDevOrigins(process.env.NEXT_ALLOWED_DEV_ORIGINS));
  });
});
