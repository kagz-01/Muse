import { PageProps } from "$fresh/server.ts";
import { RoomInside } from "../../../islands/rooms/index.ts";

export default function RoomDetailPage(props: PageProps) {
  const { id } = props.params;
  return (
    <RoomInside roomId={id} />
  );
}
