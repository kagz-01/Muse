import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, BrainCircuit, FileText, Link2, LoaderCircle, Pencil, Sparkles } from "lucide-react";
import type { MuseArtifact } from "../server/artifacts";
import type { MuseRoom } from "../server/rooms";
import type { MuseThread } from "../server/threads";

interface RoomWorkspace {
  room: MuseRoom;
  artifacts: MuseArtifact[];
  threads: MuseThread[];
}

interface Blueprint {
  theme: string;
  summary: string;
  questions: string[];
}

async function loadRoomWorkspace(roomId: string): Promise<RoomWorkspace> {
  const encodedId = encodeURIComponent(roomId);
  const [roomResponse, artifactsResponse, threadsResponse] = await Promise.all([
    fetch(`/api/rooms/${encodedId}`, { credentials: "same-origin" }),
    fetch(`/api/artifacts?roomId=${encodedId}`, { credentials: "same-origin" }),
    fetch(`/api/threads?roomId=${encodedId}`, { credentials: "same-origin" }),
  ]);

  if ([roomResponse, artifactsResponse, threadsResponse].some((response) =>
    response.status === 401
  )) {
    globalThis.location.replace("/");
    throw new Error("Your session has expired.");
  }

  for (const [response, label] of [
    [roomResponse, "room"],
    [artifactsResponse, "artifacts"],
    [threadsResponse, "threads"],
  ] as const) {
    if (!response.ok) {
      throw new Error(
        await response.text() || `Unable to load ${label}.`,
      );
    }
  }

  const [room, artifacts, threads] = await Promise.all([
    roomResponse.json() as Promise<MuseRoom>,
    artifactsResponse.json() as Promise<MuseArtifact[]>,
    threadsResponse.json() as Promise<MuseThread[]>,
  ]);
  return { room, artifacts, threads };
}

function readBlueprint(value: unknown): Blueprint | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  const blueprint = value as Record<string, unknown>;
  const questions = Array.isArray(blueprint.socratic_questions)
    ? blueprint.socratic_questions.filter(
      (question): question is string => typeof question === "string",
    )
    : [];
  return {
    theme: typeof blueprint.theme === "string" ? blueprint.theme : "Synthesis",
    summary: typeof blueprint.summary === "string" ? blueprint.summary : "",
    questions,
  };
}

export const Route = createFileRoute("/rooms/$id")({
  component: DashboardRoomPage,
});

function DashboardRoomPage() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isEditPage = pathname.endsWith("/edit");
  const { id } = Route.useParams();
  const [workspace, setWorkspace] = useState<RoomWorkspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isIngesting, setIsIngesting] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [question, setQuestion] = useState<{ threadId: string; text: string } | null>(null);
  const [thought, setThought] = useState("");
  const [isSavingThought, setIsSavingThought] = useState(false);
  const [capturedHash, setCapturedHash] = useState("");

  const refresh = async () => {
    const loaded = await loadRoomWorkspace(id);
    setWorkspace(loaded);
  };

  useEffect(() => {
    if (isEditPage) return;
    let active = true;
    setIsLoading(true);
    setWorkspace(null);
    setError("");
    void loadRoomWorkspace(id)
      .then((loaded) => {
        if (active) setWorkspace(loaded);
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(
            loadError instanceof Error ? loadError.message : "Unable to load room.",
          );
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, isEditPage]);

  if (isEditPage) return <Outlet />;

  const ingestUrl = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setIsIngesting(true);
    try {
      const response = await fetch("/api/artifacts/ingest-url", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, roomId: id }),
      });
      if (!response.ok) throw new Error(await response.text());
      setUrl("");
      await refresh();
      setNotice("Signal added to this room.");
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Unable to ingest URL.",
      );
    } finally {
      setIsIngesting(false);
    }
  };

  const uploadDocument = async (file: File) => {
    setError("");
    setNotice("");
    setIsIngesting(true);
    try {
      const form = new FormData();
      form.append("roomId", id);
      form.append("file", file);
      const response = await fetch("/api/artifacts/upload-document", {
        method: "POST",
        credentials: "same-origin",
        body: form,
      });
      if (!response.ok) throw new Error(await response.text());
      await refresh();
      setNotice("Document added to this room.");
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Unable to upload document.",
      );
    } finally {
      setIsIngesting(false);
    }
  };

  const synthesize = async () => {
    setError("");
    setNotice("");
    setIsSynthesizing(true);
    try {
      const response = await fetch("/api/threads/synthesize", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: id }),
      });
      if (!response.ok) throw new Error(await response.text());
      const result = await response.json() as { message?: string };
      await refresh();
      setNotice(result.message || "Synthesis complete.");
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Synthesis failed.",
      );
    } finally {
      setIsSynthesizing(false);
    }
  };

  const captureThought = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!question || !thought.trim()) return;
    setError("");
    setIsSavingThought(true);
    try {
      const response = await fetch("/api/journal", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawThought: thought.trim(),
          threadId: question.threadId,
          synthesizedContext: { question: question.text },
        }),
      });
      if (!response.ok) throw new Error(await response.text());
      const result = await response.json() as {
        entry?: { blockchainHash?: string };
      };
      setCapturedHash(result.entry?.blockchainHash ?? "");
      setThought("");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to capture reflection.",
      );
    } finally {
      setIsSavingThought(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--muse-bg)] px-5 py-8 text-[var(--muse-text)] md:px-10 md:py-12">
      <div className="mx-auto max-w-6xl">
        <a
          href="/dashboard"
          className="mb-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--muse-muted)] hover:text-[var(--muse-text)]"
        >
          <ArrowLeft size={15} aria-hidden="true" />
          Back to dashboard
        </a>
        {workspace && (
          <a
            href={`/rooms/${encodeURIComponent(id)}/edit`}
            className="mb-8 ml-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--muse-muted)] hover:text-[var(--muse-text)]"
          >
            <Pencil size={14} aria-hidden="true" />
            Edit room
          </a>
        )}

        {error && (
          <p role="alert" className="mb-6 rounded-2xl border border-red-400/30 bg-red-950/30 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="mb-6 rounded-2xl border border-emerald-400/30 bg-emerald-950/20 px-4 py-3 text-sm text-emerald-200">
            {notice}
          </p>
        )}

        {isLoading ? (
          <p className="rounded-3xl border border-[var(--muse-border)] p-8 text-[var(--muse-muted)]">
            Loading room…
          </p>
        ) : !workspace ? (
          <p className="rounded-3xl border border-[var(--muse-border)] p-8 text-[var(--muse-muted)]">
            Room not found.
          </p>
        ) : (
          <>
            <header className="mb-10">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-canvas-primary">
                {workspace.room.category || "Room"}
              </p>
              <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
                {workspace.room.emoji ? `${workspace.room.emoji} ` : ""}
                {workspace.room.name}
              </h1>
              <p className="mt-4 max-w-3xl font-serif text-lg italic text-[var(--muse-muted)]">
                {workspace.room.description || "A space for collecting and connecting signals."}
              </p>
              {workspace.room.tags.length > 0 && (
                <ul className="mt-5 flex flex-wrap gap-2" aria-label="Room tags">
                  {workspace.room.tags.map((tag) => (
                    <li key={tag} className="rounded-lg border border-[var(--muse-border)] px-3 py-1 text-xs uppercase tracking-wider text-[var(--muse-muted)]">
                      {tag}
                    </li>
                  ))}
                </ul>
              )}
            </header>

            <div className="grid gap-10 lg:grid-cols-[minmax(16rem,1fr)_minmax(0,2fr)]">
              <section className="space-y-8">
                <div className="rounded-3xl border border-[var(--muse-border)] bg-[var(--muse-surface)] p-6">
                  <h2 className="mb-5 text-sm font-bold uppercase tracking-widest">
                    Add a signal
                  </h2>
                  <form onSubmit={ingestUrl} className="space-y-3">
                    <label htmlFor="room-signal-url" className="sr-only">
                      Signal URL
                    </label>
                    <input
                      id="room-signal-url"
                      type="url"
                      required
                      value={url}
                      onChange={(event) => setUrl(event.currentTarget.value)}
                      placeholder="Paste an article or video URL"
                      disabled={isIngesting}
                      className="w-full rounded-xl border border-[var(--muse-border)] bg-[var(--muse-bg)] px-4 py-3 text-sm outline-none focus:border-canvas-primary disabled:opacity-60"
                    />
                    <button
                      type="submit"
                      disabled={isIngesting || !url.trim()}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--muse-text)] px-4 py-3 text-xs font-bold uppercase tracking-widest text-[var(--muse-bg)] disabled:opacity-50"
                    >
                      {isIngesting ? <LoaderCircle size={15} className="animate-spin" /> : <Link2 size={15} />}
                      Ingest URL
                    </button>
                  </form>
                  <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--muse-border)] px-4 py-5 text-sm text-[var(--muse-muted)] hover:text-[var(--muse-text)]">
                    {isIngesting ? <LoaderCircle size={16} className="animate-spin" /> : <FileText size={16} />}
                    Upload a document
                    <input
                      type="file"
                      className="sr-only"
                      accept="image/*,video/*,audio/*,.pdf,.docx,.xlsx,.csv,.txt"
                      disabled={isIngesting}
                      onChange={(event) => {
                        const file = event.currentTarget.files?.[0];
                        if (file) void uploadDocument(file);
                        event.currentTarget.value = "";
                      }}
                    />
                  </label>
                </div>

                {workspace.artifacts.length > 0 && (
                  <button
                    type="button"
                    onClick={() => void synthesize()}
                    disabled={isSynthesizing}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl border border-[var(--muse-border)] bg-[var(--muse-surface)] px-5 py-4 text-xs font-bold uppercase tracking-widest hover:border-canvas-primary disabled:opacity-50"
                  >
                    {isSynthesizing ? <LoaderCircle size={17} className="animate-spin" /> : <BrainCircuit size={17} />}
                    {isSynthesizing ? "Synthesizing…" : "Synthesize artifacts"}
                  </button>
                )}
              </section>

              <div className="space-y-10">
                <section aria-labelledby="room-threads-heading">
                  <h2 id="room-threads-heading" className="mb-5 flex items-center gap-2 text-xl font-semibold">
                    <Sparkles size={19} aria-hidden="true" />
                    Synthesized threads
                  </h2>
                  {workspace.threads.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-[var(--muse-border)] p-8 text-center text-sm text-[var(--muse-muted)]">
                      Add artifacts and synthesize this room to discover connections.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {workspace.threads.map((thread) => {
                        const blueprint = readBlueprint(thread.aiBlueprint);
                        return (
                          <article key={thread.id} className="rounded-3xl border border-[var(--muse-border)] bg-[var(--muse-surface)] p-6">
                            <h3 className="text-lg font-semibold">
                              {blueprint?.theme || thread.title}
                            </h3>
                            {blueprint?.summary && (
                              <p className="mt-3 font-serif italic leading-relaxed text-[var(--muse-muted)]">
                                {blueprint.summary}
                              </p>
                            )}
                            {blueprint && blueprint.questions.length > 0 && (
                              <div className="mt-5 space-y-2">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--muse-muted)]">
                                  Reflection prompts
                                </h4>
                                {blueprint.questions.map((prompt, index) => (
                                  <button
                                    key={`${thread.id}-${index}`}
                                    type="button"
                                    onClick={() => {
                                      setQuestion({ threadId: thread.id, text: prompt });
                                      setCapturedHash("");
                                      setThought("");
                                    }}
                                    className="block w-full rounded-xl border border-[var(--muse-border)] bg-[var(--muse-bg)] p-3 text-left text-sm hover:border-canvas-primary"
                                  >
                                    {prompt}
                                  </button>
                                ))}
                              </div>
                            )}
                          </article>
                        );
                      })}
                    </div>
                  )}
                </section>

                <section aria-labelledby="room-artifacts-heading">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 id="room-artifacts-heading" className="text-sm font-bold uppercase tracking-widest">
                      Cognitive ledger
                    </h2>
                    <span className="rounded-md border border-[var(--muse-border)] px-2 py-1 text-xs text-[var(--muse-muted)]">
                      {workspace.artifacts.length} artifacts
                    </span>
                  </div>
                  {workspace.artifacts.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-[var(--muse-border)] p-8 text-center text-sm text-[var(--muse-muted)]">
                      This ledger is empty. Add a URL or upload a document to begin.
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {workspace.artifacts.map((artifact) => (
                        <li key={artifact.id} className="flex items-center gap-3 rounded-2xl border border-[var(--muse-border)] bg-[var(--muse-surface)] p-4">
                          <FileText size={17} className="shrink-0 text-[var(--muse-muted)]" aria-hidden="true" />
                          <div className="min-w-0">
                            <p className="truncate text-sm">{artifact.sourceUrl || "Untitled artifact"}</p>
                            <p className="mt-1 text-[10px] uppercase tracking-widest text-[var(--muse-muted)]">
                              {artifact.type}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </div>
            </div>
          </>
        )}
      </div>

      {question && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" role="presentation">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="capture-thought-title"
            className="w-full max-w-2xl rounded-3xl border border-[var(--muse-border)] bg-[var(--muse-bg)] p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="capture-thought-title" className="text-lg font-semibold">Capture a reflection</h2>
                <p className="mt-3 font-serif italic text-[var(--muse-muted)]">{question.text}</p>
              </div>
              <button
                type="button"
                onClick={() => setQuestion(null)}
                className="rounded-full border border-[var(--muse-border)] px-3 py-1 text-sm"
              >
                Close
              </button>
            </div>
            {capturedHash ? (
              <p role="status" className="mt-6 break-all text-sm text-emerald-300">
                Thought captured. Verification hash: {capturedHash}
              </p>
            ) : (
              <form onSubmit={captureThought} className="mt-6 space-y-4">
                <label htmlFor="room-reflection" className="sr-only">Your reflection</label>
                <textarea
                  id="room-reflection"
                  autoFocus
                  required
                  rows={7}
                  value={thought}
                  onChange={(event) => setThought(event.currentTarget.value)}
                  disabled={isSavingThought}
                  className="w-full resize-y rounded-2xl border border-[var(--muse-border)] bg-[var(--muse-surface)] p-4 text-sm outline-none focus:border-canvas-primary"
                  placeholder="Begin writing…"
                />
                <button
                  type="submit"
                  disabled={isSavingThought || !thought.trim()}
                  className="rounded-full bg-[var(--muse-text)] px-5 py-3 text-xs font-bold uppercase tracking-widest text-[var(--muse-bg)] disabled:opacity-50"
                >
                  {isSavingThought ? "Saving…" : "Save reflection"}
                </button>
              </form>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
