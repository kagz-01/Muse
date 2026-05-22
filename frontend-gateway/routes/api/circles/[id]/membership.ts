// Mock database for circle memberships
const circleMemberships = new Map<string, Set<string>>(); // circleId -> Set<userId>

export const handler = async (req: Request, ctx: any) => {
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
    });
  }

  try {
    const circleId = ctx.params.id;
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!circleId || !userId) {
      return new Response(
        JSON.stringify({ error: "circleId and userId required" }),
        { status: 400 }
      );
    }

    const members = circleMemberships.get(circleId);
    const isMember = members?.has(userId) ?? false;

    return new Response(
      JSON.stringify({ isMember, memberCount: members?.size || 0 }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
    });
  }
};
