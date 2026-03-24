import React from 'react';
import { useThreadsStore } from '../store/useThreadsStore';
import { useItemsStore } from '../store/useItemsStore';
import { Layers } from 'lucide-react';

export default function Threads() {
  const threads = useThreadsStore(state => state.threads);
  const items = useItemsStore(state => state.items);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto pb-24 md:pb-10">
      <header className="mb-10">
        <h2 className="text-3xl font-bold tracking-tight mb-2">Your Threads</h2>
        <p className="text-gray-400">Discover cross-platform connections and themes.</p>
      </header>

      {threads.length === 0 ? (
         <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/5 border-dashed">
            <p className="text-gray-400">No threads yet. AI will generate connections as you collect more items.</p>
         </div>
      ) : (
         <div className="grid gap-6">
           {threads.map(thread => {
             const threadItems = items.filter(i => thread.itemIds.includes(i.id));
             return (
               <div key={thread.id} className="bg-[#1c1c1c] p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors shadow-lg">
                 <div className="flex items-center gap-3 mb-4">
                   <div className="p-2 bg-canvas-primary/20 text-canvas-primary rounded-lg">
                      <Layers size={20} />
                   </div>
                   <h3 className="text-xl font-semibold tracking-tight">{thread.title}</h3>
                 </div>
                 <p className="text-gray-400 mb-6 italic">"{thread.description}"</p>
                 
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   {threadItems.map(item => (
                     <div key={item.id} className="bg-[#252525] rounded-xl p-3 border border-white/5">
                        <div className="h-24 bg-[#1c1c1c] rounded-lg mb-3 flex items-center justify-center border border-white/5">
                           <span className="text-xs text-gray-600 font-medium">Visual</span>
                        </div>
                        <p className="text-sm font-medium leading-tight line-clamp-2">{item.title}</p>
                     </div>
                   ))}
                 </div>
               </div>
             )
           })}
         </div>
      )}
    </div>
  );
}
