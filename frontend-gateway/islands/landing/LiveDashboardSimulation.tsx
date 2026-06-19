import { useState, useEffect } from "preact/hooks";
import * as Icons from "lucide-preact";

type SimulationState = "idle" | "typing" | "processing" | "synthesized";

export default function LiveDashboardSimulation() {
  const [simState, setSimState] = useState<SimulationState>("idle");
  const [typedText, setTypedText] = useState("");
  
  const fullText = "The architecture of intelligence isn't linear. It's spatial. Every node connected is a potential breakthrough.";

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let typingInterval: ReturnType<typeof setInterval>;

    const runSimulation = () => {
      setSimState("idle");
      setTypedText("");

      // Start typing after 1s
      timeout = setTimeout(() => {
        setSimState("typing");
        let i = 0;
        typingInterval = setInterval(() => {
          setTypedText(fullText.slice(0, i + 1));
          i++;
          if (i >= fullText.length) {
            clearInterval(typingInterval);
            
            // Process synthesis after typing
            setSimState("processing");
            timeout = setTimeout(() => {
              setSimState("synthesized");
              
              // Reset and loop after 5s
              timeout = setTimeout(runSimulation, 6000);
            }, 1200);
          }
        }, 50);
      }, 1000);
    };

    runSimulation();

    return () => {
      clearTimeout(timeout);
      clearInterval(typingInterval);
    };
  }, []);

  return (
    <section className="w-full max-w-[1800px] mx-auto px-4 md:px-16 py-20 space-y-12 relative z-10 overflow-hidden" id="ecosystem">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-canvas-primary mb-2 flex items-center justify-center gap-2">
          <Icons.Workflow size={10} /> The Ecosystem
        </h2>
        <h3 className="text-3xl md:text-5xl font-bold tracking-tight text-[var(--muse-text)] leading-tight">
          The Cognitive Loop.
        </h3>
        <p className="mt-4 text-[var(--muse-muted)] font-serif italic text-base">
          Hover over the modules below to understand the architecture. Watch the system actively synthesize raw capture into the live network.
        </p>
      </div>

      <div className="relative w-full max-w-6xl mx-auto">
        {/* Mock Bento Box Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
          
          {/* WIDGET 1: CAPTURE TERMINAL */}
          <div className="lg:col-span-8 relative overflow-hidden rounded-[3rem] border border-white/5 bg-[#0d0d0d] p-8 md:p-12 shadow-2xl group flex flex-col justify-between min-h-[360px] cursor-help">
            <div className={`absolute inset-0 bg-gradient-to-br transition-opacity duration-1000 pointer-events-none ${simState === 'typing' ? 'from-cyan-500/20 via-transparent to-emerald-500/10 opacity-100' : 'from-indigo-500/10 via-transparent to-emerald-500/5 opacity-50'}`} />
            
            {/* Tooltip */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 backdrop-blur-md border border-white/10 px-4 py-3 rounded-2xl w-64 pointer-events-none z-20 shadow-2xl">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-1 flex items-center gap-2"><Icons.Terminal size={12}/> The Terminal</h4>
              <p className="text-[10px] text-gray-300 font-serif italic">Your entry point. Capture raw thought effortlessly. The AI listens instantly.</p>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-2xl bg-[#151515] border border-white/10 flex items-center justify-center shadow-inner relative overflow-hidden">
                  <div className={`absolute inset-0 bg-cyan-500/20 transition-opacity duration-500 ${simState === 'typing' ? 'opacity-100 animate-pulse' : 'opacity-0'}`} />
                  <Icons.Terminal size={18} className="text-gray-400 relative z-10" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight leading-none">Capture</h2>
                  <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-gray-500">Node Entry</span>
                </div>
              </div>

              <div className="text-2xl md:text-3xl lg:text-4xl font-serif text-white/90 leading-relaxed font-light italic">
                "{typedText}
                <span className={`inline-block w-3 h-8 ml-1 align-middle transition-colors duration-200 ${simState === 'typing' ? 'bg-cyan-400 animate-pulse' : 'bg-transparent'}`} />
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <div className="flex gap-2">
                <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-gray-400 flex items-center gap-1.5 font-mono">
                  <Icons.CornerDownRight size={10} /> 
                  {simState === 'processing' ? 'Synthesizing...' : simState === 'synthesized' ? 'Committed to Ledger' : 'Awaiting Input'}
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                <Icons.ArrowUp size={16} className={`transition-all duration-500 ${simState === 'synthesized' ? 'text-emerald-400 -translate-y-1' : 'text-gray-600'}`} />
              </div>
            </div>
          </div>

          {/* WIDGET 2: COGNITIVE WEATHER */}
          <div className="lg:col-span-4 relative overflow-hidden rounded-[3rem] border border-white/5 bg-[#0d0d0d] p-8 shadow-2xl group flex flex-col justify-between min-h-[360px] cursor-help">
            
            {/* Tooltip */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 backdrop-blur-md border border-white/10 px-4 py-3 rounded-2xl w-56 pointer-events-none z-20 shadow-2xl">
              <h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-1 flex items-center gap-2"><Icons.ScanFace size={12}/> Cognitive Mirror</h4>
              <p className="text-[10px] text-gray-300 font-serif italic">Watch your Resonance Score jump and your digital aura shift dynamically.</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#151515] border border-white/10 flex items-center justify-center shadow-inner">
                <Icons.Activity size={14} className="text-purple-400" />
              </div>
              <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-gray-500">System State</span>
            </div>

            <div className="relative w-full aspect-square max-w-[200px] mx-auto flex items-center justify-center mt-6">
              {/* Animated Aura */}
              <div className={`absolute inset-0 rounded-full blur-3xl transition-all duration-1000 ease-in-out ${simState === 'synthesized' ? 'bg-gradient-to-tr from-fuchsia-500/60 via-purple-500/60 to-indigo-500/60 scale-110' : 'bg-gradient-to-tr from-gray-700/40 via-gray-600/40 to-gray-800/40 scale-90'}`} />
              
              <div className="relative z-10 w-24 h-24 rounded-full border border-white/10 bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center shadow-2xl">
                <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-1">Resonance</span>
                <span className={`text-3xl font-bold tracking-tighter transition-all duration-1000 ${simState === 'synthesized' ? 'text-white' : 'text-gray-400'}`}>
                  {simState === 'synthesized' ? '94%' : '88%'}
                </span>
              </div>
            </div>

            <div className="relative z-10 mt-8 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className="text-2xl font-mono text-white font-bold">{simState === 'synthesized' ? '143' : '142'}</div>
                <div className="text-[9px] uppercase tracking-widest text-gray-500 font-bold mt-1">Nodes</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className="text-2xl font-mono text-white font-bold">12</div>
                <div className="text-[9px] uppercase tracking-widest text-gray-500 font-bold mt-1">Links</div>
              </div>
            </div>
          </div>

          {/* WIDGET 3: RECENT SPATIAL NODES */}
          <div className="lg:col-span-4 relative overflow-hidden rounded-[3rem] border border-white/5 bg-[#0d0d0d] p-8 shadow-2xl group min-h-[300px] cursor-help">
            
            {/* Tooltip */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 backdrop-blur-md border border-white/10 px-4 py-3 rounded-2xl w-56 pointer-events-none z-20 shadow-2xl">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1 flex items-center gap-2"><Icons.GitBranch size={12}/> Synthesis Threads</h4>
              <p className="text-[10px] text-gray-300 font-serif italic">Patterns detected automatically. Watch nodes interlock in real-time.</p>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-xl bg-[#151515] border border-white/10 flex items-center justify-center shadow-inner">
                <Icons.LayoutGrid size={14} className="text-amber-400" />
              </div>
              <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-gray-500">Live Ledger</span>
            </div>

            <div className="space-y-4">
              {/* Simulated new node */}
              <div className={`p-4 rounded-2xl border bg-amber-500/10 border-amber-500/20 transition-all duration-700 ${simState === 'synthesized' ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 hidden'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Icons.GitCommit size={12} className="text-amber-400" />
                  <span className="text-[9px] uppercase tracking-widest text-amber-400 font-bold">New Thread Detected</span>
                </div>
                <p className="text-sm font-serif italic text-white leading-snug">"Spatial Intelligence"</p>
              </div>

              {/* Existing nodes */}
              <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.02]">
                <p className="text-sm font-serif italic text-gray-400 leading-snug">"The cost of a thing is the amount of life exchanged for it."</p>
              </div>
            </div>
          </div>

          {/* WIDGET 4: TELEMETRY SPARKLINE */}
          <div className="lg:col-span-8 relative overflow-hidden rounded-[3rem] border border-white/5 bg-[#0d0d0d] p-8 shadow-2xl group flex flex-col justify-between min-h-[300px] cursor-help">
            
            {/* Tooltip */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 backdrop-blur-md border border-white/10 px-4 py-3 rounded-2xl w-64 pointer-events-none z-20 shadow-2xl">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1 flex items-center gap-2"><Icons.Network size={12}/> Global Community</h4>
              <p className="text-[10px] text-gray-300 font-serif italic">Your personal sync rate mapped against the global protocol heartbeat.</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#151515] border border-white/10 flex items-center justify-center shadow-inner">
                <Icons.Activity size={14} className="text-emerald-400" />
              </div>
              <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-gray-500">Resonance Telemetry</span>
            </div>

            <div className="relative w-full flex-1 mt-6 border-b border-white/5 flex items-end">
              <svg className="w-full h-24" viewBox="0 0 100 30" preserveAspectRatio="none">
                <path
                  d={simState === 'synthesized' ? "M0,25 C10,25 20,20 30,22 C40,24 50,15 60,18 C70,21 80,5 90,8 C95,10 100,2 100,2" : "M0,25 C10,25 20,20 30,22 C40,24 50,15 60,18 C70,21 80,18 90,20 C95,21 100,20 100,20"}
                  fill="none"
                  className="stroke-emerald-500 transition-all duration-1000"
                  strokeWidth="0.5"
                  strokeDasharray="200"
                  strokeDashoffset={simState === 'idle' ? '200' : '0'}
                  style={{ animation: simState !== 'idle' ? 'dash 2s ease-out forwards' : 'none' }}
                />
                <path
                  d={simState === 'synthesized' ? "M0,25 C10,25 20,20 30,22 C40,24 50,15 60,18 C70,21 80,5 90,8 C95,10 100,2 100,2 L100,30 L0,30 Z" : "M0,25 C10,25 20,20 30,22 C40,24 50,15 60,18 C70,21 80,18 90,20 C95,21 100,20 100,20 L100,30 L0,30 Z"}
                  fill="url(#gradient-emerald)"
                  className="opacity-20 transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="gradient-emerald" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="relative z-10 mt-6 flex items-center justify-between">
              <div>
                <div className="text-xl font-mono text-white font-bold">{simState === 'synthesized' ? '+4%' : '+0%'}</div>
                <div className="text-[9px] uppercase tracking-widest text-gray-500 font-bold mt-1">Sync Delta</div>
              </div>
            </div>
          </div>

        </div>
      </div>
      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </section>
  );
}
