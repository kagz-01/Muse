import { createFileRoute } from "@tanstack/react-router";
import { getSessionUser, isDemoUser } from "../../../server/auth";
import { executeDB } from "../../../server/db";
import { hasRoomAccess } from "../../../server/rooms";
import { AI_ENGINE_URL } from "../../../server/services";

export const Route = createFileRoute("/api/artifacts/upload-document")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const userId = await getSessionUser(request);
        if (!userId) return new Response("Unauthorized", { status: 401 });
        if (isDemoUser(userId)) {
          return new Response("Demo users cannot upload documents", {
            status: 403,
          });
        }

        let form: FormData;
        try {
          form = await request.formData();
        } catch {
          return new Response("Invalid multipart form", { status: 400 });
        }
        const roomId = form.get("roomId")?.toString();
        const file = form.get("file");
        if (!roomId || !(file instanceof File)) {
          return new Response("Room ID and File required", { status: 400 });
        }

        try {
          if (!await hasRoomAccess(userId, roomId)) {
            return new Response("Room not found", { status: 404 });
          }

          const proxyForm = new FormData();
          proxyForm.append("file", file, file.name);
          const response = await fetch(
            `${AI_ENGINE_URL}/api/upload-document`,
            { method: "POST", body: proxyForm },
          );
          if (!response.ok) {
            return new Response(`AI Engine Error: ${await response.text()}`, {
              status: response.status,
            });
          }

          const scraped = await response.json();
          const filename = file.name.toLowerCase();
          let type = "document";
          if (filename.endsWith(".pdf")) type = "pdf";
          else if (filename.endsWith(".docx")) type = "word";
          else if (filename.endsWith(".xlsx") || filename.endsWith(".csv")) {
            type = "spreadsheet";
          }
          await executeDB(
            `INSERT INTO artifacts (room_id, type, source_url, unstructured_data)
             VALUES ($1, $2, $3, $4)`,
            roomId,
            type,
            file.name,
            JSON.stringify(scraped),
          );
          return Response.json({ success: true, type });
        } catch (error) {
          console.error("Document upload failed:", error);
          return new Response("Unable to upload document", { status: 500 });
        }
      },
    },
  },
});
