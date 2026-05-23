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

// Mock database for artifacts
const artifactsDatabase = new Map<string, Artifact>();
let artifactCounter = 0;

export const handler = async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
    });
  }

  try {
    const { metadata, roomId }: ArtifactCreateRequest = await req.json();

    if (!metadata || !metadata.url) {
      return new Response(
        JSON.stringify({ error: "Metadata with URL required" }),
        { status: 400 },
      );
    }

    const artifactId = `artifact-${++artifactCounter}`;
    const artifact: Artifact = {
      id: artifactId,
      title: metadata.title,
      url: metadata.url,
      type: "link",
      metadata,
      roomId,
      createdAt: new Date().toISOString(),
    };

    artifactsDatabase.set(artifactId, artifact);

    return new Response(JSON.stringify(artifact), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Failed to create artifact",
      }),
      { status: 400 },
    );
  }
};
