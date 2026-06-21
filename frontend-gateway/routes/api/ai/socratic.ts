import { FreshContext } from "$fresh/server.ts";
import { generateDynamicSocraticQuestion } from "../../../utils/ai.ts";

interface SocraticRequest {
  userName: string;
  recentText: string;
  contextItems: { title: string; note?: string }[];
}

export const handler = {
  async POST(req: Request, _ctx: FreshContext): Promise<Response> {
    try {
      const body = await req.json() as SocraticRequest;
      
      if (!body.recentText) {
        return new Response(JSON.stringify({ error: "Missing recentText" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const question = await generateDynamicSocraticQuestion(
        body.userName || "Traveler",
        body.recentText,
        body.contextItems || []
      );

      return new Response(JSON.stringify({ question }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
      
    } catch (error) {
      console.error("Socratic Question Error:", error);
      return new Response(JSON.stringify({ 
        error: "Failed to generate socratic question",
        details: error instanceof Error ? error.message : "Unknown error"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};
