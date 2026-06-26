import { useEffect, useState } from "preact/hooks";
import * as Icons from "lucide-preact";

export default function DemoVideo(
  { isOpen, onClose }: { isOpen: boolean; onClose: () => void },
) {
  const [step, setStep] = useState(0); // 0: Rooms, 1: Threads, 2: Journal, 3: Mirror/Broadcast, 4: Done

  // Step 0: Rooms
  const [isUploading, setIsUploading] = useState(false);
  const [artifactUploaded, setArtifactUploaded] = useState(false);

  // Step 1: Threads
  const [isExtracting, setIsExtracting] = useState(false);

  // Step 2: Journal
  const [journalText, setJournalText] = useState("");
  const [isJournaling, setIsJournaling] = useState(false);

  // Step 3: Mirror & Broadcast
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setIsUploading(false);
      setArtifactUploaded(false);
      setIsExtracting(false);
      setJournalText("");
      setIsJournaling(false);
      setIsBroadcasting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUploadArtifact = () => {
    setIsUploading(true);
    setTimeout(() => {
      setArtifactUploaded(true);
      setTimeout(() => {
        setStep(1);
      }, 1000);
    }, 1500);
  };

  const handleExtractBlueprint = () => {
    setIsExtracting(true);
    setTimeout(() => {
      setStep(2);
    }, 1500);
  };

  const handleJournalCommit = () => {
    if (!journalText.trim() || isJournaling) return;
    setIsJournaling(true);
    setTimeout(() => {
      setStep(3);
    }, 1500);
  };

  const handleBroadcast = () => {
    setIsBroadcasting(true);
    setTimeout(() => {
      setStep(4);
    }, 2000);
  };

  const steps = [
    { title: "Rooms", icon: Icons.LayoutGrid, color: "text-cyan-400" },
    { title: "Threads", icon: Icons.GitBranch, color: "text-amber-400" },
    { title: "Journal", icon: Icons.PenTool, color: "text-emerald-400" },
    { title: "Mirror", icon: Icons.ScanFace, color: "text-purple-400" },
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
        <div
          className="absolute inset-0 z-0 opacity-20 transition-colors duration-1000"
          style={{
            background: `radial-gradient(circle at center, ${
              step === 0
                ? "#22d3ee" // Cyan for Rooms
                : step === 1
                ? "#f59e0b" // Amber for Threads
                : step === 2
                ? "#10b981" // Emerald for Journal
                : step === 3
                ? "#a855f7"
                : "#3b82f6" // Purple for Mirror
            } 0%, transparent 70%)`,
          }}
        />

        {/* TOP BAR */}
        <div className="relative z-20 flex items-center justify-between p-6 md:p-8">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">
              Interactive Simulation
            </span>
          </div>

          {/* Step Progress indicator */}
          <div className="hidden md:flex items-center gap-4">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-500 ${
                    step >= i
                      ? `border-${s.color.split("-")[1]}-500/50 bg-${
                        s.color.split("-")[1]
                      }-500/20 ${s.color}`
                      : "border-white/10 text-gray-600"
                  }`}
                >
                  <s.icon size={10} />
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`w-8 h-px ${
                      step > i
                        ? `bg-${s.color.split("-")[1]}-500/50`
                        : "bg-white/10"
                    }`}
                  />
                )}
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
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-8 gap-12 overflow-y-auto">
          {/* Interactive Visualizer */}
          <div className="flex-1 flex flex-col items-center justify-center w-full min-h-[300px]">
            {/* STEP 0: ROOMS (Artifact Upload) */}
            {step === 0 && (
              <div className="w-full max-w-md space-y-6 animate-in slide-in-from-bottom-8 duration-500">
                <div className="text-center space-y-2 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-4 text-cyan-400">
                    <Icons.LayoutGrid size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    Sovereign Rooms
                  </h3>
                  <p className="text-gray-400 font-serif italic text-sm">
                    The foundation of the loop. Upload an artifact to give the
                    AI context.
                  </p>
                </div>

                <div
                  className={`w-full bg-[#0a0a0a] border-2 border-dashed border-cyan-500/30 rounded-3xl p-8 flex flex-col items-center justify-center transition-all duration-500 ${
                    artifactUploaded
                      ? "border-cyan-400 bg-cyan-500/10"
                      : "hover:border-cyan-500/50"
                  }`}
                >
                  {artifactUploaded
                    ? (
                      <div className="flex flex-col items-center gap-3 animate-in zoom-in duration-500">
                        <Icons.FileCheck size={48} className="text-cyan-400" />
                        <span className="text-sm font-bold text-cyan-400 uppercase tracking-widest">
                          Artifact Secured
                        </span>
                      </div>
                    )
                    : (
                      <div className="flex flex-col items-center gap-4 text-center">
                        <div
                          className={`w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center ${
                            isUploading ? "animate-pulse" : ""
                          }`}
                        >
                          <Icons.UploadCloud
                            size={24}
                            className="text-cyan-400"
                          />
                        </div>
                        <div>
                          <p className="text-white font-bold text-sm">
                            Drag & Drop an Artifact
                          </p>
                          <p className="text-gray-500 text-xs mt-1">
                            e.g. PDF: "Meditations by Marcus Aurelius"
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleUploadArtifact}
                          disabled={isUploading}
                          className="mt-4 px-6 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-full text-[10px] font-bold uppercase tracking-widest disabled:opacity-50 transition-all cursor-pointer flex items-center gap-2"
                        >
                          {isUploading
                            ? (
                              <>
                                <Icons.Loader2
                                  size={14}
                                  className="animate-spin"
                                />{" "}
                                Uploading...
                              </>
                            )
                            : "Simulate Upload"}
                        </button>
                      </div>
                    )}
                </div>
              </div>
            )}

            {/* STEP 1: THREADS (Synthesis) */}
            {step === 1 && (
              <div className="w-full max-w-md space-y-6 animate-in slide-in-from-bottom-8 duration-500">
                <div className="text-center space-y-2 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4 text-amber-400">
                    <Icons.GitBranch size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    Synthesis Threads
                  </h3>
                  <p className="text-gray-400 font-serif italic text-sm">
                    The AI analyzes the artifact to extract themes and
                    blueprints.
                  </p>
                </div>

                <div className="bg-[#0a0a0a] border border-amber-500/30 rounded-2xl p-6 relative overflow-hidden">
                  <div
                    className={`absolute inset-0 bg-amber-500/10 transition-opacity duration-1000 ${
                      isExtracting ? "opacity-100 animate-pulse" : "opacity-0"
                    }`}
                  />

                  <div className="flex flex-col items-center text-center relative z-10 space-y-4">
                    <Icons.FileText size={32} className="text-amber-500/50" />
                    <div>
                      <p className="text-xs text-amber-400 font-bold uppercase tracking-widest mb-1">
                        Artifact Detected
                      </p>
                      <p className="text-white text-sm font-serif italic">
                        "Meditations by Marcus Aurelius"
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleExtractBlueprint}
                      disabled={isExtracting}
                      className="px-6 py-3 w-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 rounded-xl text-[10px] font-bold uppercase tracking-widest disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
                    >
                      {isExtracting
                        ? (
                          <>
                            <Icons.Loader2 size={14} className="animate-spin" />
                            {" "}
                            Extracting Blueprint...
                          </>
                        )
                        : "Extract Blueprint"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: JOURNAL (Capture Raw Thought) */}
            {step === 2 && (
              <div className="w-full max-w-lg space-y-6 animate-in slide-in-from-bottom-8 duration-500">
                <div className="text-center space-y-2 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4 text-emerald-400">
                    <Icons.PenTool size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-white">The Journal</h3>
                  <p className="text-gray-400 font-serif italic text-sm">
                    Context is set. Capture your raw thoughts on the extracted
                    theme.
                  </p>
                </div>

                <div className="bg-[#0a0a0a] border border-emerald-500/30 rounded-2xl p-6 relative">
                  {/* Thread Context Badge */}
                  <div className="absolute -top-3 left-6 px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center gap-2 backdrop-blur-md">
                    <Icons.GitBranch size={10} className="text-emerald-400" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400">
                      Active Thread: Stoic Resilience
                    </span>
                  </div>

                  <div
                    className={`relative transition-all duration-500 mt-4 ${
                      isJournaling ? "scale-95 opacity-50 blur-sm" : ""
                    }`}
                  >
                    <textarea
                      value={journalText}
                      onInput={(e) =>
                        setJournalText((e.target as HTMLTextAreaElement).value)}
                      placeholder="e.g. Aurelius talks about resilience, but how does this apply to modern digital overload?"
                      className="w-full bg-transparent border-none text-white placeholder:text-gray-600 focus:outline-none resize-none h-24 font-serif italic"
                    />

                    {/* Simulated AI Prompt if user types */}
                    {journalText.length > 10 && !isJournaling && (
                      <div className="mt-4 p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-start gap-3 animate-in fade-in zoom-in-95 duration-500">
                        <Icons.Sparkles
                          size={14}
                          className="text-emerald-400 mt-0.5 shrink-0"
                        />
                        <p className="text-xs text-gray-300">
                          <span className="font-bold text-emerald-400 block mb-1">
                            AI Socratic Prompt:
                          </span>
                          If digital overload is the obstacle, what is the
                          'internal citadel' you must build today?
                        </p>
                      </div>
                    )}

                    <div className="flex justify-end mt-4">
                      <button
                        type="button"
                        onClick={handleJournalCommit}
                        disabled={!journalText.trim() || isJournaling}
                        className="px-6 py-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-xl text-[10px] font-bold uppercase tracking-widest disabled:opacity-50 transition-all cursor-pointer flex items-center gap-2"
                      >
                        {isJournaling
                          ? (
                            <>
                              <Icons.Loader2
                                size={14}
                                className="animate-spin"
                              />{" "}
                              Saving to Ledger...
                            </>
                          )
                          : "Commit Insight"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: MIRROR & BROADCAST */}
            {step === 3 && (
              <div className="w-full max-w-md space-y-6 animate-in slide-in-from-bottom-8 duration-500">
                <div className="text-center space-y-2 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4 text-purple-400">
                    <Icons.Globe2 size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    Mirror & Network
                  </h3>
                  <p className="text-gray-400 font-serif italic text-sm">
                    Your thought is secured. Broadcast to the ecosystem and
                    update your resonance.
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center py-8 relative">
                  <div
                    className={`absolute w-64 h-64 rounded-full blur-3xl transition-all duration-1000 ${
                      isBroadcasting
                        ? "bg-gradient-to-tr from-fuchsia-500/60 via-purple-500/60 to-indigo-500/60 scale-125"
                        : "bg-gray-800/40 scale-100"
                    }`}
                  />

                  <div className="relative z-10 w-32 h-32 rounded-full border border-white/10 bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center shadow-2xl mb-8 overflow-hidden">
                    {isBroadcasting && (
                      <div className="absolute inset-0 rounded-full border-2 border-purple-400 animate-[ripple_1s_ease-out_infinite]" />
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                      Resonance
                    </span>
                    <span
                      className={`text-4xl font-bold tracking-tighter transition-colors duration-1000 ${
                        isBroadcasting ? "text-white" : "text-gray-400"
                      }`}
                    >
                      {isBroadcasting ? "94%" : "88%"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleBroadcast}
                    disabled={isBroadcasting}
                    className="relative z-10 px-8 py-4 w-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 rounded-xl text-[10px] font-bold uppercase tracking-widest disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isBroadcasting
                      ? (
                        <>
                          <Icons.Loader2 size={14} className="animate-spin" />
                          {" "}
                          Broadcasting to Network...
                        </>
                      )
                      : "Update Mirror & Broadcast"}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: COMPLETE */}
            {step === 4 && (
              <div className="w-full max-w-md space-y-6 text-center animate-in zoom-in-95 duration-700">
                <div className="w-24 h-24 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center mx-auto mb-6">
                  <Icons.Check size={40} className="text-blue-400" />
                </div>
                <h3 className="text-4xl font-bold text-white tracking-tight">
                  Loop Complete.
                </h3>
                <p className="text-gray-400 font-serif italic text-lg leading-relaxed">
                  You have successfully added an artifact, extracted its
                  synthesis, captured your thoughts, and broadcasted to the
                  network.
                </p>
                <div className="pt-8">
                  <button
                    type="button"
                    onClick={async () => {
                      onClose();
                      try {
                        const response = await fetch("/api/auth/demo", {
                          method: "POST",
                          redirect: "manual",
                        });
                        if (response.status === 303) {
                          globalThis.location.href = response.headers.get("location") || "/dashboard";
                        } else {
                          globalThis.location.href = "/dashboard";
                        }
                      } catch {
                        globalThis.location.href = "/dashboard";
                      }
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
          100% { transform: scale(3); opacity: 0; }
        }
      `}
      </style>
    </div>
  );
}
