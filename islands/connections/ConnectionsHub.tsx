import { useState } from "preact/hooks";
import { 
  Users, MessageSquare, Sparkles, 
  Globe, Search, TrendingUp, Activity, Lock, ChevronRight, Zap
} from "lucide-preact";
import { 
  circlesSignal, collaboratorsSignal, communityRoomsSignal, 
  insightsSignal, joinCircle 
} from "../../signals/connections.ts";
import { soloModeSignal, toggleSoloMode } from "../../signals/user.ts";
import {
  ActiveCircleCard,
  CollaboratorCard,
  CommunityRoomCard,
  SharedThemeCluster,
  ThoughtfulComposer,
  CommunityPulseStrip,
} from "../../components/connections/index.ts";

type Tab = 'Circles' | 'People' | 'Insights';

type TabIcon = typeof MessageSquare;

export default function ConnectionsHub() {
  const [activeTab, setActiveTab] = useState<Tab>('Circles');
  const [searchQuery, setSearchQuery] = useState('');
  
  const circles = circlesSignal.value;
  const collaborators = collaboratorsSignal.value;
  const communityRooms = communityRoomsSignal.value;
  const insights = insightsSignal.value;
  const soloMode = soloModeSignal.value;

  const tabs: { id: Tab; icon: TabIcon; label: string }[] = [
    { id: 'Circles', icon: MessageSquare, label: 'Active Circles' },
    { id: 'People', icon: Users, label: 'Collaborators' },
    { id: 'Insights', icon: Sparkles, label: 'Communal Pulse' },
  ];

  return (
    <div className="min-h-screen bg-canvas-bg-dark pb-24 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Community Pulse Header */}
      <CommunityPulseStrip />

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Hero Section */}
        <div className="mb-16">
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
              <div>
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-10 h-10 rounded-2xl bg-canvas-primary/20 border border-canvas-primary/30 flex items-center justify-center text-canvas-primary">
                      <Globe size={20} />
                   </div>
                   <span className="text-[10px] font-bold text-canvas-primary uppercase tracking-[0.3em]">Community</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight">
                  Pattern-Based <span className="text-gray-600">Connections.</span>
                </h1>
                <p className="mt-5 max-w-2xl text-gray-400 font-serif italic text-lg leading-relaxed">
                  Connect after the system has something to say. The people here are organized around shared themes, active circles, and the ideas that keep returning.
                </p>
              </div>

              <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                 <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Active Thinkers</p>
                    <p className="text-2xl font-mono text-white">1,204</p>
                 </div>
                 <div className="w-px h-10 bg-white/10" />
                 <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Live Circles</p>
                    <p className="text-2xl font-mono text-canvas-primary">12</p>
                 </div>
              </div>
           </div>

            <section className="grid gap-4 md:grid-cols-3 mb-12">
              <div className="rounded-[2rem] border border-white/5 bg-white/[0.03] p-6 backdrop-blur-sm">
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Circles</div>
                <div className="mt-2 text-3xl font-bold text-white">{circles.length}</div>
                <p className="mt-2 text-sm text-gray-500 font-serif italic">Active shared interest spaces.</p>
              </div>
              <div className="rounded-[2rem] border border-white/5 bg-white/[0.03] p-6 backdrop-blur-sm">
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Collaborators</div>
                <div className="mt-2 text-3xl font-bold text-white">{collaborators.length}</div>
                <p className="mt-2 text-sm text-gray-500 font-serif italic">People with overlapping themes.</p>
              </div>
              <div className="rounded-[2rem] border border-white/5 bg-white/[0.03] p-6 backdrop-blur-sm">
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Community rooms</div>
                <div className="mt-2 text-3xl font-bold text-white">{communityRooms.length}</div>
                <p className="mt-2 text-sm text-gray-500 font-serif italic">Shared spaces shaped by the pattern layer.</p>
              </div>
            </section>

           {/* Custom Tab Navigation */}
           <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white/5 border border-white/10 rounded-4xl w-fit mb-12">
              {tabs.map((tab) => (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-3 px-6 py-3 rounded-3xl text-sm font-bold transition-all duration-500
                    ${activeTab === tab.id 
                      ? 'bg-white text-black shadow-[0_0_25px_rgba(255,255,255,0.1)]' 
                      : 'text-gray-500 hover:text-white hover:bg-white/5'}
                  `}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
           </div>
        </div>

        <div className="transition-all duration-500">
          {soloMode ? (
            <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in zoom-in-95">
               <div className="relative mb-10">
                  <div className="w-48 h-48 rounded-full border border-dashed border-canvas-primary/20 flex items-center justify-center animate-[spin_20s_linear_infinite]">
                     <div className="w-32 h-32 rounded-full border border-canvas-primary/40" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                     <div className="w-20 h-20 rounded-3xl bg-canvas-primary/20 border border-canvas-primary/40 flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.2)]">
                        <Lock size={32} className="text-canvas-primary" />
                     </div>
                  </div>
               </div>

               <h2 className="text-4xl font-bold text-white mb-4 italic font-serif">The Private Vault Is Active.</h2>
               <p className="text-gray-500 max-w-md mx-auto mb-12 leading-relaxed font-serif italic text-lg">
                 You are currently in Solo Mode. Community resonances are muffled to prioritize your private introspection.
               </p>

               <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    type="button"
                    onClick={toggleSoloMode}
                    className="px-10 py-5 bg-white text-black font-bold uppercase tracking-widest text-xs rounded-3xl hover:bg-canvas-primary hover:text-white transition-all shadow-[0_20px_40px_rgba(0,0,0,0.3)] active:scale-95 flex items-center gap-3 cursor-pointer"
                  >
                    <Globe size={16} /> Reconnect to Community
                  </button>
                  <button 
                    type="button"
                    onClick={() => globalThis.history.back()}
                    className="px-10 py-5 bg-white/5 border border-white/10 text-gray-400 font-bold uppercase tracking-widest text-xs rounded-3xl hover:text-white hover:bg-white/10 transition-all active:scale-95 cursor-pointer"
                  >
                    Return to Private Space
                  </button>
               </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-in fade-in slide-in-from-bottom-4">
              
              <div className="lg:col-span-8">
                {activeTab === 'Circles' && (
                  <div className="space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {circles.map(circle => (
                        <ActiveCircleCard 
                          key={circle.id} 
                          circle={circle} 
                          onJoin={() => joinCircle(circle.id)} 
                        />
                      ))}
                    </div>
  
                    <div>
                       <div className="flex items-center justify-between mb-8">
                          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                             <Globe size={24} className="text-gray-600" /> Community Rooms
                          </h2>
                          <button type="button" className="text-xs font-bold text-canvas-primary uppercase tracking-widest hover:underline cursor-pointer">View All</button>
                       </div>
                       <div className="grid grid-cols-1 gap-8">
                          {communityRooms.map(room => (
                            <CommunityRoomCard key={room.id} room={room} />
                          ))}
                       </div>
                    </div>
                  </div>
                )}
  
                {activeTab === 'People' && (
                  <div>
                    <div className="flex items-center justify-between mb-8">
                      <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input 
                          type="text"
                          placeholder="Search collaborators..."
                          className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-canvas-primary/30 transition-all font-serif italic outline-none"
                          value={searchQuery}
                          onInput={(e) => setSearchQuery((e.target as HTMLInputElement).value)}
                        />
                      </div>
                    </div>
  
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {collaborators
                        .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map(collaborator => (
                          <CollaboratorCard key={collaborator.id} collaborator={collaborator} />
                        ))
                      }
                    </div>
                  </div>
                )}
  
                {activeTab === 'Insights' && (
                  <div className="space-y-12">
                    <ThoughtfulComposer onSubmit={(text, tone) => console.log('Collective Perspective:', text, tone)} />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="bg-white/2 border border-white/5 rounded-[2.5rem] p-8">
                          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                             <TrendingUp size={20} className="text-canvas-primary" /> Collective Intelligence
                          </h3>
                          <div className="space-y-6">
                             {insights.map((insight, i) => (
                               <div key={i} className="flex gap-4 group">
                                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-canvas-primary shrink-0 group-hover:scale-150 transition-transform" />
                                  <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-200 transition-colors">{insight}</p>
                               </div>
                             ))}
                          </div>
                       </div>
  
                       <div className="bg-white/2 border border-white/5 rounded-[2.5rem] p-8">
                          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                             <Activity size={20} className="text-emerald-400" /> Communication Health
                          </h3>
                          <div className="space-y-6">
                             <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                <div className="flex justify-between items-center mb-2">
                                   <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Global Resonance</span>
                                   <span className="text-sm font-mono text-emerald-400">94.2%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                   <div className="h-full bg-emerald-400 w-[94%]" />
                                </div>
                             </div>
                             <p className="text-[11px] text-gray-500 font-serif italic leading-relaxed">
                                Community dialogue is currently high-fidelity and deeply reflective. Most interactions are categorized under 'Supportive' and 'Curious'.
                             </p>
                          </div>
                       </div>
                    </div>
                  </div>
                )}
              </div>
  
              {/* Right Rail: Themes & Pulse */}
              <div className="lg:col-span-4 space-y-12">
                 <div className="bg-white/3 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-3xl sticky top-24">
                    <div className="flex items-center justify-between mb-8">
                       <h3 className="text-xl font-bold text-white">Theme Clusters</h3>
                       <Sparkles size={20} className="text-canvas-primary" />
                    </div>
                    
                    <SharedThemeCluster />
  
                    <div className="mt-12 space-y-6">
                       <div className="p-6 bg-canvas-primary/5 border border-canvas-primary/20 rounded-3xl">
                          <div className="flex items-start gap-3 mb-3">
                             <Zap size={18} className="text-canvas-primary shrink-0 mt-1" />
                             <p className="text-sm font-bold text-white leading-tight">Join the 'Silence' Circle</p>
                          </div>
                          <p className="text-xs text-gray-400 leading-relaxed mb-4 font-serif italic">
                             David Chen and 5 others are currently synthesizing ideas around digital voids.
                          </p>
                          <button 
                            type="button"
                            onClick={() => globalThis.location.href = '/threads/c1?type=circle'}
                            className="w-full py-3 bg-canvas-primary text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-canvas-primary/80 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                          >
                             Enter Dialogue <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
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
