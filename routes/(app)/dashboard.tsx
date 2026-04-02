import CommunityPulseStrip from "../../islands/CommunityPulseStrip.tsx";
import DashboardWidgets from "../../islands/DashboardWidgets.tsx";
import DashboardRooms from "../../islands/DashboardRooms.tsx";

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto pb-24 md:pb-10 min-h-full">
      <div className="px-6 md:px-10 pt-6">
        <CommunityPulseStrip />
      </div>
      
      <DashboardWidgets />
      <DashboardRooms />
    </div>
  );
}
