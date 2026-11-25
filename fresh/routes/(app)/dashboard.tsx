import { Handlers, PageProps } from "$fresh/server.ts";
import CommunityPulseStripIsland from "../../islands/connections/CommunityPulseStripIsland.tsx";
import { PulseHome } from "../../islands/dashboard/index.ts";
import DemoSessionHydrator from "../../islands/DemoSessionHydrator.tsx";
import DemoModeBanner from "../../islands/DemoModeBanner.tsx";
import { getSessionUser, isDemoUser } from "../../utils/auth.ts";
import { queryDB } from "../../utils/db.ts";
import { DEMO_USER } from "../../utils/demo_data.ts";

interface DashboardPageProps {
  initialUser?: { id: string; name?: string; username: string; email: string };
  isDemo?: boolean;
}

export const handler: Handlers<DashboardPageProps> = {
  async GET(req, ctx) {
    const userId = await getSessionUser(req);
    if (!userId) {
      return new Response("", {
        status: 303,
        headers: { location: "/" },
      });
    }

    if (isDemoUser(userId)) {
      return ctx.render({
        initialUser: {
          id: DEMO_USER.id,
          name: DEMO_USER.name,
          username: DEMO_USER.username,
          email: DEMO_USER.email,
        },
        isDemo: true,
      });
    }

    const users = await queryDB(
      "SELECT id, name, username, email FROM users WHERE id = $1",
      userId,
    );
    if (users.length === 0) {
      return new Response("", { status: 303, headers: { location: "/" } });
    }
    const userRow = users[0] as Record<string, string>;

    return ctx.render({
      initialUser: {
        id: userId,
        name: userRow.name,
        username: userRow.username,
        email: userRow.email,
      },
      isDemo: false,
    });
  },
};

export default function DashboardPage({ initialUser, isDemo }: PageProps<DashboardPageProps>) {
  return (
    <div className="w-full mx-auto pb-24 md:pb-10 min-h-full">
      <DemoSessionHydrator />
      <DemoModeBanner />

      <div className="px-6 md:px-10 pt-6 max-w-[1800px] mx-auto">
        <CommunityPulseStripIsland />
      </div>

      <PulseHome initialUser={initialUser} isDemo={isDemo} />
    </div>
  );
}
