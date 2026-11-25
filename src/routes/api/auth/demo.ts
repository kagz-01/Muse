import { createFileRoute } from "@tanstack/react-router";
import { setDemoCookie } from "../../../server/auth";

export const Route = createFileRoute("/api/auth/demo")({
  server: {
    handlers: {
      POST: () => {
        const headers = new Headers();
        setDemoCookie(headers);
        headers.set("location", "/dashboard");
        return new Response(null, { status: 303, headers });
      },
    },
  },
});
