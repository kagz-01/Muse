// Mock database
const mockMembers: Record<
  string,
  Array<{
    userId: string;
    name: string;
    username: string;
    avatar: string;
    joinedAt: string;
    role: "founder" | "moderator" | "member";
    resonanceScore: number;
  }>
> = {
  "circle-1": [
    {
      userId: "user-456",
      name: "Alex Chen",
      username: "alexchen",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
      joinedAt: new Date(Date.now() - 30 * 24 * 3600000).toISOString(),
      role: "founder",
      resonanceScore: 95,
    },
    {
      userId: "user-789",
      name: "Sam Rodriguez",
      username: "samrod",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sam",
      joinedAt: new Date(Date.now() - 15 * 24 * 3600000).toISOString(),
      role: "moderator",
      resonanceScore: 88,
    },
  ],
};

export const handler = async (req: Request, ctx: any) => {
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
    });
  }

  try {
    const circleId = ctx.params.id;

    if (!circleId) {
      return new Response(JSON.stringify({ error: "circleId required" }), {
        status: 400,
      });
    }

    const members = mockMembers[circleId] || [];

    return new Response(JSON.stringify({ members }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
    });
  }
};
