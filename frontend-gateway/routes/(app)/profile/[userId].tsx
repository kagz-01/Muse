import { PageProps } from "$fresh/server.ts";
import { UserProfile } from "../../../islands/journal/UserProfile.tsx";

export default function UserProfilePage(props: PageProps) {
  const { userId } = props.params;
  return <UserProfile userId={userId} />;
}
