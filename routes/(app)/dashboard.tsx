import { CommunityPulseStrip } from "../../components/connections/index.ts";
import { HomeOverview, DashboardRooms } from "../../islands/dashboard/index.ts";

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto pb-24 md:pb-10 min-h-full">
      <div className="px-6 md:px-10 pt-6">
        <CommunityPulseStrip />
      </div>
      
      <HomeOverview />
      <DashboardRooms />
    </div>
  );
}
