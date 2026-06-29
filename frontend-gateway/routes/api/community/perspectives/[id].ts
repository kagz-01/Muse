import { Handlers } from "$fresh/server.ts";
import { getSessionUser } from "../../../../utils/auth.ts";

const kv = await Deno.openKv();

interface PerspectiveReactionCounts {
  alignCount: number;
  challengeCount: number;
}

const defaultCounts: PerspectiveReactionCounts = {
  alignCount: 0,
  challengeCount: 0,
};

async function getCounts(id: string) {
  const result = await kv.get<PerspectiveReactionCounts>([
    "perspective_reactions",
    id,
  ]);
  return result.value ?? { ...defaultCounts };
}

async function setCounts(id: string, counts: PerspectiveReactionCounts) {
  await kv.set([
    "perspective_reactions",
    id,
  ], counts);
  return counts;
}

export const handler: Handlers = {
  async GET(_req, ctx) {
    const perspectiveId = ctx.params.id;
    if (!perspectiveId) {
      return new Response(
        JSON.stringify({ error: "Missing perspective id" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const counts = await getCounts(perspectiveId);
    return new Response(JSON.stringify(counts), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  },

  async POST(req, ctx) {
    const userId = await getSessionUser(req);
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      );
    }

    const perspectiveId = ctx.params.id;
    if (!perspectiveId) {
      return new Response(
        JSON.stringify({ error: "Missing perspective id" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const body = await req.json().catch(() => ({}));
    const action = String(body?.action || "");
    if (action !== "align" && action !== "challenge") {
      return new Response(
        JSON.stringify({ error: "Invalid action" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const counts = await getCounts(perspectiveId);
    const updatedCounts = {
      ...counts,
      alignCount: action === "align" ? counts.alignCount + 1 : counts.alignCount,
      challengeCount: action === "challenge"
        ? counts.challengeCount + 1
        : counts.challengeCount,
    };

    await setCounts(perspectiveId, updatedCounts);

    return new Response(JSON.stringify(updatedCounts), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  },
};
