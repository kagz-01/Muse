import { PageProps } from "$fresh/server.ts";
import RoomInside from "../../../islands/RoomInside.tsx";

export default function RoomDetailPage(props: PageProps) {
  const { id } = props.params;
  return (
    <RoomInside roomId={id} />
  );
}
