import { Handlers, PageProps } from "$fresh/server.ts";
import { getSessionUser } from "../../utils/auth.ts";
import { queryDB } from "../../utils/db.ts";
import DashboardLayout from "../../islands/dashboard/DashboardLayout.tsx";
import { type RoomData } from "../../islands/dashboard/RoomCard.tsx";
import { Head } from "$fresh/runtime.ts";
import DashboardClientManager from "../../islands/dashboard/DashboardClientManager.tsx";

interface DashboardData {
  user: {
    id: string;
    username: string;
    email: string;
  };
  rooms: RoomData[];
}

export const handler: Handlers<DashboardData> = {
  async GET(req, ctx) {
    // 1. Authenticate user
    const userId = await getSessionUser(req);
    if (!userId) {
      // Not logged in, redirect to landing
      return new Response("", {
        status: 303,
        headers: { location: "/" },
      });
    }

    // 2. Fetch User Data
    const users = await queryDB(
      "SELECT id, username, email FROM users WHERE id = $1",
      userId,
    );
    if (users.length === 0) {
      return new Response("", { status: 303, headers: { location: "/" } });
    }
    const userRow = users[0] as Record<string, string>;

    // 3. Fetch Rooms
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
      user: { id: userId, username: userRow.username, email: userRow.email },
      rooms,
    });
  },
};

export default function Dashboard({ data }: PageProps<DashboardData>) {
  const { user, rooms } = data;

  return (
    <>
      <Head>
        <title>Dashboard | Muse Ecosystem</title>
      </Head>
      <DashboardLayout user={user}>
        <DashboardClientManager initialRooms={rooms} initialUser={user} />
      </DashboardLayout>
    </>
  );
}
