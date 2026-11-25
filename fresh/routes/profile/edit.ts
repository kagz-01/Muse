import { Handlers } from "$fresh/server.ts";

/** /profile/edit → redirect to /settings which has the full profile form */
export const handler: Handlers = {
  GET() {
    return new Response(null, {
      status: 302,
      headers: { location: "/settings" },
    });
  },
};
