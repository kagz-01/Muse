import React from 'react';

export default function Mirror() {
  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto pb-24 md:pb-10 min-h-full flex flex-col justify-center">
      <header className="mb-10 text-center">
        <h2 className="text-4xl font-bold tracking-tight mb-4">Weekly Mirror</h2>
        <p className="text-gray-400">Reflections on your recent collections.</p>
      </header>

      <div className="bg-linear-to-br from-[#1c1c1c] to-[#0a0a0a] rounded-3xl p-8 md:p-12 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-canvas-primary/20 blur-3xl rounded-full"></div>
        <div className="relative z-10">
          <h3 className="text-2xl font-semibold mb-8">This week in Muse</h3>
          <div className="space-y-4">
            <div className="p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
              <p className="text-gray-300"><span className="text-white font-bold text-xl">12</span> items saved to Visual Idea</p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
              <p className="text-gray-300 leading-relaxed font-medium">You've been collecting a lot of ambient music lately—maybe a cohesive playlist is waiting to be made from your threads.</p>
            </div>
          </div>
          <button className="mt-10 px-6 py-3 bg-canvas-primary hover:bg-[#4f46e5] transition-colors rounded-full font-medium shadow-lg hover:shadow-canvas-primary/20 hover:-translate-y-0.5 transform duration-200">
            Share Insight
          </button>
        </div>
      </div>
    </div>
  );
}
