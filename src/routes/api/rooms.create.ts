import { createFileRoute } from "@tanstack/react-router";
import { getSessionUser, isDemoUser } from "../../server/auth";
import {
  createRoomRecord,
  parseRoomForm,
} from "../../server/rooms";

export const Route = createFileRoute("/api/rooms/create")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const userId = await getSessionUser(request);
          if (!userId) return new Response("Unauthorized", { status: 401 });
          if (isDemoUser(userId)) {
            return Response.json(
              { error: "Demo users cannot create rooms" },
              { status: 403 },
            );
          }

          let form: FormData;
          try {
            form = await request.formData();
          } catch {
            return new Response("Invalid form data", { status: 400 });
          }
          const input = parseRoomForm(form);
          if (!input?.name) {
            return new Response("Title is required", { status: 400 });
          }

          const room = await createRoomRecord(userId, input);
          return Response.json({ id: room.id });
        } catch (error) {
          console.error("Room creation request failed:", error);
          return new Response("Internal Server Error", { status: 500 });
        }
      },
    },
  },
});
