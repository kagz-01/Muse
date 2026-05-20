import { Head } from "$fresh/runtime.ts";
import { AlertTriangle, Home, RefreshCw } from "lucide-preact";

export default function Error404() {
  return (
    <>
      <Head>
        <title>Signal Lost - Muse Intelligence</title>
      </Head>
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 selection:bg-canvas-primary selection:text-white relative overflow-hidden">
        {/* CINEMATIC BACKGROUND */}
        <div className="fixed inset-0 z-0 opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40 z-20" />
          <div className="absolute inset-0 bg-gradient-radial from-rose-500/10 to-transparent blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-xl w-full text-center space-y-12 animate-in fade-in zoom-in-95 duration-700">
          <div className="relative mx-auto w-32 h-32">
            <div className="absolute inset-0 bg-rose-500/20 blur-3xl rounded-full animate-pulse" />
            <div className="relative w-32 h-32 rounded-[2.5rem] bg-white/5 border border-rose-500/30 flex items-center justify-center text-rose-500 shadow-3xl">
              <AlertTriangle size={64} strokeWidth={1.5} />
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-rose-500 leading-none">
              Error Protocol 404
            </p>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white leading-none">
              SIGNAL{" "}
              <span className="text-gray-700 italic font-serif">LOST.</span>
            </h1>
            <p className="max-w-md mx-auto text-gray-500 text-xl font-serif italic leading-relaxed">
              "The artifact you are searching for does not exist in this
              cognitive plane. The signal has drifted into the void."
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <a
              href="/"
              className="w-full sm:w-auto px-10 py-5 bg-white text-black font-bold uppercase tracking-widest text-[11px] rounded-2xl shadow-3xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
            >
              <Home size={16} /> Return to Nexus
            </a>
            <button
              type="button"
              onClick={() => globalThis.location.reload()}
              className="w-full sm:w-auto px-10 py-5 bg-white/5 border border-white/10 text-gray-400 font-bold uppercase tracking-widest text-[11px] rounded-2xl hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-3"
            >
              <RefreshCw size={16} /> Re-Sync Terminal
            </button>
          </div>

          <div className="pt-12 flex items-center justify-center gap-4 text-[9px] font-bold font-mono tracking-widest text-gray-800 uppercase">
            <span>Coordinate Mismatch</span>
            <span className="h-3 w-px bg-white/5" />
            <span>Sovereignty Maintained</span>
          </div>
        </div>
      </div>
    </>
  );
}
