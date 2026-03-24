import React from 'react';
import ConnectionMap from '../components/connections/ConnectionMap';
import InsightCard from '../components/connections/InsightCard';
import RelationshipCard from '../components/connections/RelationshipCard';
import SharedThemeCluster from '../components/connections/SharedThemeCluster';
import ThoughtfulComposer from '../components/connections/ThoughtfulComposer';
import ConversationCard from '../components/connections/ConversationCard';
import { useConnectionsStore, Tone } from '../store/useConnectionsStore';
import { useUserStore } from '../store/useUserStore';

export default function Connections() {
  const { threads, relationships, insights, addComment } = useConnectionsStore();
  const user = useUserStore(state => state.user);

  const handleCompose = (text: string, tone: Tone) => {
    if (threads.length > 0 && user) {
      addComment(threads[0].id, {
        authorName: user.name,
        authorAvatar: user.avatarUrl || '',
        content: text,
        tone: tone,
        themes: ['Reflection']
      });
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto pb-24 md:pb-10 font-sans transition-all duration-500 min-h-screen">
      
      {/* Hero Section */}
      <header className="mb-10 relative overflow-hidden bg-[#1c1c1c] border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
         <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-canvas-primary/20 via-transparent to-transparent"></div>
         <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-10">
           <div>
             <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">Meaningful Network</h1>
             <p className="text-gray-400 text-lg md:text-xl max-w-2xl font-serif italic">
               Turn isolated comments into thoughtful dialogue, shared understanding, and healthier digital relationships.
             </p>
           </div>
           
           <div className="flex gap-4 shrink-0 overflow-x-auto no-scrollbar pb-2 md:pb-0">
             <div className="bg-[#0a0a0a] border border-white/5 px-6 py-5 rounded-3xl shrink-0">
                <div className="text-3xl font-bold text-white mb-1">3</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-canvas-primary animate-pulse"></div> Active Threads
                </div>
             </div>
             <div className="bg-[#0a0a0a] border border-white/5 px-6 py-5 rounded-3xl shrink-0">
                <div className="text-3xl font-bold text-white mb-1">92<span className="text-lg text-gray-500 ml-1">%</span></div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#00E5FF] flex items-center gap-2">
                  Node Strength
                </div>
             </div>
           </div>
         </div>
      </header>

      {/* 3-Column Interactive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         
         {/* Left Sidebar */}
         <div className="col-span-1 lg:col-span-3 space-y-8 order-2 lg:order-1">
            <div className="sticky top-6">
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 pl-2">Communication Health</h3>
              <div className="space-y-4 mb-8">
                {insights.map((insight, i) => (
                  <InsightCard key={i} text={insight} />
                ))}
              </div>
              <SharedThemeCluster />
            </div>
         </div>

         {/* Center Feed: Active Thoughtful Architecture */}
         <div className="col-span-1 lg:col-span-6 space-y-10 order-1 lg:order-2">
            <ThoughtfulComposer onSubmit={handleCompose} />
            
            <div className="space-y-10 border-t border-white/5 pt-10">
               {threads.map(thread => (
                 <div key={thread.id} className="space-y-4 relative group">
                   
                   {/* Smart Auto Summary Layer */}
                   <div className="sticky top-16 md:top-4 z-20 bg-canvas-bg-dark/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-lg mb-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-white mb-1.5 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> {thread.title}
                          </p>
                          <div className="flex flex-wrap gap-2">
                             {thread.themes.map(t => <span key={t} className="text-[10px] text-gray-400 border border-white/10 px-2 py-0.5 rounded-md uppercase tracking-widest font-bold">{t}</span>)}
                          </div>
                        </div>
                        <div className="bg-[#1c1c1c] text-white text-[10px] font-bold uppercase px-3 py-1.5 flex items-center rounded-lg tracking-widest border border-white/10 shrink-0 shadow-inner">
                          Status: {thread.status}
                        </div>
                      </div>
                   </div>
                   
                   {/* Interconnected Conversational Chain */}
                   <div className="pl-4 space-y-8 border-l-2 border-white/[0.03] ml-6 pb-6 relative">
                      <div className="absolute top-0 -left-1 w-2 h-2 rounded-full bg-white/10"></div>
                      <div className="absolute bottom-0 -left-1 w-2 h-2 rounded-full bg-white/10"></div>
                      
                      {thread.comments.map(comment => (
                        <div key={comment.id} className="relative animate-in fade-in slide-in-from-left-4 duration-500">
                          {/* Visual connective line */}
                          <div className="absolute -left-[30px] top-10 w-6 h-px bg-white/10 group-hover:bg-white/20 transition-colors"></div>
                          <ConversationCard comment={comment} />
                        </div>
                      ))}
                   </div>
                 </div>
               ))}
            </div>
         </div>

         {/* Right Sidebar: Relationships & Mapping */}
         <div className="col-span-1 lg:col-span-3 space-y-8 order-3">
            <div className="sticky top-6">
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 pl-2 flex items-center justify-between">
                Relationship Matrix 
                <span className="bg-canvas-primary/20 text-canvas-primary px-2 py-0.5 rounded-full">Live</span>
              </h3>
              <ConnectionMap />
              
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 mt-8 pl-2">Meaningful Nodes</h3>
              <div className="space-y-4">
                {relationships.map(rel => (
                  <RelationshipCard key={rel.id} relationship={rel} />
                ))}
              </div>
            </div>
         </div>

      </div>
    </div>
  );
}
