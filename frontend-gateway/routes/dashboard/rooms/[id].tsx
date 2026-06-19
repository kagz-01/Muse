import { Handlers, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import { getSessionUser } from "../../../utils/auth.ts";
import { queryDB } from "../../../utils/db.ts";
import DashboardLayout from "../../../islands/dashboard/DashboardLayout.tsx";
import ArtifactUploader from "../../../islands/rooms/ArtifactUploader.tsx";
import SynthesisTrigger from "../../../islands/rooms/SynthesisTrigger.tsx";
import ThreadCard, { ThreadData } from "../../../components/rooms/ThreadCard.tsx";
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
    const users = await queryDB("SELECT username, email FROM users WHERE id = $1", userId);
    if (users.length === 0) return new Response("", { status: 303, headers: { location: "/" } });
    const userRow = users[0] as Record<string, string>;

    // Fetch Room Data
    const rooms = await queryDB("SELECT id, title, description, theme_color, tags FROM rooms WHERE id = $1 AND user_id = $2", roomId, userId);
    if (rooms.length === 0) return new Response("Room not found", { status: 404 });
    const roomRow = rooms[0] as any;

    // Fetch Artifacts
    const artifactsRaw = await queryDB(
      "SELECT id, type, source_url, created_at FROM artifacts WHERE room_id = $1 ORDER BY created_at DESC", 
      roomId
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
      roomId
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
    case 'pdf': return <Icons.FileText size={16} />;
    case 'youtube': return <Icons.Youtube size={16} />;
    case 'social': return <Icons.Twitter size={16} />;
    case 'spreadsheet': return <Icons.Table size={16} />;
    case 'word': return <Icons.FileEdit size={16} />;
    default: return <Icons.Link size={16} />;
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
            <a href="/dashboard" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--muse-muted)] hover:text-[var(--muse-text)] transition-colors mb-6">
              <Icons.ArrowLeft size={14} /> Back to Ecosystem
            </a>
            
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-[var(--muse-text)] mb-3" style={{ textShadow: `0 0 40px ${room.theme_color}40` }}>
                  {room.title}
                </h1>
                <p className="text-[var(--muse-muted)] text-lg max-w-2xl font-serif italic mb-4">
                  {room.description || "Synthesizing new patterns."}
                </p>
                <div className="flex gap-2">
                  {room.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 rounded-md bg-[var(--muse-surface)] border border-[var(--muse-border)] text-xs font-bold uppercase tracking-wider text-[var(--muse-muted)]">
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
                  <ArtifactUploader roomId={room.id} themeColor={room.theme_color} />
                </div>

                {/* Synthesis Trigger */}
                {artifacts.length > 0 && (
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--muse-muted)] mb-4">
                      AI Synthesis Engine
                    </h2>
                    <SynthesisTrigger roomId={room.id} themeColor={room.theme_color} />
                  </div>
                )}
                
              </div>
            </div>

            {/* RIGHT COL: Ledger & Threads (8 Cols wide) */}
            <div className="lg:col-span-8">
              
              {/* Threads Section */}
              {threads.length > 0 && (
                <div className="mb-16">
                  <div className="flex items-center gap-3 mb-6">
                    <Icons.Network size={20} className="text-[var(--muse-text)]" />
                    <h2 className="text-xl font-bold tracking-tight text-[var(--muse-text)]">
                      Synthesized Threads
                    </h2>
                  </div>
                  
                  <div className="space-y-6">
                    {threads.map(thread => (
                      <ThreadCard key={thread.id} thread={thread} themeColor={room.theme_color} />
                    ))}
                  </div>
                </div>
              )}

              {/* Cognitive Ledger (Raw Artifacts) */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--muse-muted)]">
                    Cognitive Ledger (Raw Data)
                  </h2>
                  <span className="text-xs font-medium text-[var(--muse-muted)] bg-[var(--muse-surface)] px-2 py-1 rounded-md border border-[var(--muse-border)]">
                    {artifacts.length} Artifacts
                  </span>
                </div>

                {artifacts.length === 0 ? (
                  <div className="p-8 text-center bg-[var(--muse-surface)] border border-[var(--muse-border)] border-dashed rounded-2xl">
                    <Icons.Ghost size={32} className="mx-auto text-[var(--muse-muted)] mb-3 opacity-50" />
                    <h3 className="text-[var(--muse-text)] font-medium mb-1">The Ledger is Empty</h3>
                    <p className="text-xs text-[var(--muse-muted)]">Upload a document or paste a link to begin synthesis.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {artifacts.map(artifact => (
                      <div key={artifact.id} className="group p-4 bg-[var(--muse-surface)] hover:bg-white/[0.02] border border-[var(--muse-border)] hover:border-white/10 rounded-2xl flex items-center justify-between transition-all cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-[var(--muse-bg)] border border-[var(--muse-border)] flex items-center justify-center text-[var(--muse-muted)] group-hover:text-canvas-primary transition-colors">
                            {getTypeIcon(artifact.type)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[var(--muse-text)] max-w-sm truncate">
                              {artifact.source_url}
                            </p>
                            <p className="text-xs text-[var(--muse-muted)] uppercase tracking-wider mt-1">
                              {artifact.type}
                            </p>
                          </div>
                        </div>
                        <button className="text-[var(--muse-muted)] opacity-0 group-hover:opacity-100 hover:text-[var(--muse-text)] transition-all">
                          <Icons.ArrowUpRight size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
            </div>
          </div>

        </div>
      </DashboardLayout>
    </>
  );
}
