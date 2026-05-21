import { useState } from "preact/hooks";
import * as Icons from "lucide-preact";
import {
  circlesSignal,
  collaboratorsSignal,
  communityRoomsSignal,
  joinCircle,
} from "../../signals/connections.ts";
import { soloModeSignal, toggleSoloMode } from "../../signals/user.ts";
import {
  ActiveCircleCard,
  CommunityPulseStrip,
  CommunityRoomCard,
  SharedThemeCluster,
} from "../../components/connections/index.ts";
import ThoughtStream from "./ThoughtStream.tsx";
import WisdomMap from "./WisdomMap.tsx";
import AuraCard from "../../components/connections/AuraCard.tsx";
import SyncStatus from "../../components/connections/SyncStatus.tsx";

type Tab = "Stream" | "Wisdom" | "Circles" | "People";

export default function ConnectionsHub() {
  const [activeTab, setActiveTab] = useState<Tab>("Stream");
  const [searchQuery, setSearchQuery] = useState("");

  const circles = circlesSignal.value;
  const collaborators = collaboratorsSignal.value;
  const communityRooms = communityRoomsSignal.value;
  const soloMode = soloModeSignal.value;

  const tabs: { id: Tab; icon: unknown; label: string }[] = [
    { id: "Stream", icon: Icons.Activity, label: "Thought Stream" },
    { id: "Wisdom", icon: Icons.Aperture, label: "Wisdom Map" },
    { id: "Circles", icon: Icons.MessageSquare, label: "Active Circles" },
    { id: "People", icon: Icons.Users, label: "Collaborators" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col pb-24 md:pb-10 space-y-12">
      {/* Community Pulse Header */}
      <CommunityPulseStrip />

      <div className="w-full max-w-none px-6 md:px-10 space-y-12">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden rounded-[4rem] border border-white/5 bg-[#0d0d0d] p-12 md:p-20 shadow-2xl">
          <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-indigo-500/10 to-transparent blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
            <div className="w-full max-w-none">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.4em] text-indigo-400">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                The Collective Protocol 3.1
              </div>
              <h1 className="mt-10 text-6xl md:text-8xl font-bold tracking-tight leading-[0.85] text-white">
                Resonate with the{" "}
                <span className="italic font-serif text-gray-700">
                  communal pulse.
                </span>
              </h1>
              <p className="mt-10 max-w-2xl text-gray-500 text-xl md:text-2xl leading-relaxed font-serif italic border-l-4 border-canvas-primary/20 pl-8">
                "Immutable, sovereign, and real-time. Witness the evolution of
                shared intelligence."
              </p>
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center gap-3 p-1.5 bg-white/5 border border-white/10 rounded-[2.5rem]">
                {tabs.map((tab) => (
                  <button
                    type="button"
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-3 px-8 py-4 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-500 cursor-pointer
                      ${
                      activeTab === tab.id
                        ? "bg-white text-black shadow-2xl scale-105"
                        : "text-gray-500 hover:text-white hover:bg-white/5"
                    }
                    `}
                  >
                    {(() => {
                      const Icon = tab.icon as unknown as import("preact").ComponentType<any>;
                      return <Icon size={16} />;
                    })()}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
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
              <div className="grid gap-16 xl:grid-cols-[1.15fr_0.85fr] items-start animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="min-w-0">
                  {activeTab === "Stream" && <ThoughtStream />}

                  {activeTab === "Wisdom" && <WisdomMap />}

                  {activeTab === "Circles" && (
                    <div className="space-y-16">
                      <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                        {circles.map((circle) => (
                          <div key={circle.id} className="w-[360px] flex-shrink-0">
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
                            <Icons.Globe size={32} className="text-gray-800" />{" "}
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
                          {communityRooms.map((room) => (
                            <div key={room.id} className="flex-shrink-0 w-80">
                              <CommunityRoomCard room={room} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "People" && (
                    <div className="space-y-10">
                      <div className="flex items-center justify-between">
                        <div className="relative flex-1 max-w-xl">
                          <Icons.Search
                            className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600"
                            size={20}
                          />
                          <input
                            type="text"
                            placeholder="Search sovereign collaborators..."
                            className="w-full bg-white/5 border border-white/10 rounded-3xl py-5 pl-16 pr-8 text-white focus:outline-none focus:border-canvas-primary/40 focus:bg-white/[0.08] transition-all font-serif italic text-lg outline-none"
                            value={searchQuery}
                            onInput={(e) =>
                              setSearchQuery(
                                (e.target as HTMLInputElement).value,
                              )}
                          />
                        </div>
                      </div>

                      <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                        {collaborators
                          .filter((c) =>
                            c.name.toLowerCase().includes(
                              searchQuery.toLowerCase(),
                            )
                          )
                          .map((collaborator) => (
                            <div key={collaborator.id} className="w-[320px] flex-shrink-0">
                              <AuraCard
                                collaborator={collaborator}
                              />
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Rail: Themes & Pulse */}
                <div className="space-y-12 min-w-0">
                  <SyncStatus />

                  <div className="bg-white/2 border border-white/5 rounded-[3rem] p-10 backdrop-blur-3xl sticky top-24">
                    <div className="flex items-center justify-between mb-10">
                      <h3 className="text-2xl font-bold text-white tracking-tight">
                        Pattern Clusters
                      </h3>
                      <Icons.Aperture size={24} className="text-canvas-primary" />
                    </div>

                    <SharedThemeCluster />

                    <div className="mt-12 space-y-8">
                      <div className="p-8 bg-canvas-primary/5 border border-canvas-primary/20 rounded-[2.5rem]">
                        <div className="flex items-start gap-4 mb-4">
                          <Icons.Zap
                                size={24}
                                className="text-canvas-primary shrink-0 mt-1"
                              />
                          <div>
                            <p className="text-lg font-bold text-white leading-tight">
                              Emerging: 'Digital Voids'
                            </p>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                              Circle Forming
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 leading-relaxed mb-6 font-serif italic">
                          David Chen and 5 others are currently synthesizing
                          ideas around digital emptiness.
                        </p>
                        <button
                          type="button"
                          onClick={() =>
                            globalThis.location.href =
                              "/threads/c1?type=circle"}
                          className="w-full py-4 bg-canvas-primary text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:scale-[1.02] transition-all flex items-center justify-center gap-3 group cursor-pointer shadow-xl"
                        >
                          Enter Dialogue{" "}
                          <Icons.ChevronRight
                            size={16}
                            className="group-hover:translate-x-1 transition-transform"
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
