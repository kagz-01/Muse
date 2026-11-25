import { describe, expect, it } from "vitest";
import { mapArtifactRow } from "./artifacts";

describe("artifact API mapping", () => {
  it("maps artifact columns to the room workspace shape", () => {
    expect(
      mapArtifactRow({
        id: "artifact-1",
        type: "youtube",
        source_url: "https://example.com/video",
        created_at: "2026-11-25T10:00:00.000Z",
      }),
    ).toEqual({
      id: "artifact-1",
      type: "youtube",
      sourceUrl: "https://example.com/video",
      createdAt: "2026-11-25T10:00:00.000Z",
    });
  });
});
