import { PageProps } from "$fresh/server.ts";
import { ThreadInside } from "../../../islands/threads/index.ts";

export default function ThreadDetailPage(props: PageProps) {
  const { id } = props.params;
  return (
    <ThreadInside threadId={id} />
  );
}
