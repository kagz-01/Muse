import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { hashToken } from "./crypto";

describe("hashToken", () => {
  it("uses a stable SHA-256 digest for stored reset tokens", () => {
    const token = "muse-reset-token";
    const expected = createHash("sha256").update(token).digest("hex");

    expect(hashToken(token)).toBe(expected);
  });
});
