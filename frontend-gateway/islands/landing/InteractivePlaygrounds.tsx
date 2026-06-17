import { useState } from "preact/hooks";
import * as Icons from "lucide-preact";

export default function InteractivePlaygrounds() {
  return (
    <section className="w-full max-w-[1800px] mx-auto px-6 md:px-16 py-16 space-y-24 relative z-10 overflow-hidden">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-canvas-primary mb-2">
          Experience The System
        </h2>
        <h3 className="text-3xl md:text-5xl font-bold tracking-tight text-[var(--muse-text)]">
          Show, Don't Tell.
        </h3>
        <p className="mt-4 text-[var(--muse-muted)] font-serif italic text-base">
          Interact with the core primitives of Muse. See how raw input is instantly transformed into structured cognitive assets.
        </p>
      </div>

      <JournalPlayground />
      <StreakPlayground />
    </section>
  );
}

function JournalPlayground() {
  const [isTyping, setIsTyping] = useState(false);
  const [text, setText] = useState("");
  const [showSynthesis, setShowSynthesis] = useState(false);

  const fullText = "I've been reading about digital minimalism and stoicism. It seems the key to deep focus isn't just turning off notifications, but actively deciding what deserves our attention in the first place.";

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
        setTimeout(() => setShowSynthesis(true), 600); // AI needs a moment to 'think'
      }
    }, 40); // 40ms per char
  };

  const reset = () => {
    setText("");
    setShowSynthesis(false);
    setIsTyping(false);
  };

  return (
    <div className="relative group bg-emerald-500/5 border border-emerald-500/15 rounded-3xl p-6 md:p-12 overflow-hidden flex flex-col md:flex-row gap-8 items-center min-h-[400px]">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      {/* Left: Explanation */}
      <div className="flex-1 relative z-10 space-y-5">
        <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
          <Icons.BrainCircuit size={24} />
        </div>
        <div>
          <h4 className="text-2xl font-bold text-[var(--muse-text)] tracking-tight">The Synthesis Engine</h4>
          <p className="mt-2 text-[var(--muse-muted)] font-serif italic text-sm leading-relaxed max-w-sm">
            Watch the AI intercept chaotic data. As you journal, the system runs in the background, identifying patterns, tagging concepts, and offering Socratic pushback to deepen your thinking.
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
             <button 
             type="button"
             onClick={reset}
             className="px-4 py-3 bg-white/5 text-gray-400 rounded-full hover:bg-white/10 transition-all cursor-pointer"
           >
             <Icons.RotateCcw size={14} />
           </button>
          )}
        </div>
      </div>

      {/* Right: Interactive Terminal */}
      <div className="flex-1 relative w-full h-full min-h-[300px]">
        <div className="absolute inset-0 bg-[#050505] border border-white/10 rounded-2xl shadow-2xl p-6 flex flex-col font-mono text-sm">
           <div className="flex items-center gap-2 pb-4 border-b border-white/5 mb-4 text-gray-500">
             <Icons.Terminal size={14} /> <span className="text-[10px] tracking-widest uppercase">Journal_Terminal_v2</span>
           </div>
           
           <div className="flex-1 relative">
             {text ? (
               <p className="text-gray-300 leading-relaxed">{text}<span className={`inline-block w-1.5 h-4 ml-1 bg-emerald-400 ${isTyping ? 'animate-pulse' : 'hidden'}`} /></p>
             ) : (
               <p className="text-gray-600 italic">Awaiting cognitive input...</p>
             )}

             {/* AI SYNTHESIS BUBBLE POPUP */}
             <div className={`absolute -right-8 -bottom-4 w-64 bg-[#0a0a0f] border border-emerald-500/30 rounded-xl p-4 shadow-[0_20px_40px_rgba(16,185,129,0.15)] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${showSynthesis ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95 pointer-events-none'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400">Synthesis Complete</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-2 py-1 rounded bg-white/5 text-[9px] text-gray-300">#DigitalMinimalism</span>
                  <span className="px-2 py-1 rounded bg-white/5 text-[9px] text-gray-300">#Stoicism</span>
                  <span className="px-2 py-1 rounded bg-white/5 text-[9px] text-gray-300">#Focus</span>
                </div>
                <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-300 font-serif italic">
                  "If attention is an active choice, what metrics are you currently using to evaluate what deserves yours?"
                </div>
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
  const [level, setLevel] = useState("Dormant");

  const sendSpark = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    
    // Simulate the pulse traveling
    setTimeout(() => {
      setSparks(prev => prev + 1);
      setIsAnimating(false);
      
      // Update level based on sparks
      if (sparks + 1 >= 5) setLevel("Resonance");
      else if (sparks + 1 >= 1) setLevel("Ignition");
    }, 800);
  };

  const getLevelColor = () => {
    if (level === "Resonance") return "text-indigo-400";
    if (level === "Ignition") return "text-amber-400";
    return "text-gray-500";
  };
  const getLevelBg = () => {
    if (level === "Resonance") return "bg-indigo-500/20 border-indigo-500/40 shadow-[0_0_30px_rgba(99,102,241,0.3)]";
    if (level === "Ignition") return "bg-amber-500/20 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.2)]";
    return "bg-white/5 border-white/10";
  };

  return (
    <div className="relative group bg-indigo-500/5 border border-indigo-500/15 rounded-3xl p-6 md:p-12 overflow-hidden flex flex-col md:flex-row-reverse gap-8 items-center min-h-[400px]">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      {/* Right: Explanation */}
      <div className="flex-1 relative z-10 space-y-5 md:pl-8">
        <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
          <Icons.Link2 size={24} />
        </div>
        <div>
          <h4 className="text-2xl font-bold text-[var(--muse-text)] tracking-tight">Cognitive Streaks</h4>
          <p className="mt-2 text-[var(--muse-muted)] font-serif italic text-sm leading-relaxed max-w-sm">
            Connection is built on consistency. Send intellectual sparks to your network. As streaks grow, connections evolve from Dormant to Ignition, and finally to full Resonance.
          </p>
        </div>
        <button 
            type="button"
            onClick={sendSpark}
            disabled={isAnimating}
            className="px-6 py-3 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-500/30 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            <Icons.Zap size={14} className={isAnimating ? 'animate-pulse' : ''} /> {isAnimating ? "Transmitting..." : "Send Spark"}
        </button>
      </div>

      {/* Left: Interactive Graph */}
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
            {/* The active growing line */}
            <div 
              className={`absolute left-0 h-full transition-all duration-1000 ${sparks > 0 ? 'bg-indigo-500/50 w-full' : 'w-0'}`} 
            />
            
            {/* The traveling spark */}
            {isAnimating && (
              <div className="absolute left-0 w-8 h-2 bg-indigo-400 rounded-full blur-[2px] shadow-[0_0_15px_#818cf8] animate-[travel_0.8s_linear_forwards]" />
            )}

            {/* The Badge */}
            <div className={`absolute px-4 py-2 rounded-full border bg-[#050505] transition-all duration-500 ${sparks > 0 ? 'border-indigo-500/50 scale-100 opacity-100' : 'border-white/10 scale-90 opacity-0'}`}>
               <span className="text-xs font-bold font-mono flex items-center gap-2">
                 <Icons.Flame size={12} className={getLevelColor()} /> {sparks} <span className="text-gray-500">days</span>
               </span>
            </div>
        </div>

        {/* State Label */}
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 flex items-center gap-2">
           <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-600">Link State:</span>
           <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${getLevelColor()}`}>{level}</span>
        </div>

        <style>
          {`
            @keyframes travel {
              0% { left: 0%; transform: translateX(0); opacity: 1; }
              80% { opacity: 1; }
              100% { left: 100%; transform: translateX(-100%); opacity: 0; }
            }
          `}
        </style>
      </div>
    </div>
  );
}
