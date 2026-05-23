// Mock database for circle memberships
const circleMemberships = new Map<string, Set<string>>(); // circleId -> Set<userId>

export const handler = async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
    });
  }

  try {
    const { userId, circleId } = await req.json();

    if (!userId || !circleId) {
      return new Response(
        JSON.stringify({ error: "userId and circleId required" }),
        { status: 400 },
      );
    }

    if (circleMemberships.has(circleId)) {
      const members = circleMemberships.get(circleId)!;
      members.delete(userId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        isMember: false,
        memberCount: circleMemberships.get(circleId)?.size || 0,
      }),
      { status: 200 },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
    });
  }
};
