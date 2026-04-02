import { PageProps } from "$fresh/server.ts";
import CommunityPulseStripIsland from "../../islands/connections/CommunityPulseStripIsland.tsx";
import { HomeOverview } from "../../islands/dashboard/index.ts";

export default function DashboardPage({ url }: PageProps) {
  const isDemoMode = url.searchParams.get("demo") === "1";

  return (
    <div className="max-w-6xl mx-auto pb-24 md:pb-10 min-h-full">
      {isDemoMode && (
        <div className="px-6 md:px-10 pt-6">
          <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-widest text-amber-300">Demo Mode</p>
            <p className="text-sm text-amber-100/90 mt-1">You are exploring a sample workspace. Changes here are for preview and may be reset.</p>
          </div>
        </div>
      )}

      <div className="px-6 md:px-10 pt-6">
        <CommunityPulseStripIsland />
      </div>
      
      <HomeOverview />

      <div className="px-6 md:px-10 pb-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-gray-400">Prefer a dedicated space for collections?</p>
          <a
            href="/rooms"
            className="inline-flex items-center gap-2 rounded-full border border-canvas-primary/40 bg-canvas-primary/10 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-canvas-primary hover:bg-canvas-primary/20 transition-all"
          >
            Open Rooms Workspace
          </a>
        </div>
      </div>
    </div>
  );
}
