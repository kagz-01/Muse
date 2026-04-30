import { X, Zap, Activity, Sparkles } from "lucide-preact";

export default function DemoVideo({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-500">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/95 backdrop-blur-3xl"
      />

      <div className="relative w-full max-w-6xl aspect-video bg-[#0a0a0a] border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-700">
        
        {/* VIDEO PLAYER (Mock/Placeholder) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute inset-0 bg-linear-to-tr from-canvas-primary/10 via-transparent to-white/5 opacity-50" />
          
          {/* In a real scenario, we'd use a <video> tag here */}
          <div className="relative text-center space-y-8 p-12">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10 animate-pulse">
               <Activity size={40} className="text-canvas-primary" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tighter uppercase">System Intelligence <span className="text-gray-600 italic font-serif lowercase">preview</span></h2>
            <p className="max-w-xl mx-auto text-gray-500 font-serif italic text-lg leading-relaxed">
              Experience the seamless flow of Muse 2.0. From capture to synthesis, witness the evolution of your digital consciousness.
            </p>
            
            <div className="pt-10 flex flex-wrap justify-center gap-4">
               {[
                 { label: "Capture Engine", icon: Zap },
                 { label: "Vault Architecture", icon: Sparkles },
                 { label: "Mirror Synthesis", icon: Activity }
               ].map(tag => (
                 <div key={tag.label} className="px-6 py-3 rounded-full bg-white/5 border border-white/10 flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                   <tag.icon size={14} className="text-canvas-primary" /> {tag.label}
                 </div>
               ))}
            </div>
          </div>

          {/* SIMULATED UI OVERLAY */}
          <div className="absolute top-10 left-10 p-4 border border-white/10 rounded-2xl bg-black/40 backdrop-blur-xl">
             <div className="w-32 h-2 bg-white/10 rounded-full mb-3 overflow-hidden">
                <div className="h-full bg-canvas-primary w-1/3 animate-[progress_3s_infinite]" />
             </div>
             <div className="flex gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/5" />
                <div className="w-8 h-8 rounded-lg bg-white/5" />
                <div className="w-8 h-8 rounded-lg bg-white/5" />
             </div>
          </div>
        </div>

        <button 
          type="button"
          onClick={onClose}
          className="absolute top-10 right-10 w-14 h-14 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all cursor-pointer z-50 hover:rotate-90"
        >
          <X size={24} />
        </button>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 px-8 py-4 rounded-full bg-black/60 border border-white/10 backdrop-blur-3xl text-[10px] font-bold uppercase tracking-[0.4em] text-gray-500">
           Playing: Muse_System_Architecture_v2.0.mp4
        </div>
      </div>

      <style>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>

    </div>
  );
}
