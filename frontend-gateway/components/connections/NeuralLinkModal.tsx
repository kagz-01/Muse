import { useState } from "preact/hooks";
import * as Icons from "lucide-preact";
import { Collaborator } from "../../signals/connections.ts";

interface Props {
  collaborator: Collaborator;
  onClose: () => void;
}

export default function NeuralLinkModal({ collaborator, onClose }: Props) {
  const [citation, setCitation] = useState("");
  const [isLinking, setIsLinking] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleEstablishLink = (e: Event) => {
    e.preventDefault();
    if (!citation.trim()) return;

    setIsLinking(true);
    // Simulate cryptographic link establishment
    setTimeout(() => {
      setIsLinking(false);
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-500">
        <div
          className="absolute top-0 right-0 h-full w-1/2 opacity-20 blur-[80px] pointer-events-none transition-all duration-1000"
          style={{ backgroundColor: collaborator.aura }}
        />

        <button
          type="button"
          onClick={onClose}
          className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors z-10"
        >
          <Icons.X size={24} />
        </button>

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <img
              src={collaborator.avatar}
              alt={collaborator.name}
              className="w-16 h-16 rounded-2xl border-2 border-white/10 object-cover"
            />
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Establish Neural Link
                <Icons.Link size={20} style={{ color: collaborator.aura }} />
              </h2>
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mt-1">
                Target Node: {collaborator.name}
              </p>
            </div>
          </div>

          {!isSuccess ? (
            <form onSubmit={handleEstablishLink}>
              <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 mb-8">
                <div className="flex items-start gap-4 mb-6">
                  <Icons.AlertTriangle size={20} className="text-amber-500 shrink-0 mt-1" />
                  <div>
                    <h3 className="text-sm font-bold text-white mb-2">
                      Friction Protocol Active
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed font-serif italic">
                      Blank connections are rejected by the network. To establish a neural link with {collaborator.name}, you must cite a specific thought or pattern from the ledger that aligns with their frequency.
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                      Cite Ledger Node
                    </label>
                    <span className="text-[10px] font-bold text-emerald-400">
                      {collaborator.matchPercentage}% Alignment Detected
                    </span>
                  </div>
                  <textarea
                    value={citation}
                    onInput={(e) => setCitation((e.target as HTMLTextAreaElement).value)}
                    placeholder={`e.g., "I resonated deeply with your synthesis on ${collaborator.sharedThemes[0]}..."`}
                    className="w-full bg-black/50 border border-white/10 rounded-2xl p-5 text-white text-sm font-serif italic focus:outline-none focus:border-canvas-primary/50 transition-colors min-h-[100px]"
                    disabled={isLinking}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!citation.trim() || isLinking}
                  className="px-8 py-4 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.05)] cursor-pointer"
                  style={{
                    backgroundColor: isLinking ? 'rgba(255,255,255,0.1)' : collaborator.aura,
                    color: isLinking ? '#888' : '#000',
                  }}
                >
                  {isLinking ? (
                    <>
                      <Icons.RefreshCcw size={14} className="animate-spin" />
                      Encrypting Link...
                    </>
                  ) : (
                    <>
                      <Icons.Cpu size={14} />
                      Transmit Link Request
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center animate-in zoom-in duration-500">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_60px_currentColor]"
                style={{ backgroundColor: `${collaborator.aura}20`, color: collaborator.aura }}
              >
                <Icons.Check size={40} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Neural Link Established</h3>
              <p className="text-gray-500 font-serif italic">
                Your citation has been encrypted and transmitted to {collaborator.name}.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
