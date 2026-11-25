import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/rooms/$id")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/rooms/$id",
      params: { id: params.id },
    });
  },
});
