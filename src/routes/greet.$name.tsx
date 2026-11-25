import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/greet/$name")({
  component: GreetPage,
});

function GreetPage() {
  const { name } = Route.useParams();
  return <div>Hello {name}</div>;
}
