import { useState, useMemo } from "preact/hooks";
import { 
  Sparkles, MessageSquare, Layers, GitCommit, ArrowRight, Check,
  BookOpen, Hash, Activity, Send
} from "lucide-preact";
import { roomsSignal } from "../../signals/rooms.ts";
import { threadsSignal } from "../../signals/threads.ts";
import { journalSignal, addJournalEntry } from "../../signals/journal.ts";

export default function JournalTerminal() {
  const rooms = roomsSignal.value;
  const threads = threadsSignal.value;
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [activeSources, setActiveSources] = useState<string[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);

  const toggleSource = (id: string) => {
    setActiveSources(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleCapture = () => {
    if (!content.trim()) return;
    setIsCapturing(true);
    
    // Simulate AI analysis and capture
    setTimeout(() => {
      addJournalEntry({
        title: title || 'Untitled Contemplation',
        content,
        sourceIds: activeSources,
        isReflectionOnly: activeSources.length === 0,
        sentiment: 'analytical'
      });
      setTitle('');
      setContent('');
      setActiveSources([]);
      setIsCapturing(false);
    }, 1500);
  };

  return (
    <div className="bg-[#111318] border border-white/10 rounded-[3rem] p-10 md:p-16 relative overflow-hidden shadow-3xl">
      <div className="absolute top-0 right-0 h-full w-1/3 bg-canvas-primary/5 blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 space-y-10">
         <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-500 flex items-center gap-3">
               <BookOpen size={14} className="text-canvas-primary" /> Contemplation Terminal
            </h3>
            {isCapturing && (
              <div className="flex items-center gap-3">
                 <Activity size={14} className="text-canvas-primary animate-pulse" />
                 <span className="text-[9px] font-bold uppercase tracking-widest text-canvas-primary">Syncing Cognition...</span>
              </div>
            )}
         </div>

         <div className="space-y-6">
            <input 
              value={title}
              onInput={(e) => setTitle((e.target as HTMLInputElement).value)}
              placeholder="Thesis Title (Optional)"
              className="w-full bg-transparent border-b border-white/10 py-4 text-3xl font-bold text-white placeholder-gray-800 focus:outline-none focus:border-canvas-primary/40 transition-all outline-none"
            />
            <textarea 
              value={content}
              onInput={(e) => setContent((e.target as HTMLTextAreaElement).value)}
              placeholder="Contemplate the patterns. What is emerging from your collection?"
              className="w-full bg-white/[0.03] border border-white/10 rounded-3xl p-10 text-xl text-white placeholder-gray-700 focus:outline-none focus:border-canvas-primary/40 focus:bg-white/[0.05] transition-all min-h-[300px] font-serif italic outline-none resize-none"
            />
         </div>

         <div className="space-y-6">
            <h4 className="text-[9px] font-bold uppercase tracking-widest text-gray-600">Contextual Anchors</h4>
            <div className="flex flex-wrap gap-3">
               {rooms.map(room => (
                 <button 
                   key={room.id}
                   onClick={() => toggleSource(room.id)}
                   className={`px-6 py-2.5 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all ${activeSources.includes(room.id) ? 'bg-canvas-primary text-white border-canvas-primary shadow-xl scale-105' : 'bg-white/5 border-white/5 text-gray-500 hover:text-white'}`}
                 >
                    <Hash size={12} className="inline mr-2" /> {room.name}
                 </button>
               ))}
               {threads.map(thread => (
                 <button 
                   key={thread.id}
                   onClick={() => toggleSource(thread.id)}
                   className={`px-6 py-2.5 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all ${activeSources.includes(thread.id) ? 'bg-emerald-500 text-white border-emerald-500 shadow-xl scale-105' : 'bg-white/5 border-white/5 text-gray-500 hover:text-white'}`}
                 >
                    <GitCommit size={12} className="inline mr-2" /> {thread.title}
                 </button>
               ))}
            </div>
         </div>

         <div className="flex items-center gap-6 pt-6 border-t border-white/5">
            <div className="flex-1">
               <p className="text-xs text-gray-500 font-serif italic leading-relaxed">
                  "Your reflection will be stored as a sovereign artifact, ready to be woven into the collective synthesis."
               </p>
            </div>
            <button 
              onClick={handleCapture}
              disabled={!content.trim() || isCapturing}
              className="px-12 py-5 bg-white text-black font-bold uppercase tracking-widest text-[11px] rounded-2xl shadow-xl hover:-translate-y-1 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-30"
            >
               <Send size={16} /> Capture Contemplation
            </button>
         </div>
      </div>

    </div>
  );
}
