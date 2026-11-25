import { beforeEach, describe, expect, it, vi } from "vitest";
import { getSessionUser } from "../../../server/auth";
import { executeDB, queryDB } from "../../../server/db";
import { getSocialResponse, postSocialResponse } from "./social";

vi.mock("../../../server/auth", () => ({
  getSessionUser: vi.fn(),
  isDemoUser: (userId: string | null) => userId === "__demo__",
}));
vi.mock("../../../server/db", () => ({
  executeDB: vi.fn(),
  queryDB: vi.fn(),
}));

describe("social API", () => {
  beforeEach(() => {
    vi.mocked(getSessionUser).mockReset();
    vi.mocked(executeDB).mockReset();
    vi.mocked(queryDB).mockReset();
    vi.mocked(getSessionUser).mockResolvedValue("user-1");
  });

  it("returns partner identity and streak fields for accepted entanglements", async () => {
    vi.mocked(queryDB).mockResolvedValue([
      {
        partner_id: "partner-1",
        partner_name: "Muse",
        partner_handle: "muse",
        partner_streak: 8,
      },
    ]);

    const response = await getSocialResponse(
      new Request("https://muse.test/api/user/social?action=entanglements"),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      entanglements: [{
        partner_id: "partner-1",
        partner_name: "Muse",
        partner_handle: "muse",
        partner_streak: 8,
      }],
    });
    expect(queryDB).toHaveBeenCalledWith(
      expect.stringContaining("ua.current_streak"),
      "user-1",
    );
  });

  it("blocks comments on items the user cannot access", async () => {
    vi.mocked(queryDB).mockResolvedValue([]);

    const response = await postSocialResponse(
      new Request("https://muse.test/api/user/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "comment",
          itemId: "item-1",
          content: "A comment",
        }),
      }),
    );

    expect(response.status).toBe(403);
    expect(queryDB).toHaveBeenCalledWith(
      expect.stringContaining("room_collaborators"),
      "item-1",
      "user-1",
    );
    expect(executeDB).not.toHaveBeenCalled();
  });

  it("allows collaborators to comment on room items", async () => {
    vi.mocked(queryDB).mockResolvedValue([{ id: "item-1" }]);

    const response = await postSocialResponse(
      new Request("https://muse.test/api/user/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "comment",
          itemId: "item-1",
          content: "  A useful connection  ",
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(executeDB).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO spark_comments"),
      "item-1",
      "user-1",
      "A useful connection",
    );
  });

  it("keeps social mutations disabled for demo sessions", async () => {
    vi.mocked(getSessionUser).mockResolvedValue("__demo__");

    const response = await postSocialResponse(
      new Request("https://muse.test/api/user/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send_request", addresseeId: "user-2" }),
      }),
    );

    expect(response.status).toBe(403);
    expect(executeDB).not.toHaveBeenCalled();
  });
});
