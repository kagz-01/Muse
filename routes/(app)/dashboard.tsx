import { PageProps } from "$fresh/server.ts";
import CommunityPulseStripIsland from "../../islands/connections/CommunityPulseStripIsland.tsx";
import { HomeOverview, DashboardRooms } from "../../islands/dashboard/index.ts";

export default function DashboardPage({ url }: PageProps) {
  const isDemoMode = url.searchParams.get("demo") === "1";

  return (
    <div className="max-w-7xl mx-auto pb-24 md:pb-10 min-h-full">
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
      <DashboardRooms />
    </div>
  );
}
