import { beforeEach, describe, expect, it, vi } from "vitest";
import { queryDB } from "./db";
import { hasRoomAccess, mapRoomRow, parseRoomInput } from "./rooms";

vi.mock("./db", () => ({ queryDB: vi.fn() }));

describe("room API mapping", () => {
  it("maps database fields to the room shape and computes counts", () => {
    expect(
      mapRoomRow({
        id: "room-1",
        title: "Focus",
        theme_color: "indigo",
        is_public: true,
        tags: ["work"],
        item_count: "3",
      }),
    ).toMatchObject({
      id: "room-1",
      name: "Focus",
      themeColor: "indigo",
      isPublic: true,
      tags: ["work"],
      count: 3,
      size: "medium",
    });
  });

  it("rejects malformed or empty room names and non-string tags", () => {
    expect(parseRoomInput({ name: " " }, true)).toBeNull();
    expect(parseRoomInput({ name: "Muse", tags: ["valid", 1] }, true))
      .toBeNull();
  });

  it("validates optional fields without allowing null values for required types", () => {
    expect(parseRoomInput({ size: null })).toBeNull();
    expect(parseRoomInput({ resonanceMetrics: null })).toBeNull();
    expect(parseRoomInput({ customStyling: null })).toMatchObject({
      customStyling: null,
    });
  });

  describe("room access", () => {
    beforeEach(() => {
      vi.mocked(queryDB).mockReset();
    });

    it("allows room owners and collaborators returned by the access query", async () => {
      vi.mocked(queryDB).mockResolvedValue([{ id: "room-1" }] as never);

      await expect(hasRoomAccess("user-1", "room-1")).resolves.toBe(true);
      expect(queryDB).toHaveBeenCalledWith(
        expect.stringContaining("rc.user_id = $2"),
        "room-1",
        "user-1",
      );
    });

    it("denies users with no matching room access row", async () => {
      vi.mocked(queryDB).mockResolvedValue([]);

      await expect(hasRoomAccess("user-2", "room-1")).resolves.toBe(false);
    });
  });
});
