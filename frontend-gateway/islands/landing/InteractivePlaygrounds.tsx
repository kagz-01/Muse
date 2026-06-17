import { useState, useEffect } from "preact/hooks";
import * as Icons from "lucide-preact";

export default function InteractivePlaygrounds() {
  return (
    <section className="w-full max-w-[1800px] mx-auto px-6 md:px-16 py-16 space-y-32 relative z-10 overflow-hidden">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-canvas-primary mb-2">
          Experience The System
        </h2>
        <h3 className="text-3xl md:text-5xl font-bold tracking-tight text-[var(--muse-text)]">
          The Cognitive Loop.
        </h3>
        <p className="mt-4 text-[var(--muse-muted)] font-serif italic text-base">
          A four-stage interactive journey. Watch how raw consumption is captured, contemplated, reflected upon, and ultimately connected to the global network.
        </p>
      </div>

      <div className="space-y-32 relative">
         {/* Vertical connection line */}
         <div className="absolute left-[24px] md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-cyan-500/20 via-emerald-500/20 to-indigo-500/20 -z-10" />
         
         <CollectPlayground />
         <JournalPlayground />
         <MirrorPlayground />
         <StreakPlayground />
      </div>
    </section>
  );
}

function CollectPlayground() {
  const [isCapturing, setIsCapturing] = useState(false);
  const [isThreaded, setIsThreaded] = useState(false);

  const simulateCapture = () => {
    if (isCapturing) return;
    setIsCapturing(true);
    setTimeout(() => {
      setIsThreaded(true);
    }, 1200);
  };

  const reset = () => {
    setIsCapturing(false);
    setIsThreaded(false);
  };

  return (
    <div className="relative group bg-cyan-500/5 border border-cyan-500/15 rounded-3xl p-6 md:p-12 overflow-hidden flex flex-col md:flex-row gap-8 items-center min-h-[400px]">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className="flex-1 relative z-10 space-y-5 order-2 md:order-1">
        <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center text-cyan-400">
          <Icons.Aperture size={24} />
        </div>
        <div>
           <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-500/60 mb-1">Stage 1</div>
          <h4 className="text-2xl font-bold text-[var(--muse-text)] tracking-tight">Consume & Collect</h4>
          <p className="mt-2 text-[var(--muse-muted)] font-serif italic text-sm leading-relaxed max-w-sm">
            Stop losing profound thoughts in the scroll. Capture an insight into a Sovereign Room and watch the AI instantly weave it into a Synthesis Thread with your past knowledge.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={simulateCapture}
            disabled={isCapturing}
            className="px-6 py-3 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-cyan-500/30 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            <Icons.Download size={14} /> {isCapturing ? "Capturing..." : "Capture Insight"}
          </button>
          {isThreaded && (
             <button onClick={reset} className="px-4 py-3 bg-white/5 text-gray-400 rounded-full hover:bg-white/10 transition-all cursor-pointer">
               <Icons.RotateCcw size={14} />
             </button>
          )}
        </div>
      </div>

      <div className="flex-1 relative w-full h-full min-h-[300px] flex items-center justify-center order-1 md:order-2">
         {/* Mock Tweet/Article */}
         <div className={`absolute z-30 w-64 p-4 rounded-xl border border-white/10 bg-[#050505] shadow-2xl transition-all duration-1000 ${isCapturing ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-50 opacity-0' : 'top-0 left-[10%] scale-100 opacity-100'}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-gray-700" />
              <div className="w-16 h-2 rounded bg-gray-700" />
            </div>
            <p className="text-xs text-gray-300">"The cost of a thing is the amount of what I will call life which is required to be exchanged for it, immediately or in the long run."</p>
         </div>

         {/* The Sovereign Room Base */}
         <div className={`absolute bottom-0 w-80 h-40 border border-cyan-500/20 bg-cyan-500/5 rounded-2xl flex flex-col items-center justify-center transition-all duration-1000 ${isCapturing ? 'opacity-100 shadow-[0_0_50px_rgba(34,211,238,0.15)]' : 'opacity-40'}`}>
            <Icons.LayoutGrid size={32} className="text-cyan-500/40 mb-2" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-500/50">Philosophy Room</span>
            
            {/* The Threaded Item */}
            {isThreaded && (
              <div className="absolute top-4 w-64 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl animate-in zoom-in-95 duration-500 flex items-center gap-3 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                <Icons.GitBranch size={16} className="text-cyan-400" />
                <div className="text-left">
                  <p className="text-[9px] text-cyan-300 font-bold uppercase tracking-widest">Woven into thread</p>
                  <p className="text-xs text-white line-clamp-1">"The cost of a thing..."</p>
                </div>
              </div>
            )}
         </div>

         {/* Connection lines simulating threading */}
         {isThreaded && (
           <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
             <path d="M 100 150 Q 150 50 250 200" stroke="rgba(34,211,238,0.4)" strokeWidth="2" fill="none" className="animate-[dash_1s_linear_forwards]" strokeDasharray="1000" strokeDashoffset="1000" />
             <path d="M 300 100 Q 250 150 250 200" stroke="rgba(34,211,238,0.4)" strokeWidth="2" fill="none" className="animate-[dash_1.5s_linear_forwards]" strokeDasharray="1000" strokeDashoffset="1000" />
           </svg>
         )}

         <style>
           {`
             @keyframes dash {
               to { stroke-dashoffset: 0; }
             }
           `}
         </style>
      </div>
    </div>
  );
}

function JournalPlayground() {
  const [isTyping, setIsTyping] = useState(false);
  const [text, setText] = useState("");
  const [showSynthesis, setShowSynthesis] = useState(false);

  const fullText = "Thoreau's quote connects to my recent struggles with focus. If attention is life currency, doomscrolling isn't just wasted time—it's a literal drain on my vitality.";

  const simulateTyping = () => {
    if (isTyping || showSynthesis) return;
    setIsTyping(true);
    setText("");
    setShowSynthesis(false);

    let i = 0;
    const interval = setInterval(() => {
      setText(fullText.slice(0, i + 1));
      i++;
      if (i >= fullText.length) {
        clearInterval(interval);
        setIsTyping(false);
        setTimeout(() => setShowSynthesis(true), 600);
      }
    }, 40);
  };

  const reset = () => {
    setText("");
    setShowSynthesis(false);
    setIsTyping(false);
  };

  return (
    <div className="relative group bg-emerald-500/5 border border-emerald-500/15 rounded-3xl p-6 md:p-12 overflow-hidden flex flex-col md:flex-row gap-8 items-center min-h-[400px]">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className="flex-1 relative w-full h-full min-h-[300px]">
        <div className="absolute inset-0 bg-[#050505] border border-white/10 rounded-2xl shadow-2xl p-6 flex flex-col font-mono text-sm">
           <div className="flex items-center gap-2 pb-4 border-b border-white/5 mb-4 text-gray-500">
             <Icons.Terminal size={14} /> <span className="text-[10px] tracking-widest uppercase">Journal_Terminal_v2</span>
           </div>
           
           <div className="flex-1 relative">
             {text ? (
               <p className="text-gray-300 leading-relaxed">{text}<span className={`inline-block w-1.5 h-4 ml-1 bg-emerald-400 ${isTyping ? 'animate-pulse' : 'hidden'}`} /></p>
             ) : (
               <p className="text-gray-600 italic">Awaiting synthesis from Room context...</p>
             )}

             {showSynthesis && (
               <div className={`absolute -right-4 -bottom-4 w-64 bg-[#0a0a0f] border border-emerald-500/30 rounded-xl p-4 shadow-[0_20px_40px_rgba(16,185,129,0.15)] animate-in slide-in-from-bottom-4 duration-500`}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400">Context Extracted</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-2 py-1 rounded bg-white/5 text-[9px] text-gray-300">#AttentionEconomy</span>
                    <span className="px-2 py-1 rounded bg-white/5 text-[9px] text-gray-300">#Thoreau</span>
                  </div>
                  <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-300 font-serif italic">
                    "If attention is currency, how are you budgeting it daily? Can you define your current 'attention expenses'?"
                  </div>
               </div>
             )}
           </div>
        </div>
      </div>

      <div className="flex-1 relative z-10 space-y-5 md:pl-8">
        <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
          <Icons.PenTool size={24} />
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-500/60 mb-1">Stage 2</div>
          <h4 className="text-2xl font-bold text-[var(--muse-text)] tracking-tight">Contemplate & Synthesize</h4>
          <p className="mt-2 text-[var(--muse-muted)] font-serif italic text-sm leading-relaxed max-w-sm">
            Draw from your curated threads and start writing. The system actively analyzes your thoughts, extracting tags and posing Socratic questions to push your insight further.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            type="button"
            onClick={simulateTyping}
            disabled={isTyping || showSynthesis}
            className="px-6 py-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500/30 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            <Icons.Keyboard size={14} /> Simulate Entry
          </button>
          {showSynthesis && (
             <button type="button" onClick={reset} className="px-4 py-3 bg-white/5 text-gray-400 rounded-full hover:bg-white/10 transition-all cursor-pointer">
               <Icons.RotateCcw size={14} />
             </button>
          )}
        </div>
      </div>
    </div>
  );
}

function MirrorPlayground() {
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [level, setLevel] = useState(1); // 1 = low, 2 = mid, 3 = high
  
  const runSynthesis = () => {
    if (isSynthesizing || level >= 3) return;
    setIsSynthesizing(true);
    setTimeout(() => {
      setLevel(prev => prev + 1);
      setIsSynthesizing(false);
    }, 1500);
  };

  const reset = () => {
    setLevel(1);
    setIsSynthesizing(false);
  };

  const getAuraColor = () => {
    if (level === 3) return "from-fuchsia-500 via-purple-500 to-indigo-500 shadow-[0_0_80px_rgba(168,85,247,0.4)]";
    if (level === 2) return "from-purple-500/50 via-indigo-500/50 to-blue-500/50 shadow-[0_0_40px_rgba(99,102,241,0.2)]";
    return "from-gray-700 via-gray-600 to-gray-800 shadow-none opacity-40";
  };

  return (
    <div className="relative group bg-purple-500/5 border border-purple-500/15 rounded-3xl p-6 md:p-12 overflow-hidden flex flex-col md:flex-row gap-8 items-center min-h-[400px]">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className="flex-1 relative z-10 space-y-5 order-2 md:order-1">
        <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center text-purple-400">
          <Icons.ScanFace size={24} />
        </div>
        <div>
           <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-purple-500/60 mb-1">Stage 3</div>
          <h4 className="text-2xl font-bold text-[var(--muse-text)] tracking-tight">Reflect & Visualize</h4>
          <p className="mt-2 text-[var(--muse-muted)] font-serif italic text-sm leading-relaxed max-w-sm">
            Every entry feeds the Cognitive Mirror. Watch your Resonance Score jump and your digital aura shift dynamically as your intellectual footprint grows.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            type="button"
            onClick={runSynthesis}
            disabled={isSynthesizing || level >= 3}
            className="px-6 py-3 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-purple-500/30 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            <Icons.Cpu size={14} className={isSynthesizing ? 'animate-spin' : ''} /> {isSynthesizing ? "Processing..." : "Run Synthesis"}
          </button>
          {level > 1 && (
             <button type="button" onClick={reset} className="px-4 py-3 bg-white/5 text-gray-400 rounded-full hover:bg-white/10 transition-all cursor-pointer">
               <Icons.RotateCcw size={14} />
             </button>
          )}
        </div>
      </div>

      <div className="flex-1 relative w-full h-full min-h-[300px] flex items-center justify-center order-1 md:order-2">
         {/* THE AURA ORB */}
         <div className="relative w-64 h-64 flex items-center justify-center">
            <div className={`absolute inset-0 rounded-full bg-gradient-to-tr blur-2xl transition-all duration-1000 ease-in-out ${getAuraColor()} ${isSynthesizing ? 'animate-pulse scale-110' : 'scale-100'}`} />
            
            <div className="relative z-10 w-32 h-32 rounded-full border border-white/10 bg-[#050505]/80 backdrop-blur-xl flex flex-col items-center justify-center shadow-2xl">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Resonance</span>
              <span className={`text-4xl font-bold tracking-tighter transition-all duration-1000 ${level === 3 ? 'text-white' : level === 2 ? 'text-gray-300' : 'text-gray-600'}`}>
                {level === 1 ? '12%' : level === 2 ? '48%' : '94%'}
              </span>
            </div>

            {/* Orbiting metrics */}
            <div className={`absolute w-full h-full animate-[spin-slow_10s_linear_infinite] transition-opacity duration-1000 ${level > 1 ? 'opacity-100' : 'opacity-0'}`}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#050505] border border-white/10 flex items-center justify-center shadow-lg">
                <Icons.Layers size={12} className="text-gray-400" />
              </div>
            </div>
            <div className={`absolute w-[120%] h-[120%] animate-[spin-reverse_15s_linear_infinite] transition-opacity duration-1000 ${level === 3 ? 'opacity-100' : 'opacity-0'}`}>
              <div className="absolute bottom-0 right-1/4 w-8 h-8 rounded-full bg-[#050505] border border-white/10 flex items-center justify-center shadow-lg">
                <Icons.Flame size={12} className="text-orange-400" />
              </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function StreakPlayground() {
  const [sparks, setSparks] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isBroadcasted, setIsBroadcasted] = useState(false);

  const level = sparks >= 5 ? "Resonance" : sparks >= 1 ? "Ignition" : "Dormant";

  const sendSpark = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    
    setTimeout(() => {
      setSparks(prev => prev + 1);
      setIsAnimating(false);
    }, 800);
  };

  const broadcast = () => {
    setIsBroadcasted(true);
  };

  const reset = () => {
    setSparks(0);
    setIsBroadcasted(false);
    setIsAnimating(false);
  };

  const getLevelColor = () => {
    if (level === "Resonance") return "text-blue-400";
    if (level === "Ignition") return "text-amber-400";
    return "text-gray-500";
  };
  const getLevelBg = () => {
    if (level === "Resonance") return "bg-blue-500/20 border-blue-500/40 shadow-[0_0_30px_rgba(59,130,246,0.3)]";
    if (level === "Ignition") return "bg-amber-500/20 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.2)]";
    return "bg-white/5 border-white/10";
  };

  return (
    <div className="relative group bg-blue-500/5 border border-blue-500/15 rounded-3xl p-6 md:p-12 overflow-hidden flex flex-col md:flex-row-reverse gap-8 items-center min-h-[400px]">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className="flex-1 relative w-full h-full min-h-[300px] flex items-center justify-center">
        {/* Node A (User) */}
        <div className="absolute left-[10%] top-1/2 -translate-y-1/2 flex flex-col items-center gap-3 z-20">
           <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ${getLevelBg()}`}>
             <Icons.User size={24} className={getLevelColor()} />
           </div>
           <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">You</span>
        </div>

        {/* Node B (Partner) */}
        <div className="absolute right-[10%] top-1/2 -translate-y-1/2 flex flex-col items-center gap-3 z-20">
           <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ${getLevelBg()}`}>
             <Icons.User size={24} className={getLevelColor()} />
           </div>
           <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Partner</span>
        </div>

        {/* Connection Line & Particle */}
        <div className="absolute left-[20%] right-[20%] top-1/2 -translate-y-1/2 h-0.5 bg-white/10 z-10 flex items-center justify-center">
            <div className={`absolute left-0 h-full transition-all duration-1000 ${sparks > 0 ? 'bg-blue-500/50 w-full' : 'w-0'}`} />
            
            {isAnimating && (
              <div className="absolute left-0 w-8 h-2 bg-blue-400 rounded-full blur-[2px] shadow-[0_0_15px_#60a5fa] animate-[travel_0.8s_linear_forwards]" />
            )}

            <div className={`absolute px-4 py-2 rounded-full border bg-[#050505] transition-all duration-500 ${sparks > 0 ? 'border-blue-500/50 scale-100 opacity-100' : 'border-white/10 scale-90 opacity-0'}`}>
               <span className="text-xs font-bold font-mono flex items-center gap-2">
                 <Icons.Flame size={12} className={getLevelColor()} /> {sparks} <span className="text-gray-500">days</span>
               </span>
            </div>
        </div>

        {/* Broadcast Ripple */}
        {isBroadcasted && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center z-0 pointer-events-none">
            <div className="absolute w-32 h-32 rounded-full border-2 border-blue-400/50 animate-[ripple_2s_ease-out_infinite]" />
            <div className="absolute w-32 h-32 rounded-full border-2 border-blue-400/30 animate-[ripple_2s_ease-out_0.5s_infinite]" />
          </div>
        )}

        <style>
          {`
            @keyframes travel {
              0% { left: 0%; transform: translateX(0); opacity: 1; }
              80% { opacity: 1; }
              100% { left: 100%; transform: translateX(-100%); opacity: 0; }
            }
            @keyframes ripple {
              0% { transform: scale(1); opacity: 1; }
              100% { transform: scale(4); opacity: 0; }
            }
          `}
        </style>
      </div>

      <div className="flex-1 relative z-10 space-y-5 md:pl-8">
        <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
          <Icons.Network size={24} />
        </div>
        <div>
           <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-500/60 mb-1">Stage 4</div>
          <h4 className="text-2xl font-bold text-[var(--muse-text)] tracking-tight">Connect & Broadcast</h4>
          <p className="mt-2 text-[var(--muse-muted)] font-serif italic text-sm leading-relaxed max-w-sm">
            Intellectual output shouldn't die in isolation. Send cognitive sparks to partners to build consistency streaks, or broadcast your immutable insights to the ledger.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            type="button"
            onClick={sendSpark}
            disabled={isAnimating}
            className="px-6 py-3 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-blue-500/30 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            <Icons.Zap size={14} className={isAnimating ? 'animate-pulse' : ''} /> Send Spark
          </button>
          
          <button 
            type="button"
            onClick={broadcast}
            disabled={isBroadcasted || sparks === 0}
            className="px-6 py-3 bg-white/5 text-gray-300 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            <Icons.Radio size={14} className={isBroadcasted ? 'text-blue-400 animate-pulse' : ''} /> {isBroadcasted ? "Broadcasting..." : "Broadcast Insight"}
          </button>

          {(sparks > 0 || isBroadcasted) && (
             <button type="button" onClick={reset} className="px-4 py-3 bg-white/5 text-gray-400 rounded-full hover:bg-white/10 transition-all cursor-pointer">
               <Icons.RotateCcw size={14} />
             </button>
          )}
        </div>
      </div>
    </div>
  );
}
