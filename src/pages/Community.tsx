import React from 'react';
import { Users, Shield } from 'lucide-react';
import { useUserStore } from '../store/useUserStore';

export default function Community() {
  const { soloMode, toggleSoloMode } = useUserStore();

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto pb-24 md:pb-10 min-h-full font-sans transition-all duration-500 flex flex-col items-center justify-center animate-in fade-in zoom-in-95">
      <div className="w-full max-w-2xl text-center">
         <div className="w-24 h-24 bg-canvas-primary/10 text-canvas-primary rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-canvas-primary/20">
            <Users size={40} />
         </div>
         <h2 className="text-4xl font-bold tracking-tight text-white mb-6">Interest Pods</h2>
         
         {soloMode ? (
           <div className="bg-[#1c1c1c] p-8 rounded-3xl border border-white/5 shadow-xl mt-8 animate-in fade-in slide-in-from-bottom-4">
             <Shield className="mx-auto text-gray-500 mb-4" size={32} />
             <h3 className="text-xl font-bold mb-2">Solo Mode is Active</h3>
             <p className="text-gray-400 mb-6">You are completely invisible to the network right now. Disable Solo Mode to join an algorithmic pod.</p>
             <button onClick={toggleSoloMode} className="px-8 py-3 bg-canvas-primary text-white font-bold rounded-full hover:shadow-lg hover:shadow-indigo-500/20 transition-all active:scale-95 cursor-pointer">
                Disable Solo Mode
             </button>
           </div>
         ) : (
           <div className="bg-[#1c1c1c] p-8 rounded-3xl border border-white/5 shadow-xl mt-8 animate-in fade-in slide-in-from-bottom-4">
             <p className="text-gray-400 text-lg leading-relaxed mb-6 font-serif">
               Muse is currently algorithmicly matching your Dominant Realms with like-minded creators. 
             </p>
             <p className="text-gray-500 leading-relaxed text-sm mb-8">
               Instead of sprawling public algorithms screaming for your attention, Muse unites you in closed, focus-driven engagement pods of exactly 10-15 people sharing your exact contemplative patterns.
             </p>
             
             <div className="p-1 border-t border-white/5 w-full flex justify-center pt-8">
               <button className="px-8 py-4 bg-white text-black hover:bg-gray-200 rounded-full font-bold transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:-translate-y-1 active:scale-95 duration-200 cursor-pointer">
                 Join the Waitlist
               </button>
             </div>
           </div>
         )}
      </div>
    </div>
  );
}
