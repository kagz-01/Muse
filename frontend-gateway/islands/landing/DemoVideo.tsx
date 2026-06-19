import { useState, useEffect } from "preact/hooks";
import * as Icons from "lucide-preact";

export default function DemoVideo(
  { isOpen, onClose }: { isOpen: boolean; onClose: () => void },
) {
  const [step, setStep] = useState(0); // 0: Capture, 1: Synthesize, 2: Mirror, 3: Broadcast, 4: Done
  
  // Step 1 State
  const [captureText, setCaptureText] = useState("");
  const [isCapturing, setIsCapturing] = useState(false);
  
  // Step 2 State
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  
  // Step 3 State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Step 4 State
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setCaptureText("");
      setIsCapturing(false);
      setIsSynthesizing(false);
      setIsAnalyzing(false);
      setIsBroadcasting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCapture = () => {
    if (!captureText.trim() || isCapturing) return;
    setIsCapturing(true);
    setTimeout(() => {
      setStep(1);
    }, 1000);
  };

  const handleSynthesize = () => {
    setIsSynthesizing(true);
    setTimeout(() => {
      setStep(2);
    }, 1500);
  };

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setStep(3);
    }, 1500);
  };

  const handleBroadcast = () => {
    setIsBroadcasting(true);
    setTimeout(() => {
      setStep(4);
    }, 1500);
  };

  const steps = [
    { title: "Capture", icon: Icons.Zap, color: "text-amber-400" },
    { title: "Synthesize", icon: Icons.GitBranch, color: "text-cyan-400" },
    { title: "Reflect", icon: Icons.ScanFace, color: "text-purple-400" },
    { title: "Broadcast", icon: Icons.Radio, color: "text-emerald-400" },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-500">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/95 backdrop-blur-3xl"
      />

      <div className="relative w-full max-w-6xl aspect-[4/3] md:aspect-video bg-[#050505] border border-white/10 rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-700 flex flex-col">
        
        {/* Dynamic Background */}
        <div className="absolute inset-0 z-0 opacity-20 transition-colors duration-1000" 
             style={{ 
               background: `radial-gradient(circle at center, ${
                 step === 0 ? '#f59e0b' : 
                 step === 1 ? '#22d3ee' : 
                 step === 2 ? '#a855f7' : 
                 step === 3 ? '#10b981' : '#3b82f6'
               } 0%, transparent 70%)` 
             }} 
        />

        {/* TOP BAR */}
        <div className="relative z-20 flex items-center justify-between p-6 md:p-8">
           <div className="flex items-center gap-3">
             <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
             <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Interactive Simulation</span>
           </div>
           
           {/* Step Progress indicator */}
           <div className="hidden md:flex items-center gap-4">
             {steps.map((s, i) => (
               <div key={i} className="flex items-center gap-2">
                 <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-500 ${step >= i ? `border-${s.color.split('-')[1]}-500/50 bg-${s.color.split('-')[1]}-500/20 ${s.color}` : 'border-white/10 text-gray-600'}`}>
                   <s.icon size={10} />
                 </div>
                 {i < steps.length - 1 && <div className={`w-8 h-px ${step > i ? `bg-${s.color.split('-')[1]}-500/50` : 'bg-white/10'}`} />}
               </div>
             ))}
           </div>

           <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all cursor-pointer z-50 hover:rotate-90"
          >
            <Icons.X size={16} />
          </button>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="relative z-10 flex-1 flex flex-col md:flex-row items-center justify-center p-8 gap-12 overflow-y-auto">
           
           {/* Interactive Visualizer Side */}
           <div className="flex-1 flex flex-col items-center justify-center w-full min-h-[300px]">
              
              {/* STEP 0: CAPTURE */}
              {step === 0 && (
                <div className="w-full max-w-md space-y-6 animate-in slide-in-from-bottom-8 duration-500">
                  <div className="text-center space-y-2 mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4 text-amber-400">
                      <Icons.Zap size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Capture a Thought</h3>
                    <p className="text-gray-400 font-serif italic text-sm">Type a quick insight below and press Enter to save it to your Sovereign Room.</p>
                  </div>
                  
                  <div className={`relative transition-all duration-500 ${isCapturing ? 'scale-95 opacity-50 blur-sm' : ''}`}>
                    <textarea 
                      value={captureText}
                      onInput={(e) => setCaptureText((e.target as HTMLTextAreaElement).value)}
                      placeholder="e.g. The attention economy drains our vitality..."
                      className="w-full bg-[#0a0a0a] border border-amber-500/30 rounded-2xl p-6 text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-400 resize-none h-32"
                    />
                    <button 
                      type="button"
                      onClick={handleCapture}
                      disabled={!captureText.trim() || isCapturing}
                      className="absolute bottom-4 right-4 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-xl text-[10px] font-bold uppercase tracking-widest disabled:opacity-50 transition-all cursor-pointer flex items-center gap-2"
                    >
                      {isCapturing ? <><Icons.Loader2 size={14} className="animate-spin" /> Saving...</> : "Commit"}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 1: SYNTHESIZE */}
              {step === 1 && (
                <div className="w-full max-w-md space-y-6 animate-in slide-in-from-bottom-8 duration-500">
                  <div className="text-center space-y-2 mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-4 text-cyan-400">
                      <Icons.GitBranch size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Synthesize Context</h3>
                    <p className="text-gray-400 font-serif italic text-sm">The AI has analyzed your input. Click to weave it into a Synthesis Thread.</p>
                  </div>

                  <div className="bg-[#0a0a0a] border border-cyan-500/30 rounded-2xl p-6 relative overflow-hidden">
                    <div className={`absolute inset-0 bg-cyan-500/10 transition-opacity duration-1000 ${isSynthesizing ? 'opacity-100' : 'opacity-0'}`} />
                    
                    <div className="flex items-start gap-4 relative z-10">
                      <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0">
                        <Icons.Sparkles size={14} className="text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-xs text-cyan-400 font-bold uppercase tracking-widest mb-2">AI Socratic Prompt</p>
                        <p className="text-white text-sm font-serif italic mb-4">"You mentioned the attention economy. How does this connect to your previous thoughts on digital sovereignty?"</p>
                        
                        <button 
                          type="button"
                          onClick={handleSynthesize}
                          disabled={isSynthesizing}
                          className="px-6 py-3 w-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 rounded-xl text-[10px] font-bold uppercase tracking-widest disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          {isSynthesizing ? <><Icons.Loader2 size={14} className="animate-spin" /> Threading...</> : "Generate Thread"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: MIRROR */}
              {step === 2 && (
                <div className="w-full max-w-md space-y-6 animate-in slide-in-from-bottom-8 duration-500">
                  <div className="text-center space-y-2 mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4 text-purple-400">
                      <Icons.ScanFace size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Cognitive Mirror</h3>
                    <p className="text-gray-400 font-serif italic text-sm">Your intellectual footprint has expanded. Update your resonance.</p>
                  </div>

                  <div className="flex flex-col items-center justify-center py-8 relative">
                    <div className={`absolute w-64 h-64 rounded-full blur-3xl transition-all duration-1000 ${isAnalyzing ? 'bg-gradient-to-tr from-fuchsia-500/60 via-purple-500/60 to-indigo-500/60 scale-125' : 'bg-gray-800/40 scale-100'}`} />
                    
                    <div className="relative z-10 w-32 h-32 rounded-full border border-white/10 bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center shadow-2xl mb-8">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Resonance</span>
                      <span className={`text-4xl font-bold tracking-tighter transition-colors duration-1000 ${isAnalyzing ? 'text-white' : 'text-gray-400'}`}>
                        {isAnalyzing ? '94%' : '88%'}
                      </span>
                    </div>

                    <button 
                      type="button"
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                      className="relative z-10 px-8 py-4 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 rounded-xl text-[10px] font-bold uppercase tracking-widest disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isAnalyzing ? <><Icons.Loader2 size={14} className="animate-spin" /> Recalculating...</> : "Update Mirror"}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: BROADCAST */}
              {step === 3 && (
                <div className="w-full max-w-md space-y-6 animate-in slide-in-from-bottom-8 duration-500">
                  <div className="text-center space-y-2 mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4 text-emerald-400">
                      <Icons.Radio size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Broadcast</h3>
                    <p className="text-gray-400 font-serif italic text-sm">Don't let your insight die in isolation. Send it to the network.</p>
                  </div>

                  <div className="relative h-48 border border-emerald-500/20 bg-emerald-500/5 rounded-2xl flex items-center justify-center overflow-hidden">
                    {/* Fake nodes */}
                    <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-emerald-500/30" />
                    <div className="absolute bottom-1/4 right-1/4 w-2 h-2 rounded-full bg-emerald-500/30" />
                    <div className="absolute top-1/3 right-1/3 w-2 h-2 rounded-full bg-emerald-500/30" />

                    {/* Central User Node */}
                    <div className={`relative z-10 w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center transition-all duration-1000 ${isBroadcasting ? 'scale-150 border-emerald-400' : ''}`}>
                       <Icons.User size={16} className="text-emerald-400" />
                       
                       {/* Broadcasting ripples */}
                       {isBroadcasting && (
                         <>
                          <div className="absolute inset-0 rounded-full border border-emerald-400 animate-[ripple_1s_ease-out_infinite]" />
                          <div className="absolute inset-0 rounded-full border border-emerald-400 animate-[ripple_1s_ease-out_0.3s_infinite]" />
                         </>
                       )}
                    </div>
                  </div>

                  <button 
                    type="button"
                    onClick={handleBroadcast}
                    disabled={isBroadcasting}
                    className="w-full px-8 py-4 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-[10px] font-bold uppercase tracking-widest disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isBroadcasting ? <><Icons.Loader2 size={14} className="animate-spin" /> Broadcasting to Ledger...</> : "Commit to Network"}
                  </button>
                </div>
              )}

              {/* STEP 4: COMPLETE */}
              {step === 4 && (
                <div className="w-full max-w-md space-y-6 text-center animate-in zoom-in-95 duration-700">
                  <div className="w-24 h-24 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center mx-auto mb-6">
                    <Icons.Check size={40} className="text-blue-400" />
                  </div>
                  <h3 className="text-4xl font-bold text-white tracking-tight">Loop Complete.</h3>
                  <p className="text-gray-400 font-serif italic text-lg leading-relaxed">
                    You have successfully captured, synthesized, reflected, and broadcasted your first artifact.
                  </p>
                  <div className="pt-8">
                    <button 
                      type="button"
                      onClick={() => {
                        onClose();
                        globalThis.location.href = "/dashboard?demo=1";
                      }}
                      className="px-8 py-4 bg-white text-black rounded-full text-[11px] font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                    >
                      Enter The Real System
                    </button>
                  </div>
                </div>
              )}
           </div>

        </div>
      </div>

      <style>
        {`
        @keyframes ripple {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(4); opacity: 0; }
        }
      `}
      </style>
    </div>
  );
}
