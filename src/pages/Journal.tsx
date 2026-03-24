import React, { useState, useEffect } from 'react';
import { useJournalStore } from '../store/useJournalStore';
import { useItemsStore } from '../store/useItemsStore';
import { BookOpen, Save } from 'lucide-react';

export default function Journal() {
  const { content, setContent, saveContent, lastSaved } = useJournalStore();
  const items = useItemsStore(state => state.items);
  const [localContent, setLocalContent] = useState(content);

  // Auto-save debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localContent !== content) {
        setContent(localContent);
        saveContent();
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [localContent, content, setContent, saveContent]);

  return (
    <div className="flex flex-col md:flex-row h-full w-full pb-16 md:pb-0 overflow-hidden bg-canvas-bg-dark font-sans shadow-inner">
      {/* Left Panel: Items Reference */}
      <div className="w-full md:w-1/3 xl:w-1/4 bg-[#0a0a0a] border-r border-white/5 p-6 overflow-y-auto hidden md:block z-10 shadow-[5px_0_20px_rgba(0,0,0,0.5)]">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 tracking-tight">
          <BookOpen size={18} /> Library Cache
        </h3>
        <p className="text-xs text-gray-500 mb-8 leading-relaxed font-medium pr-5">Drag artifacts into the canvas to connect your thoughts materially.</p>
        
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="bg-white/5 p-4 rounded-xl border border-white/5 cursor-grab active:cursor-grabbing hover:bg-white/10 transition-colors shadow-sm group">
              <p className="font-semibold text-sm truncate mb-1 text-white/90 group-hover:text-canvas-primary transition-colors">{item.title}</p>
              <p className="text-[10px] text-gray-500 truncate font-mono">{new URL(item.sourceUrl).hostname}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel: The Canvas / Editor */}
      <div className="w-full md:w-2/3 xl:w-3/4 h-full flex flex-col bg-canvas-bg-dark relative">
        <header className="px-8 py-5 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md bg-canvas-bg-dark/80 border-b border-white/5">
           <h2 className="text-xl font-bold tracking-tight">Contemplation Canvas</h2>
           <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-gray-400 font-bold bg-white/5 px-4 py-2 rounded-full border border-white/5 shadow-sm">
             <Save size={12} className={localContent !== content ? "animate-pulse text-canvas-primary" : ""} />
             {lastSaved ? `Saved ${new Date(lastSaved).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : 'Unsaved'}
           </div>
        </header>
        <div className="flex-1 w-full overflow-y-auto px-6 py-10 md:px-16 lg:px-24 xl:px-32">
          <textarea 
            value={localContent}
            onChange={(e) => setLocalContent(e.target.value)}
            placeholder="What patterns are emerging? Start writing..."
            className="w-full min-h-[500px] h-full bg-transparent text-[#e5e5e5] resize-none outline-none leading-loose font-serif text-xl md:text-2xl placeholder-gray-700 focus:placeholder-gray-800 transition-colors"
            style={{ lineHeight: '1.9' }}
          />
        </div>
      </div>
    </div>
  );
}
