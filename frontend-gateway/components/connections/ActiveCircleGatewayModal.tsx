import { useState } from "preact/hooks";
import * as Icons from "lucide-preact";
import { ActiveCircle } from "./ActiveCircleCard.tsx";

interface Props {
  circle: ActiveCircle;
  onClose: () => void;
}

export default function ActiveCircleGatewayModal({ circle, onClose }: Props) {
  const [selectedMode, setSelectedMode] = useState<
    "observer" | "synthesizer" | null
  >(null);
  const [stakedThought, setStakedThought] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const handleEnter = (e: Event) => {
    e.preventDefault();
    if (selectedMode === "synthesizer" && !stakedThought.trim()) return;

    if (selectedMode === "synthesizer") {
      setIsVerifying(true);
      // Simulate Proof of Resonance verification
      setTimeout(() => {
        globalThis.location.href =
          `/threads/${circle.id}?type=circle&mode=synthesizer`;
      }, 2000);
    } else {
      globalThis.location.href =
        `/threads/${circle.id}?type=circle&mode=observer`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-3xl bg-[#0a0a0a] border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-500">
        <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-indigo-500/10 to-transparent blur-3xl pointer-events-none" />

        <button
          type="button"
          onClick={onClose}
          className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors z-10"
        >
          <Icons.X size={24} />
        </button>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-[0.2em]">
                Active Circle Gateway
              </span>
            </div>
          </div>

          <h2 className="text-4xl font-bold tracking-tight text-white mb-4">
            {circle.name}
          </h2>
          <p className="text-lg text-gray-500 font-serif italic mb-10 border-l-2 border-indigo-500/30 pl-4">
            "{circle.description}"
          </p>

          {!selectedMode
            ? (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Observer Mode Card */}
                <button
                  type="button"
                  onClick={() => setSelectedMode("observer")}
                  className="group relative bg-white/[0.03] border border-white/5 rounded-[2rem] p-8 text-left hover:bg-white/[0.05] hover:border-gray-500/30 transition-all cursor-pointer"
                >
                  <Icons.Eye
                    size={32}
                    className="text-gray-400 mb-6 group-hover:scale-110 transition-transform"
                  />
                  <h3 className="text-xl font-bold text-white mb-2">
                    Observer
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Enter silently. You can read, trace lineage, and explore the
                    collective intelligence without friction.
                  </p>
                  <div className="mt-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    No Staking Required{" "}
                    <Icons.ArrowRight
                      size={14}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                </button>

                {/* Synthesizer Mode Card */}
                <button
                  type="button"
                  onClick={() => setSelectedMode("synthesizer")}
                  className="group relative bg-indigo-500/5 border border-indigo-500/20 rounded-[2rem] p-8 text-left hover:bg-indigo-500/10 hover:border-indigo-500/40 transition-all shadow-[0_0_40px_rgba(99,102,241,0.05)] cursor-pointer"
                >
                  <Icons.Edit3
                    size={32}
                    className="text-indigo-400 mb-6 group-hover:scale-110 transition-transform"
                  />
                  <h3 className="text-xl font-bold text-white mb-2">
                    Synthesizer
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Gain speaking rights. You must stake a highly-resonating
                    thought to prove alignment with this frequency.
                  </p>
                  <div className="mt-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                    Proof of Resonance Required{" "}
                    <Icons.ArrowRight
                      size={14}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                </button>
              </div>
            )
            : (
              <div className="animate-in slide-in-from-right-8 duration-500">
                <button
                  type="button"
                  onClick={() => setSelectedMode(null)}
                  className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors flex items-center gap-2 mb-8 cursor-pointer group"
                >
                  <Icons.ArrowLeft
                    size={14}
                    className="group-hover:-translate-x-1 transition-transform"
                  />{" "}
                  Back to Protocol Selection
                </button>

                {selectedMode === "observer"
                  ? (
                    <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 text-center">
                      <Icons.Eye
                        size={48}
                        className="text-gray-400 mx-auto mb-6"
                      />
                      <h3 className="text-2xl font-bold text-white mb-4">
                        Enter Silently
                      </h3>
                      <p className="text-gray-500 font-serif italic mb-8 max-w-md mx-auto">
                        You are entering the {circle.name}{" "}
                        circle as an observer. You will have full read access to
                        all synthesis, but cannot publish new nodes.
                      </p>
                      <button
                        type="button"
                        onClick={handleEnter}
                        className="px-10 py-5 bg-white text-black rounded-full text-[11px] font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl cursor-pointer"
                      >
                        Initialize Connection
                      </button>
                    </div>
                  )
                  : (
                    <form
                      onSubmit={handleEnter}
                      className="bg-indigo-500/5 border border-indigo-500/20 rounded-[2rem] p-8"
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <Icons.Lock size={20} className="text-indigo-400" />
                        <h3 className="text-lg font-bold text-white">
                          Proof of Resonance
                        </h3>
                      </div>
                      <p className="text-sm text-gray-400 mb-6">
                        To gain publishing rights, select a thought from your
                        Journal or write a new one that aligns deeply with{" "}
                        <span className="text-indigo-400 font-bold">
                          {circle.theme}
                        </span>.
                      </p>

                      <textarea
                        value={stakedThought}
                        onInput={(e) =>
                          setStakedThought(
                            (e.target as HTMLTextAreaElement).value,
                          )}
                        placeholder="Stake your perspective here..."
                        className="w-full bg-black/50 border border-indigo-500/30 rounded-2xl p-6 text-white text-lg font-serif italic focus:outline-none focus:border-indigo-500/60 transition-colors min-h-[120px] mb-8"
                        disabled={isVerifying}
                      />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-black/50 border border-white/10 rounded-lg">
                          <Icons.Database size={12} className="text-gray-500" />
                          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                            Stake from Journal
                          </span>
                        </div>

                        <button
                          type="submit"
                          disabled={!stakedThought.trim() || isVerifying}
                          className="px-8 py-4 bg-indigo-500/20 border border-indigo-500/50 text-indigo-400 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-[0_0_20px_rgba(99,102,241,0.2)] cursor-pointer"
                        >
                          {isVerifying
                            ? (
                              <>
                                <Icons.Cpu
                                  size={14}
                                  className="animate-pulse"
                                />
                                Verifying Resonance...
                              </>
                            )
                            : (
                              <>
                                Stake & Enter
                                <Icons.ArrowRight size={14} />
                              </>
                            )}
                        </button>
                      </div>
                    </form>
                  )}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
