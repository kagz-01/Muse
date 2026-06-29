import { useEffect, useState } from "preact/hooks";
import * as Icons from "lucide-preact";
import ThreadCard, { ThreadData } from "../../components/rooms/ThreadCard.tsx";
import JournalModal from "./JournalModal.tsx";

interface ArtifactData {
  id: string;
  type: string;
  source_url: string;
}

interface RoomClientManagerProps {
  room: { id: string; theme_color: string };
  threads: ThreadData[];
  artifacts: ArtifactData[];
}

export default function RoomClientManager(
  { room, threads, artifacts }: RoomClientManagerProps,
) {
  const [artifactList, setArtifactList] = useState<ArtifactData[]>(artifacts);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    threadId: string;
    question: string;
  }>({
    isOpen: false,
    threadId: "",
    question: "",
  });

  useEffect(() => {
    const handleArtifactAdded = (event: Event) => {
      const customEvent = event as CustomEvent<ArtifactData & { roomId: string }>;
      const detail = customEvent.detail;
      if (detail.roomId !== room.id) return;
      setArtifactList((current) => [{
        id: detail.id,
        type: detail.type,
        source_url: detail.source_url,
        created_at: detail.created_at,
      }, ...current]);
    };

    window.addEventListener("muse:artifact-added", handleArtifactAdded as EventListener);
    return () => {
      window.removeEventListener(
        "muse:artifact-added",
        handleArtifactAdded as EventListener,
      );
    };
  }, [room.id]);

  const handleQuestionClick = (threadId: string, question: string) => {
    setModalState({ isOpen: true, threadId, question });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      // @ts-ignore: Lucide JSX mismatch
      case "pdf":
        return <Icons.FileText size={16} />;
      // @ts-ignore: Lucide JSX mismatch
      case "youtube":
        return <Icons.Video size={16} />;
      // @ts-ignore: Lucide JSX mismatch
      case "social":
        return <Icons.MessageCircle size={16} />;
      // @ts-ignore: Lucide JSX mismatch
      case "spreadsheet":
        return <Icons.Table size={16} />;
      // @ts-ignore: Lucide JSX mismatch
      case "word":
        return <Icons.FileEdit size={16} />;
      // @ts-ignore: Lucide JSX mismatch
      default:
        return <Icons.Link size={16} />;
    }
  };

  return (
    <>
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
            {threads.map((thread) => (
              <ThreadCard
                key={thread.id}
                thread={thread}
                themeColor={room.theme_color}
                onQuestionClick={handleQuestionClick}
              />
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
            {artifactList.length} Artifacts
          </span>
        </div>

        {artifacts.length === 0
          ? (
            <div className="p-8 text-center bg-[var(--muse-surface)] border border-[var(--muse-border)] border-dashed rounded-2xl">
              <Icons.Ghost
                size={32}
                className="mx-auto text-[var(--muse-muted)] mb-3 opacity-50"
              />
              <h3 className="text-[var(--muse-text)] font-medium mb-1">
                The Ledger is Empty
              </h3>
              <p className="text-xs text-[var(--muse-muted)]">
                Upload a document or paste a link to begin synthesis.
              </p>
            </div>
          )
          : (
            <div className="space-y-3">
              {artifactList.map((artifact) => (
                <div
                  key={artifact.id}
                  className="group p-4 bg-[var(--muse-surface)] hover:bg-white/[0.02] border border-[var(--muse-border)] hover:border-white/10 rounded-2xl flex items-center justify-between transition-all cursor-pointer"
                >
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

      {/* Journal Modal */}
      <JournalModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        threadId={modalState.threadId}
        question={modalState.question}
        themeColor={room.theme_color}
      />
    </>
  );
}
