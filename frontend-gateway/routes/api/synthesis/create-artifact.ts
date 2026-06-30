interface LinkMetadata {
  title: string;
  description: string;
  image?: string;
  url: string;
  source: string;
}

interface ArtifactCreateRequest {
  metadata: LinkMetadata;
  roomId?: string;
}

interface Artifact {
  id: string;
  title: string;
  url: string;
  type: "link";
  metadata: LinkMetadata;
  roomId?: string;
  createdAt: string;
}

import { getSessionUser } from "../../../utils/auth.ts";
import { executeDB } from "../../../utils/db.ts";

export const handler = async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
    });
  }
  try {
    const userId = await getSessionUser(req);
    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }
    if (userId === "__demo__") {
      return new Response(JSON.stringify({ error: "Demo users cannot create artifacts" }), { status: 403 });
    }

    const { metadata, roomId }: ArtifactCreateRequest = await req.json();

    if (!metadata || !metadata.url) {
      return new Response(
        JSON.stringify({ error: "Metadata with URL required" }),
        { status: 400 },
      );
    }

    // Insert artifact into DB
    const result = await executeDB(
      `INSERT INTO artifacts (title, url, type, metadata, room_id, user_id, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING id, created_at`,
      metadata.title,
      metadata.url,
      "link",
      JSON.stringify(metadata),
      roomId || null,
      userId,
    );

    const id = (result as { rows: { id: string; created_at: string }[] }).rows[0].id;
    const createdAt = (result as { rows: { id: string; created_at: string }[] }).rows[0].created_at;

    return new Response(
      JSON.stringify({ id, title: metadata.title, url: metadata.url, type: "link", metadata, roomId, createdAt }),
      { status: 201, headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Failed to create artifact",
      }),
      { status: 400 },
    );
  }
};
