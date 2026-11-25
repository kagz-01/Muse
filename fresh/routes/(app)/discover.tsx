import { DiscoveryFeed } from "../../islands/journal/DiscoveryFeed.tsx";

export default function DiscoverPage() {
  return (
    <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pb-16">
      <div class="max-w-7xl mx-auto px-6 pt-8">
        <DiscoveryFeed maxItems={30} />
      </div>
    </div>
  );
}
