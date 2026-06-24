import { useEffect, useMemo, useState } from "preact/hooks";
import * as Icons from "lucide-preact";
import {
  type ActiveCircle,
  activeThemesSignal,
  circlesSignal,
  type Collaborator,
  collaboratorsSignal,
  type CommunityRoom,
  communityRoomsSignal,
  joinCircle,
  type Perspective,
} from "../../signals/connections.ts";
import { soloModeSignal, toggleSoloMode } from "../../signals/user.ts";
import {
  ActiveCircleCard,
  CommunityPulseStrip,
  CommunityRoomCard,
} from "../../components/connections/index.ts";
import ThoughtStream from "./ThoughtStream.tsx";
import WisdomMap from "./WisdomMap.tsx";
import AuraCard from "../../components/connections/AuraCard.tsx";
import {
  CircleMembershipChart,
  CommunityThemePulse,
} from "../../components/community/CommunityCharts.tsx";

type Tab = "Stream" | "Wisdom" | "Circles" | "People";

export default function ConnectionsHub() {
  const [activeTab, setActiveTab] = useState<Tab>("Stream");
  const [activeProfileFilter, setActiveProfileFilter] = useState<string>("All");

  const [stream, setStream] = useState<Perspective[]>([]);
  const [fetchedCircles, setFetchedCircles] = useState<ActiveCircle[]>([]);
  const [fetchedCollaborators, setFetchedCollaborators] = useState<
    Collaborator[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCommunityData() {
      try {
        const [streamRes, circlesRes, collabRes] = await Promise.all([
          fetch("/api/community/stream"),
          fetch("/api/community/circles"),
          fetch("/api/community/collaborators"),
        ]);

        if (streamRes.ok) {
          const { stream } = await streamRes.json();
          setStream(stream);
        }
        if (circlesRes.ok) {
          const { circles } = await circlesRes.json();
          setFetchedCircles(circles);
        }
        if (collabRes.ok) {
          const { collaborators } = await collabRes.json();
          setFetchedCollaborators(collaborators);
        }
      } catch (err) {
        console.error("Failed to load community data", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCommunityData();
  }, []);

  const circles = fetchedCircles.length > 0
    ? (fetchedCircles as typeof circlesSignal.value)
    : circlesSignal.value;
  const collaborators = fetchedCollaborators.length > 0
    ? (fetchedCollaborators as typeof collaboratorsSignal.value)
    : collaboratorsSignal.value;
  const communityRooms = communityRoomsSignal.value;
  const soloMode = soloModeSignal.value;
  const topThemes = activeThemesSignal.value;

  const circleMembershipData = useMemo(
    () =>
      circles.slice(0, 5).map((c) => ({
        name: c.name.split(" ").slice(0, 2).join(" "),
        members: c.memberCount,
      })),
    [circles],
  );

  const themePulseData = useMemo(
    () =>
      topThemes.slice(0, 6).map((theme, i) => ({
        subject: theme,
        value: Math.max(30, 95 - i * 12),
        fullMark: 100,
      })),
    [topThemes],
  );

  const tabs: { id: Tab; icon: unknown; label: string }[] = [
    { id: "Stream", icon: Icons.Activity, label: "Thought Stream" },
    { id: "Wisdom", icon: Icons.Aperture, label: "Wisdom Map" },
    { id: "Circles", icon: Icons.MessageSquare, label: "Active Circles" },
    { id: "People", icon: Icons.Users, label: "Collaborators" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col pb-32 md:pb-28 space-y-12">
      {/* Community Pulse Header */}
      <CommunityPulseStrip />

      <div className="w-full max-w-none px-6 md:px-10 space-y-12">
        {/* HERO SECTION with Simulated Network Graph */}
        <section className="relative overflow-hidden rounded-[4rem] border border-white/5 bg-[#0d0d0d] p-12 md:p-20 shadow-2xl group">
          <div className="absolute inset-0 z-0 opacity-20 transition-opacity duration-1000 group-hover:opacity-40">
            {/* SVG Simulated Network Graph Background */}
            <svg
              width="100%"
              height="100%"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute inset-0"
            >
              <defs>
                <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity="1" />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
                </radialGradient>
              </defs>
              <g
                className="animate-[spin-slow_40s_linear_infinite]"
                transform-origin="center"
              >
                {Array.from({ length: 20 }).map((_, i) => (
                  <circle
                    key={i}
                    cx={`${Math.random() * 100}%`}
                    cy={`${Math.random() * 100}%`}
                    r={Math.random() * 3 + 1}
                    fill="url(#nodeGlow)"
                    className="animate-pulse"
                    style={{ animationDuration: `${Math.random() * 3 + 2}s` }}
                  />
                ))}
                {Array.from({ length: 15 }).map((_, i) => (
                  <line
                    key={`line-${i}`}
                    x1={`${Math.random() * 100}%`}
                    y1={`${Math.random() * 100}%`}
                    x2={`${Math.random() * 100}%`}
                    y2={`${Math.random() * 100}%`}
                    stroke="rgba(99, 102, 241, 0.2)"
                    strokeWidth="1"
                    className="animate-pulse"
                    style={{ animationDuration: `${Math.random() * 5 + 3}s` }}
                  />
                ))}
              </g>
            </svg>
          </div>
          <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-indigo-500/10 to-transparent blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="mb-10 max-w-4xl flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-indigo-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  Live Network Stream
                </div>
                <h1 className="mt-8 text-5xl md:text-7xl font-bold tracking-tight text-white">
                  Resonate with the{" "}
                  <span className="italic font-serif text-gray-400">
                    collective.
                  </span>
                </h1>
              </div>

              {/* Live Telemetry: Real Circle Membership Chart */}
              <div className="self-start md:self-end bg-black/40 backdrop-blur-md p-5 rounded-3xl border border-white/5 shadow-2xl min-w-[300px]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[9px] uppercase tracking-[0.25em] text-gray-500 font-bold flex items-center gap-2">
                    <Icons.BarChart3
                      size={12}
                      className="text-canvas-primary"
                    />
                    Circle Membership
                  </span>
                  <span className="text-[9px] font-mono text-emerald-400 font-bold">
                    {circles.reduce((s, c) => s + c.memberCount, 0)} total
                  </span>
                </div>
                <CircleMembershipChart data={circleMembershipData} />
              </div>
            </div>

            <p className="mt-4 mb-10 max-w-2xl text-gray-400 text-lg md:text-xl leading-relaxed font-serif italic border-l-2 border-indigo-500/30 pl-6 bg-gradient-to-r from-indigo-500/5 to-transparent py-2">
              You have entered the public ledger. This is not a feed for
              consumption; it is a live stream of raw intellectual synthesis.
              Discover emerging patterns, trace the lineage of ideas, and
              connect with nodes operating at your frequency.
            </p>

            {/* Tab Navigation */}
            <div className="flex gap-4 border-b border-white/5 pb-4 overflow-x-auto no-scrollbar">
              {tabs.map((tab) => {
                const Icon = tab.icon as any;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-3 px-8 py-4 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-500 cursor-pointer
                      ${
                      activeTab === tab.id
                        ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)] scale-[1.02]"
                        : "text-gray-500 hover:text-white hover:bg-white/10"
                    }
                    `}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Community Theme Pulse Radar */}
            {themePulseData.length > 0 && (
              <div className="mt-10 grid grid-cols-1 md:grid-cols-[1fr_auto] items-center gap-8 border-t border-white/5 pt-10">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-500 flex items-center gap-2 mb-1">
                    <Icons.Radar size={12} className="text-canvas-primary" />
                    Community Theme Pulse
                  </p>
                  <p className="text-xs text-gray-600 font-serif italic">
                    The live distribution of intellectual themes resonating
                    across all active circles right now.
                  </p>
                </div>
                <div className="w-64 h-52 shrink-0">
                  <CommunityThemePulse data={themePulseData} />
                </div>
              </div>
            )}
          </div>
        </section>

        <div className="transition-all duration-700">
          {soloMode
            ? (
              <div className="flex flex-col items-center justify-center py-40 text-center animate-in fade-in zoom-in-95">
                <div className="relative mb-12">
                  <div className="w-56 h-56 rounded-full border border-dashed border-canvas-primary/20 flex items-center justify-center animate-[spin_30s_linear_infinite]">
                    <div className="w-40 h-40 rounded-full border border-canvas-primary/40" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-[2rem] bg-canvas-primary/20 border border-canvas-primary/40 flex items-center justify-center shadow-[0_0_80px_rgba(99,102,241,0.3)]">
                      <Icons.Lock size={40} className="text-canvas-primary" />
                    </div>
                  </div>
                </div>

                <h2 className="text-5xl font-bold text-white mb-6 italic font-serif">
                  Sovereign Silence is Active.
                </h2>
                <p className="text-gray-500 max-w-lg mx-auto mb-16 leading-relaxed font-serif italic text-xl">
                  You are currently in Solo Mode. The communal pulse is muffled
                  to prioritize your private introspection.
                </p>

                <div className="flex flex-col sm:flex-row gap-6">
                  <button
                    type="button"
                    onClick={toggleSoloMode}
                    className="px-12 py-6 bg-white text-black font-bold uppercase tracking-[0.2em] text-[11px] rounded-3xl hover:-translate-y-1 transition-all shadow-3xl active:scale-95 flex items-center gap-4 cursor-pointer"
                  >
                    <Icons.Globe size={18} /> Establish Collective Link
                  </button>
                  <button
                    type="button"
                    onClick={() => globalThis.history.back()}
                    className="px-12 py-6 bg-white/5 border border-white/10 text-gray-500 font-bold uppercase tracking-[0.2em] text-[11px] rounded-3xl hover:text-white hover:bg-white/10 transition-all active:scale-95 cursor-pointer"
                  >
                    Return to Private Vault
                  </button>
                </div>
              </div>
            )
            : (
              <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
                {/* CONTENT AREA */}
                <div className="min-h-[500px]">
                  {isLoading && (
                    <div className="w-full py-20 flex flex-col items-center justify-center">
                      <Icons.Loader
                        size={32}
                        className="text-emerald-500 animate-spin mb-4"
                      />
                      <p className="text-gray-500 uppercase tracking-widest text-xs font-bold">
                        Syncing Ledger...
                      </p>
                    </div>
                  )}

                  {!isLoading && activeTab === "Stream" && (
                    <ThoughtStream streamData={stream} />
                  )}

                  {!isLoading && activeTab === "Wisdom" && <WisdomMap />}

                  {!isLoading && activeTab === "Circles" && (
                    <div className="space-y-16">
                      <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                        {circles.map((circle) => (
                          <div
                            key={circle.id}
                            className="w-[360px] flex-shrink-0"
                          >
                            <ActiveCircleCard
                              circle={circle}
                              onJoin={() => joinCircle(circle.id)}
                            />
                          </div>
                        ))}
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-10">
                          <h2 className="text-3xl font-bold text-white flex items-center gap-4">
                            <Icons.Globe size={32} className="text-gray-800" />
                            {" "}
                            Public Domains
                          </h2>
                          <button
                            type="button"
                            className="text-[10px] font-bold text-canvas-primary uppercase tracking-[0.3em] hover:underline cursor-pointer"
                          >
                            Explore All
                          </button>
                        </div>
                        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                          {communityRooms.map((room: CommunityRoom) => (
                            <div key={room.id} className="flex-shrink-0 w-80">
                              <CommunityRoomCard room={room} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {!isLoading && activeTab === "People" && (
                    <div className="space-y-10 animate-in fade-in duration-500">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                          <h2 className="text-3xl font-bold text-white flex items-center gap-4 tracking-tight">
                            <Icons.Network
                              size={32}
                              className="text-emerald-500"
                            />{" "}
                            Cognitive Match Grid
                          </h2>
                          <p className="text-gray-500 font-serif italic mt-2">
                            Sorted by Resonance Alignment with your staked
                            thoughts.
                          </p>
                        </div>

                        <div className="flex bg-white/5 p-1.5 rounded-full border border-white/10">
                          {["All", "Architect", "Synthesizer", "Challenger"]
                            .map((profile) => (
                              <button
                                key={profile}
                                type="button"
                                onClick={() => setActiveProfileFilter(profile)}
                                className={`px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
                                  activeProfileFilter === profile
                                    ? "bg-emerald-500 text-black shadow-lg"
                                    : "text-gray-500 hover:text-white"
                                }`}
                              >
                                {profile}
                              </button>
                            ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...collaborators]
                          .filter((c) =>
                            activeProfileFilter === "All" ||
                            c.intelligenceProfile === activeProfileFilter
                          )
                          .sort((a, b) => b.matchPercentage - a.matchPercentage)
                          .map((collaborator) => (
                            <AuraCard
                              key={collaborator.id}
                              collaborator={collaborator}
                            />
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
