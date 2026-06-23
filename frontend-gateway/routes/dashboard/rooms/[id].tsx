import { Handlers, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import { getSessionUser } from "../../../utils/auth.ts";
import { queryDB } from "../../../utils/db.ts";
import DashboardLayout from "../../../islands/dashboard/DashboardLayout.tsx";
import ArtifactUploader from "../../../islands/rooms/ArtifactUploader.tsx";
import SynthesisTrigger from "../../../islands/rooms/SynthesisTrigger.tsx";
import RoomClientManager from "../../../islands/rooms/RoomClientManager.tsx";
import { ThreadData } from "../../../components/rooms/ThreadCard.tsx";
import * as Icons from "lucide-preact";

interface ArtifactData {
  id: string;
  type: string;
  source_url: string;
  created_at: string;
}

interface RoomInteriorData {
  user: {
    username: string;
    email: string;
  };
  room: {
    id: string;
    title: string;
    description: string;
    theme_color: string;
    tags: string[];
  };
  artifacts: ArtifactData[];
  threads: ThreadData[];
}

export const handler: Handlers<RoomInteriorData> = {
  async GET(req, ctx) {
    const userId = await getSessionUser(req);
    if (!userId) {
      return new Response("", { status: 303, headers: { location: "/" } });
    }

    const roomId = ctx.params.id;

    // Fetch User Data
    const users = await queryDB(
      "SELECT username, email FROM users WHERE id = $1",
      userId,
    );
    if (users.length === 0) {
      return new Response("", { status: 303, headers: { location: "/" } });
    }
    const userRow = users[0] as Record<string, string>;

    // Fetch Room Data
    const rooms = await queryDB(
      "SELECT id, title, description, theme_color, tags FROM rooms WHERE id = $1 AND user_id = $2",
      roomId,
      userId,
    );
    if (rooms.length === 0) {
      return new Response("Room not found", { status: 404 });
    }
    const roomRow = rooms[0] as any;

    // Fetch Artifacts
    const artifactsRaw = await queryDB(
      "SELECT id, type, source_url, created_at FROM artifacts WHERE room_id = $1 ORDER BY created_at DESC",
      roomId,
    );

    const artifacts: ArtifactData[] = artifactsRaw.map((a: any) => ({
      id: a.id,
      type: a.type,
      source_url: a.source_url,
      created_at: a.created_at.toISOString(),
    }));

    // Fetch Threads (AI Blueprints)
    const threadsRaw = await queryDB(
      "SELECT id, artifact_ids, ai_blueprint, created_at FROM threads WHERE room_id = $1 ORDER BY created_at DESC",
      roomId,
    );

    const threads: ThreadData[] = threadsRaw.map((t: any) => ({
      id: t.id,
      artifact_ids: t.artifact_ids || [],
      blueprint: t.ai_blueprint,
      created_at: t.created_at.toISOString(),
    }));

    return ctx.render({
      user: { username: userRow.username, email: userRow.email },
      room: {
        id: roomRow.id,
        title: roomRow.title,
        description: roomRow.description,
        theme_color: roomRow.theme_color,
        tags: roomRow.tags || [],
      },
      artifacts,
      threads,
    });
  },
};

// Helper for icons based on artifact type
function getTypeIcon(type: string) {
  switch (type) {
    // @ts-ignore: JSX mismatch
    case "pdf":
      return <Icons.FileText size={16} />;
    // @ts-ignore: JSX mismatch
    case "youtube":
      return <Icons.Video size={16} />;
    // @ts-ignore: JSX mismatch
    case "social":
      return <Icons.MessageCircle size={16} />;
    // @ts-ignore: JSX mismatch
    case "spreadsheet":
      return <Icons.Table size={16} />;
    // @ts-ignore: JSX mismatch
    case "word":
      return <Icons.FileEdit size={16} />;
    // @ts-ignore: JSX mismatch
    default:
      return <Icons.Link size={16} />;
  }
}

export default function RoomInterior({ data }: PageProps<RoomInteriorData>) {
  const { user, room, artifacts, threads } = data;

  return (
    <>
      <Head>
        <title>{room.title} | Muse</title>
      </Head>
      <DashboardLayout user={user}>
        <div className="max-w-5xl mx-auto pb-20 animate-in fade-in duration-500">
          {/* Back button & Header */}
          <div className="mb-8">
            <a
              href="/dashboard"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--muse-muted)] hover:text-[var(--muse-text)] transition-colors mb-6"
            >
              <Icons.ArrowLeft size={14} /> Back to Ecosystem
            </a>

            <div className="flex items-start justify-between">
              <div>
                <h1
                  className="text-4xl font-bold tracking-tight text-[var(--muse-text)] mb-3"
                  style={{ textShadow: `0 0 40px ${room.theme_color}40` }}
                >
                  {room.title}
                </h1>
                <p className="text-[var(--muse-muted)] text-lg max-w-2xl font-serif italic mb-4">
                  {room.description || "Synthesizing new patterns."}
                </p>
                <div className="flex gap-2">
                  {room.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-md bg-[var(--muse-surface)] border border-[var(--muse-border)] text-xs font-bold uppercase tracking-wider text-[var(--muse-muted)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center bg-[var(--muse-surface)] border border-[var(--muse-border)] shadow-2xl rotate-3"
                style={{ color: room.theme_color }}
              >
                <Icons.BrainCircuit size={28} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* LEFT COL: Ingestion & Triggers (3 Cols wide) */}
            <div className="lg:col-span-4">
              <div className="sticky top-8 space-y-12">
                {/* Uploader */}
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--muse-muted)] mb-4">
                    Ingest Artifacts
                  </h2>
                  <ArtifactUploader
                    roomId={room.id}
                    themeColor={room.theme_color}
                  />
                </div>

                {/* Synthesis Trigger */}
                {artifacts.length > 0 && (
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--muse-muted)] mb-4">
                      AI Synthesis Engine
                    </h2>
                    <SynthesisTrigger
                      roomId={room.id}
                      themeColor={room.theme_color}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COL: Ledger & Threads (8 Cols wide) */}
            <div className="lg:col-span-8">
              <RoomClientManager
                room={{ id: room.id, theme_color: room.theme_color }}
                threads={threads}
                artifacts={artifacts}
              />
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
