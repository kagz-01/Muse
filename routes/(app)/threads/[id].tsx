import { PageProps } from "$fresh/server.ts";
import ThreadInside from "../../../islands/ThreadInside.tsx";

export default function ThreadDetailPage(props: PageProps) {
  const { id } = props.params;
  return (
    <ThreadInside threadId={id} />
  );
}
