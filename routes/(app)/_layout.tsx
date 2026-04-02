import { PageProps } from "$fresh/server.ts";
import AppLayoutWrapper from "../../islands/AppLayoutWrapper.tsx";
import AppHeader from "../../islands/AppHeader.tsx";
import AppMenu from "../../islands/AppMenu.tsx";

export default function AppLayout({ Component, url }: PageProps) {
  return (
    <AppLayoutWrapper>
      <AppHeader />
      <AppMenu currentPath={url.pathname} />
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto w-full relative scroll-smooth bg-canvas-bg-dark pt-20">
        <Component />
      </main>
      
      {/* Mobile Bottom Nav will be part of AppMenu island */}
    </AppLayoutWrapper>
  );
}
