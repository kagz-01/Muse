import { PageProps } from "$fresh/server.ts";
import { AppLayoutWrapper, AppHeader, AppMenu } from "../../islands/layout/index.ts";

export default function AppLayout({ Component, url }: PageProps) {
  return (
    <AppLayoutWrapper>
      <AppHeader currentPath={url.pathname} />
      <AppMenu currentPath={url.pathname} />
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto w-full relative scroll-smooth bg-[var(--muse-bg)] text-[var(--muse-text)] pt-32 md:pt-36 transition-colors duration-300">
        <Component />
      </main>
      
      {/* Mobile Bottom Nav will be part of AppMenu island */}
    </AppLayoutWrapper>
  );
}
