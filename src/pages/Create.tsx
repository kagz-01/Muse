import React from 'react';

export default function Create() {
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto pb-24 md:pb-10 min-h-full">
      <header className="mb-10">
        <h2 className="text-3xl font-bold tracking-tight mb-2">Create & Export</h2>
        <p className="text-gray-400">Turn your collections into tangible outputs.</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-8 bg-[#1c1c1c] rounded-3xl border border-white/5 hover:border-canvas-primary/50 transition-colors cursor-pointer group shadow-lg">
          <div className="w-12 h-12 bg-white/10 rounded-xl mb-6"></div>
          <h3 className="text-2xl font-semibold mb-3 tracking-tight">Mood Board</h3>
          <p className="text-sm text-gray-400 mb-8 leading-relaxed">Generate a visual grid from a room or thread to download or share.</p>
          <button className="px-5 py-3 bg-white/5 group-hover:bg-canvas-primary group-hover:text-white text-gray-300 transition-colors rounded-xl font-medium w-full">Generate</button>
        </div>
        
        <div className="p-8 bg-[#1c1c1c] rounded-3xl border border-white/5 hover:border-canvas-primary/50 transition-colors cursor-pointer group shadow-lg">
          <div className="w-12 h-12 bg-white/10 rounded-xl mb-6"></div>
          <h3 className="text-2xl font-semibold mb-3 tracking-tight">Playlist Export</h3>
          <p className="text-sm text-gray-400 mb-8 leading-relaxed">Compile music items into a Spotify or Apple Music playlist seamlessly.</p>
          <button className="px-5 py-3 bg-white/5 group-hover:bg-[#1DB954] group-hover:text-white text-gray-300 transition-colors rounded-xl font-medium w-full">Connect Spotify</button>
        </div>
        
        <div className="p-8 bg-[#1c1c1c] rounded-3xl border border-white/5 hover:border-canvas-primary/50 transition-colors cursor-pointer group shadow-lg">
          <div className="w-12 h-12 bg-white/10 rounded-xl mb-6"></div>
          <h3 className="text-2xl font-semibold mb-3 tracking-tight">Public Portrait</h3>
          <p className="text-sm text-gray-400 mb-8 leading-relaxed">Create a curated public persona showing your top rooms and themes.</p>
          <button className="px-5 py-3 bg-white/5 group-hover:bg-canvas-primary group-hover:text-white text-gray-300 transition-colors rounded-xl font-medium w-full">Preview Portrait</button>
        </div>
      </div>
    </div>
  );
}
