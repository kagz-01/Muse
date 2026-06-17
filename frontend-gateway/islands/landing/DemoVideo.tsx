import { useState, useEffect } from "preact/hooks";
import * as Icons from "lucide-preact";

const features = [
  { 
    id: "capture", 
    label: "Capture Engine", 
    icon: Icons.Zap, 
    desc: "Instantly digitize raw thoughts before they fade.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30"
  },
  { 
    id: "vault", 
    label: "Vault Architecture", 
    icon: Icons.Aperture, 
    desc: "Cryptographically seal your intellectual property.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30"
  },
  { 
    id: "mirror", 
    label: "Mirror Synthesis", 
    icon: Icons.Activity, 
    desc: "Watch AI connect your scattered ideas into patterns.",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/30"
  },
];

export default function DemoVideo(
  { isOpen, onClose }: { isOpen: boolean; onClose: () => void },
) {
  const [activeFeature, setActiveFeature] = useState(0);

  // Auto-rotate features if user isn't hovering
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-500">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/95 backdrop-blur-3xl"
      />

      <div className="relative w-full max-w-6xl aspect-[4/3] md:aspect-video bg-[#050505] border border-white/10 rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-700 flex flex-col">
        
        {/* Dynamic Background */}
        <div className="absolute inset-0 z-0 opacity-30 transition-colors duration-1000" 
             style={{ background: `radial-gradient(circle at center, ${features[activeFeature].color.replace('text-', '').replace('-400', '')} 0%, transparent 70%)` }} 
        />

        {/* TOP BAR */}
        <div className="relative z-20 flex items-center justify-between p-6 md:p-8">
           <div className="flex items-center gap-3">
             <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
             <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Live Simulation</span>
           </div>
           <button
            type="button"
            onClick={onClose}
            className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all cursor-pointer z-50 hover:rotate-90"
          >
            <Icons.X size={20} />
          </button>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="relative z-10 flex-1 flex flex-col md:flex-row items-center justify-center p-8 gap-12">
           
           {/* Visualizer Side */}
           <div className="flex-1 flex items-center justify-center w-full min-h-[250px]">
              <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
                 {/* 1. Capture Engine Visual */}
                 <div className={`absolute inset-0 transition-all duration-700 ${activeFeature === 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}>
                    <div className="w-full h-full rounded-full border border-amber-500/20 flex items-center justify-center animate-[spin-slow_10s_linear_infinite]">
                       <div className="w-3/4 h-3/4 rounded-full border border-dashed border-amber-500/40 flex items-center justify-center animate-[spin-reverse_8s_linear_infinite]">
                          <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.3)] animate-pulse">
                             <Icons.Zap size={24} className="text-amber-400" />
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* 2. Vault Architecture Visual */}
                 <div className={`absolute inset-0 transition-all duration-700 ${activeFeature === 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}>
                    <div className="w-full h-full grid grid-cols-3 gap-2 p-8">
                       {[...Array(9)].map((_, i) => (
                         <div key={i} className={`bg-cyan-500/10 border border-cyan-500/20 rounded-lg flex items-center justify-center transition-all duration-500 ${i === 4 ? 'bg-cyan-500/30 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4)] scale-110' : ''}`}>
                            {i === 4 ? <Icons.Lock size={24} className="text-cyan-400" /> : <Icons.Hash size={16} className="text-cyan-500/30" />}
                         </div>
                       ))}
                    </div>
                 </div>

                 {/* 3. Mirror Synthesis Visual */}
                 <div className={`absolute inset-0 transition-all duration-700 ${activeFeature === 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}>
                    <div className="w-full h-full flex items-center justify-center">
                       <div className="absolute w-full h-px bg-indigo-500/20" />
                       <div className="absolute h-full w-px bg-indigo-500/20" />
                       <div className="relative w-48 h-48 border border-indigo-500/30 rotate-45 flex items-center justify-center shadow-[0_0_40px_rgba(99,102,241,0.2)]">
                          <div className="absolute w-32 h-32 border border-indigo-400/50 bg-indigo-500/10 animate-pulse" />
                          <Icons.Network size={32} className="text-indigo-400 -rotate-45" />
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Interactive Text/Controls Side */}
           <div className="flex-1 space-y-8 w-full">
              <div>
                <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tighter uppercase mb-4">
                  Experience <br/> <span className="text-gray-500 italic font-serif lowercase">the system</span>
                </h2>
                <p className="text-gray-400 font-serif italic text-sm md:text-base max-w-md">
                  Hover over the modules below to see how Muse processes cognitive data in real-time.
                </p>
              </div>

              <div className="space-y-3">
                {features.map((feature, idx) => (
                  <button
                    key={feature.id}
                    type="button"
                    onMouseEnter={() => setActiveFeature(idx)}
                    onClick={() => setActiveFeature(idx)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-start gap-4 cursor-pointer ${
                      activeFeature === idx 
                      ? `${feature.bg} ${feature.border} scale-[1.02]` 
                      : 'bg-white/5 border-white/10 hover:bg-white/10 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${activeFeature === idx ? feature.color : 'text-gray-500'}`}>
                      <feature.icon size={20} />
                    </div>
                    <div>
                      <h4 className={`font-bold uppercase tracking-widest text-[10px] mb-1 ${activeFeature === idx ? feature.color : 'text-gray-400'}`}>
                        {feature.label}
                      </h4>
                      <p className="text-gray-400 font-serif italic text-xs">
                        {feature.desc}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
           </div>
        </div>

      </div>

      <style>
        {`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
      `}
      </style>
    </div>
  );
}
