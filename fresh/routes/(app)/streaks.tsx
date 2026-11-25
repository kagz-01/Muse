import { PageProps } from "$fresh/server.ts";
import StreakHub from "../../islands/streaks/StreakHub.tsx";

export default function StreaksPage({ url }: PageProps) {
  return (
    <>
      <StreakHub />
    </>
  );
}
