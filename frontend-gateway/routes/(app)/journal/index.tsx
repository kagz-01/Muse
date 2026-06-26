import { Handlers, PageProps } from "$fresh/server.ts";
import { JournalGallery } from "../../../islands/journal/index.ts";
import { type JournalEntry } from "../../../signals/journal.ts";
import { getSessionUser } from "../../../utils/auth.ts";
import { queryDB } from "../../../utils/db.ts";
import { DEMO_JOURNALS, DEMO_USER } from "../../../utils/demo_data.ts";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const handler: Handlers = {
  async GET(req, ctx) {
    const userId = await getSessionUser(req);
    if (!userId) {
      return new Response("", { status: 303, headers: { location: "/auth" } });
    }

    if (userId === DEMO_USER.id) {
      const demoEntries = DEMO_JOURNALS.map((e) => ({
        id: e.id,
        body: e.body,
        mood: e.mood,
        tags: e.tags,
        linkedItemIds: e.linkedItemIds || [],
        isFavorited: e.isFavorited || false,
        isPinned: e.isPinned || false,
        isArchived: false,
        isPublic: e.isPublic || false,
        createdAt: new Date(e.createdAt).getTime(),
        updatedAt: new Date(e.updatedAt).getTime(),
        wordCount: e.body.trim().split(/\s+/).filter(Boolean).length,
      }));
      return ctx.render({ entries: demoEntries });
    }

    if (!UUID_RE.test(userId)) {
      // Clear invalid session by redirecting to auth which will override it or require new login
      return new Response("", { status: 303, headers: { location: "/auth" } });
    }

    const rawEntries = await queryDB(
      "SELECT id, raw_thought, mood, tags, is_favorited, is_pinned, is_archived, is_public, created_at, updated_at, synthesized_context FROM journal_entries WHERE user_id = $1 ORDER BY created_at DESC",
      userId,
    );

    interface RawEntry {
      id: string;
      raw_thought: string;
      mood: string;
      tags: string[];
      is_favorited: boolean;
      is_pinned: boolean;
      is_archived: boolean;
      is_public: boolean;
      created_at: { toISOString(): string };
      updated_at: { toISOString(): string };
      synthesized_context: unknown;
    }
    const entries = (rawEntries as RawEntry[]).map((e) => ({
      id: e.id,
      body: e.raw_thought,
      mood: e.mood || "reflective",
      tags: e.tags || [],
      linkedItemIds: [],
      isFavorited: e.is_favorited || false,
      isPinned: e.is_pinned || false,
      isArchived: e.is_archived || false,
      isPublic: e.is_public || false,
      createdAt: new Date(e.created_at.toISOString()).getTime(),
      updatedAt: new Date(e.updated_at.toISOString()).getTime(),
      wordCount: e.raw_thought.trim().split(/\s+/).filter(Boolean).length,
      synthesis: e.synthesized_context || undefined,
    }));

    return ctx.render({ entries });
  },
};

interface JournalData {
  entries: JournalEntry[];
}

export default function JournalPage({ data }: PageProps<JournalData>) {
  return <JournalGallery initialEntries={data?.entries} />;
}
