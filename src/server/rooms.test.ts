import { describe, expect, it } from "vitest";
import { mapRoomRow, parseRoomInput } from "./rooms";

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
});
