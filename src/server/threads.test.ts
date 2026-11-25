import { describe, expect, it } from "vitest";
import { mapThreadRow } from "./threads";

describe("thread API mapping", () => {
  it("retains the generated AI blueprint for room detail pages", () => {
    const blueprint = {
      theme: "Attention",
      summary: "Small signals build lasting habits.",
      socratic_questions: ["What deserves your attention?"],
    };

    expect(
      mapThreadRow({
        id: "thread-1",
        ai_blueprint: blueprint,
        artifact_ids: ["artifact-1"],
      }),
    ).toMatchObject({
      id: "thread-1",
      aiBlueprint: blueprint,
      itemIds: ["artifact-1"],
    });
  });
});
