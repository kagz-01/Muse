import { PageProps } from "$fresh/server.ts";
import { AuthModal } from "../islands/modals/index.ts";

export default function AuthPage({ url }: PageProps) {
  const modeParam = url.searchParams.get("mode");
  const initialMode = modeParam === "signup" ? "signup" : "login";

  return (
    <div className="min-h-screen bg-[#07070a] text-white">
      <AuthModal
        initialMode={initialMode}
        onClose={() => {
          globalThis.location.href = "/";
        }}
      />
    </div>
  );
}
