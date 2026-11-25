import * as Icons from "lucide-preact";

export default function DashboardWidgets() {
  return (
    <section className="mb-16 mt-6 px-6 md:px-10">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">
            Contemplation
          </h2>
          <p className="text-gray-400 font-serif italic">
            Your latest patterns and insights.
          </p>
        </div>
      </header>

      <div className="flex gap-6 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
        {/* Weekly Mirror Sneak Peek widget */}
        <a
          href="/mirror"
          className="group relative overflow-hidden bg-linear-to-br from-[#1c1c1c] to-canvas-bg-dark rounded-3xl p-8 border border-white/5 shadow-lg cursor-pointer hover:border-canvas-primary/30 transition-all duration-300 transform hover:-translate-y-1 block min-w-[320px] md:min-w-[380px] snap-start"
        >
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none">
          </div>
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <Icons.Aperture size={20} className="text-canvas-primary" />
            <h3 className="font-semibold text-white/90 tracking-tight">
              Weekly Mirror
            </h3>
          </div>
          <p className="text-sm text-gray-400 mb-6 font-serif italic leading-relaxed relative z-10 pr-4">
            "You've been collecting a lot of ambient music lately..."
          </p>
          <div className="flex items-center gap-2 text-xs font-medium text-canvas-primary relative z-10 group-hover:translate-x-1 transition-transform">
            Reflect now <Icons.ArrowRight size={14} />
          </div>
        </a>

        {/* Meaningful Network Widget */}
        <a
          href="/connections"
          className="group bg-[#1c1c1c] rounded-3xl p-8 border border-white/5 shadow-lg cursor-pointer hover:border-canvas-primary/30 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden block min-w-[320px] md:min-w-[380px] snap-start"
        >
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none">
          </div>
          <div className="flex flex-col h-full relative z-10">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <Icons.MessageSquare
                  size={20}
                  className="text-canvas-primary"
                />
                <h3 className="font-bold text-white tracking-tight">
                  Community Hub
                </h3>
              </div>
              <span className="bg-canvas-primary/10 text-canvas-primary text-[10px] uppercase tracking-widest px-2 py-1 rounded-md font-bold shadow-sm">
                3 Circles Growing
              </span>
            </div>

            <p className="text-sm text-gray-400 mb-6 leading-relaxed font-serif italic pr-2">
              "You and{" "}
              <span className="text-white font-sans font-medium not-italic">
                David Chen
              </span>{" "}
              have had 8 thoughtful exchanges. The community is exploring{" "}
              <span className="text-white font-sans font-medium not-italic">
                Silence
              </span>."
            </p>

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
              <div className="flex -space-x-2">
                <img
                  src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=150&q=80"
                  className="w-8 h-8 rounded-full border-[3px] border-[#1c1c1c] object-cover"
                  alt=""
                />
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
                  className="w-8 h-8 rounded-full border-[3px] border-[#1c1c1c] object-cover"
                  alt=""
                />
                <div className="w-8 h-8 rounded-full border-[3px] border-[#1c1c1c] bg-[#222] flex items-center justify-center text-[10px] font-bold text-gray-500">
                  +12
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-canvas-primary group-hover:translate-x-1 transition-transform">
                Enter Dialogue <Icons.ArrowRight size={14} />
              </div>
            </div>
          </div>
        </a>
      </div>
    </section>
  );
}
