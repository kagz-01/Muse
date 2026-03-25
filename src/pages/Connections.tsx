import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  MessageSquare, 
  Sparkles, 
  Zap, 
  Globe, 
  Search,
  ChevronRight,
  TrendingUp,
  Activity
} from 'lucide-react';
import { useConnectionsStore } from '../store/useConnectionsStore';
import ActiveCircleCard from '../components/connections/ActiveCircleCard';
import CollaboratorCard from '../components/connections/CollaboratorCard';
import CommunityRoomCard from '../components/connections/CommunityRoomCard';
import CommunityPulseStrip from '../components/connections/CommunityPulseStrip';
import SharedThemeCluster from '../components/connections/SharedThemeCluster';
import ThoughtfulComposer from '../components/connections/ThoughtfulComposer';
import { useUserStore } from '../store/useUserStore';
import { Lock, Shield } from 'lucide-react';

type Tab = 'Circles' | 'People' | 'Insights';

export default function Connections() {
  const [activeTab, setActiveTab] = useState<Tab>('Circles');
  const { circles, collaborators, communityRooms, insights, joinCircle } = useConnectionsStore();
  const { soloMode, toggleSoloMode } = useUserStore();
  const [searchQuery, setSearchQuery] = useState('');

  const tabs: { id: Tab; icon: any; label: string }[] = [
    { id: 'Circles', icon: MessageSquare, label: 'Active Circles' },
    { id: 'People', icon: Users, label: 'Collaborators' },
    { id: 'Insights', icon: Sparkles, label: 'Communal Pulse' },
  ];

  return (
    <div className="min-h-screen bg-canvas-bg-dark pb-24">
      {/* Community Pulse Header */}
      <CommunityPulseStrip />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="mb-16">
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
              <div>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 mb-4"
                >
                   <div className="w-10 h-10 rounded-2xl bg-canvas-primary/20 border border-canvas-primary/30 flex items-center justify-center text-canvas-primary">
                      <Globe size={20} />
                   </div>
                   <span className="text-[10px] font-bold text-canvas-primary uppercase tracking-[0.3em]">The Hub</span>
                </motion.div>
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-5xl md:text-7xl font-bold text-white tracking-tight"
                >
                  Community <span className="text-gray-600">Circles.</span>
                </motion.h1>
              </div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl"
              >
                 <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Active Thinkers</p>
                    <p className="text-2xl font-mono text-white">1,204</p>
                 </div>
                 <div className="w-px h-10 bg-white/10" />
                 <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Live Circles</p>
                    <p className="text-2xl font-mono text-canvas-primary">12</p>
                 </div>
              </motion.div>
           </div>

           {/* Custom Tab Navigation */}
           <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white/5 border border-white/10 rounded-4xl w-fit mb-12">
              {tabs.map((tab) => (
                <button
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

        <AnimatePresence mode="wait">
          {soloMode ? (
            <motion.div 
              key="solo-vault"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex flex-col items-center justify-center py-32 text-center"
            >
               <div className="relative mb-10">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    className="w-48 h-48 rounded-full border border-dashed border-canvas-primary/20 flex items-center justify-center"
                  >
                     <div className="w-32 h-32 rounded-full border border-canvas-primary/40" />
                  </motion.div>
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
                    onClick={toggleSoloMode}
                    className="px-10 py-5 bg-white text-black font-bold uppercase tracking-widest text-xs rounded-3xl hover:bg-canvas-primary hover:text-white transition-all shadow-[0_20px_40px_rgba(0,0,0,0.3)] active:scale-95 flex items-center gap-3"
                  >
                    <Globe size={16} /> Reconnect to Community
                  </button>
                  <button 
                    onClick={() => window.history.back()}
                    className="px-10 py-5 bg-white/5 border border-white/10 text-gray-400 font-bold uppercase tracking-widest text-xs rounded-3xl hover:text-white hover:bg-white/10 transition-all active:scale-95"
                  >
                    Return to Private Space
                  </button>
               </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              
              <div className="lg:col-span-8">
                <AnimatePresence mode="wait">
                  {activeTab === 'Circles' && (
                    <motion.div
                      key="circles"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-12"
                    >
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
                            <button className="text-xs font-bold text-canvas-primary uppercase tracking-widest hover:underline">View All</button>
                         </div>
                         <div className="grid grid-cols-1 gap-8">
                            {communityRooms.map(room => (
                              <CommunityRoomCard key={room.id} room={room} />
                            ))}
                         </div>
                      </div>
                    </motion.div>
                  )}
    
                  {activeTab === 'People' && (
                    <motion.div
                      key="people"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <div className="flex items-center justify-between mb-8">
                        <div className="relative flex-1 max-w-md">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                          <input 
                            type="text"
                            placeholder="Search collaborators..."
                            className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-canvas-primary/30 transition-all font-serif italic"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
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
                    </motion.div>
                  )}
    
                  {activeTab === 'Insights' && (
                    <motion.div
                      key="insights"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-12"
                    >
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
                    </motion.div>
                  )}
                </AnimatePresence>
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
                          <button className="w-full py-3 bg-canvas-primary text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-canvas-primary/80 transition-all flex items-center justify-center gap-2 group">
                             Enter Dialogue <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                          </button>
                       </div>
                    </div>
                 </div>
              </div>
    
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
