import { createFileRoute } from "@tanstack/react-router";
import LandingPage from "../components/landing/LandingPage.tsx";

export const Route = createFileRoute("/")({
  component: LandingPage,
});
