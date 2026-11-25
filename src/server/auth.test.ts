import { describe, expect, it } from "vitest";
import {
  clearDemoCookie,
  getSessionUser,
  setDemoCookie,
} from "./auth";

describe("session helpers", () => {
  it("recognizes a demo session without a database lookup", async () => {
    const request = new Request("http://localhost/api/auth/session", {
      headers: { cookie: "muse_demo_session=1" },
    });

    await expect(getSessionUser(request)).resolves.toBe("__demo__");
  });

  it("returns null when the request has no session cookie", async () => {
    const request = new Request("http://localhost/api/auth/session");

    await expect(getSessionUser(request)).resolves.toBeNull();
  });

  it("sets and clears the HTTP-only demo cookie", () => {
    const headers = new Headers();

    setDemoCookie(headers);
    expect(headers.get("set-cookie")).toContain(
      "muse_demo_session=1; Max-Age=7200; Path=/; HttpOnly; SameSite=Lax",
    );

    const clearedHeaders = new Headers();
    clearDemoCookie(clearedHeaders);
    expect(clearedHeaders.get("set-cookie")).toContain(
      "muse_demo_session=; Max-Age=0",
    );
  });
});
