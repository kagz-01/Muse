import { PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import StreakHub from "../../../islands/streaks/StreakHub.tsx";

export default function StreaksPage(props: PageProps) {
  return (
    <>
      <Head>
        <title>Cognitive Momentum | Muse</title>
        <meta name="description" content="Manage your cognitive momentum and view your resonance streaks." />
      </Head>
      <div className="w-full min-h-screen">
        <StreakHub />
      </div>
    </>
  );
}
