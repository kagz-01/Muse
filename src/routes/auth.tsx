import { createFileRoute } from "@tanstack/react-router";
export const Route=createFileRoute("/auth")({component(){return<main className="grid min-h-screen place-items-center bg-[var(--muse-bg)] p-5 text-[var(--muse-text)]"><a href="/" className="rounded-3xl border border-[var(--muse-border)] px-8 py-6 text-lg font-semibold">Continue to Muse</a></main>}});
