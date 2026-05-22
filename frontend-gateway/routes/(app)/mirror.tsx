import { Head } from "$fresh/runtime.ts";
import MirrorDashboard from "../../islands/mirror/MirrorDashboard.tsx";

export default function MirrorPage() {
  return (
    <>
      <Head>
        <title>Mirror - Your Personal Analytics | Muse</title>
        <meta
          name="description"
          content="View your engagement analytics, follower growth, and activity timeline on Muse"
        />
      </Head>
      <MirrorDashboard />
    </>
  );
}
