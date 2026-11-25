import { Handlers, PageProps } from "$fresh/server.ts";
import { getSessionUser, isDemoUser } from "../../utils/auth.ts";
import { queryDB } from "../../utils/db.ts";
import DashboardLayout from "../../islands/dashboard/DashboardLayout.tsx";
import { type RoomData } from "../../islands/dashboard/RoomCard.tsx";
import { Head } from "$fresh/runtime.ts";
import DashboardClientManager from "../../islands/dashboard/DashboardClientManager.tsx";
import { DEMO_ROOMS, DEMO_USER } from "../../utils/demo_data.ts";

interface DashboardData {
  user: {
    id: string;
    name?: string;
    username: string;
    email: string;
  };
  rooms: RoomData[];
  isDemo: boolean;
}

export const handler: Handlers<DashboardData> = {
  async GET(req, ctx) {
    const userId = await getSessionUser(req);
    if (!userId) {
      return new Response("", {
        status: 303,
        headers: { location: "/" },
      });
    }

    // ── DEMO SHORTCUT ────────────────────────────────────────────────────────
    if (isDemoUser(userId)) {
      const demoRooms: RoomData[] = DEMO_ROOMS.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        theme_color: r.themeColor,
        tags: r.tags,
        created_at: r.updatedAt,
      }));
      return ctx.render({
        user: {
          id: DEMO_USER.id,
          name: DEMO_USER.name,
          username: DEMO_USER.username,
          email: DEMO_USER.email,
        },
        rooms: demoRooms,
        isDemo: true,
      });
    }
    // ─────────────────────────────────────────────────────────────────────────

    const users = await queryDB(
      "SELECT id, name, username, email FROM users WHERE id = $1",
      userId,
    );
    if (users.length === 0) {
      return new Response("", { status: 303, headers: { location: "/" } });
    }
    const userRow = users[0] as Record<string, string>;

    const rawRooms = await queryDB(
      "SELECT id, title, description, theme_color, tags, created_at FROM rooms WHERE user_id = $1 ORDER BY created_at DESC",
      userId,
    );

    interface RawRoom {
      id: string;
      title: string;
      description: string;
      theme_color: string;
      tags: string[];
      created_at: { toISOString(): string };
    }
    const rooms: RoomData[] = (rawRooms as RawRoom[]).map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      theme_color: r.theme_color,
      tags: r.tags || [],
      created_at: r.created_at.toISOString(),
    }));

    return ctx.render({
      user: {
        id: userId,
        name: userRow.name,
        username: userRow.username,
        email: userRow.email,
      },
      rooms,
      isDemo: false,
    });
  },
};

export default function Dashboard({ data }: PageProps<DashboardData>) {
  const { user, rooms, isDemo } = data;

  return (
    <>
      <Head>
        <title>Dashboard | Muse Ecosystem</title>
      </Head>
      <DashboardLayout user={user}>
        <DashboardClientManager
          initialRooms={rooms}
          initialUser={user}
          isDemo={isDemo}
        />
      </DashboardLayout>
    </>
  );
}
