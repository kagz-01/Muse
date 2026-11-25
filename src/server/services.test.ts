import { afterEach, describe, expect, it, vi } from "vitest";
import { probeService } from "./services";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("probeService", () => {
  it("reports an available service response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(null, { status: 204 })),
    );

    await expect(probeService("http://service.test/")).resolves.toEqual({
      status: "up",
      statusCode: 204,
      endpoint: "http://service.test/",
    });
  });

  it("reports network failures as a down service", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new Error("offline");
    }));

    await expect(probeService("http://service.test/")).resolves.toEqual({
      status: "down",
      statusCode: null,
      endpoint: "http://service.test/",
    });
  });
});
