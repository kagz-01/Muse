import { useState, useEffect } from 'react';
import { useUserStore } from '../../store/useUserStore';
import { Send, Leaf, Sparkles, HelpCircle } from 'lucide-react';
import type { DialogueTone } from '../../store/useConnectionsStore';

const ROTATING_PROMPTS = [
  "How does this connect to your experience?",
  "What perspective would you like to add?",
  "Is there a deeper theme we are missing?",
  "How does this challenge your current thinking?",
  "What would 'Future You' say about this dialogue?"
];

export default function ThoughtfulComposer({ onSubmit, initialText = '' }: { onSubmit: (text: string, tone: DialogueTone) => void, initialText?: string }) {
  const user = useUserStore(state => state.user);
  const [text, setText] = useState(initialText);
  const [mode, setMode] = useState<DialogueTone>('Reflect');
  const [promptIndex, setPromptIndex] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setPromptIndex(prev => (prev + 1) % ROTATING_PROMPTS.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  if (!user) return null;

  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit(text.trim(), mode);
      setText('');
    }
  };

  return (
    <div className="bg-linear-to-b from-[#1c1c1c] to-canvas-bg-dark border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden transition-all duration-500">
      
      {/* Dynamic Glow */}
      <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full blur-[100px] pointer-events-none transition-colors duration-1000 opacity-20" 
           style={{ 
             backgroundColor: 
               mode === 'Ask' ? '#f59e0b' : 
               mode === 'Build' ? '#10b981' : 
               '#6366f1' 
           }}>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="relative">
             <img src={user.avatarUrl} alt="" className="w-10 h-10 rounded-2xl object-cover border border-white/10 shadow-lg" />
             <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#1c1c1c]" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Perspective Mode</p>
            <div className="flex bg-white/5 border border-white/10 rounded-xl p-1">
               {(['Reflect', 'Build', 'Ask'] as DialogueTone[]).map(m => (
                 <button 
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${mode === m ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
                 >
                   {m}
                 </button>
               ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-2xl h-fit">
           {mode === 'Reflect' && <Leaf size={14} className="text-indigo-400" />}
           {mode === 'Build' && <Sparkles size={14} className="text-emerald-400" />}
           {mode === 'Ask' && <HelpCircle size={14} className="text-amber-400" />}
           <p className="text-xs font-serif italic text-white/70">{ROTATING_PROMPTS[promptIndex]}</p>
        </div>
      </div>

      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            handleSubmit();
          }
        }}
        placeholder={
          mode === 'Reflect' ? "Share how this resonates with your internal landscape..." :
          mode === 'Build' ? "Add a structural layer to this idea..." :
          "What question would deepen this communal understanding?"
        }
        className="w-full bg-transparent text-xl md:text-2xl font-serif text-white placeholder-gray-700 focus:outline-none resize-none min-h-[140px] relative z-10 leading-relaxed active:placeholder-gray-600 transition-all"
      />

      <div className="flex items-center justify-between mt-6 pt-8 border-t border-white/5 relative z-10">
        <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">
           Press <span className="text-gray-400">Cmd + Enter</span> to publish
        </p>
        
        <button 
          onClick={handleSubmit}
          disabled={!text.trim()}
          className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest disabled:opacity-30 disabled:grayscale transition-all hover:-translate-y-1 active:scale-95 shadow-2xl cursor-pointer ${
            mode === 'Reflect' ? 'bg-indigo-600 text-white hover:bg-indigo-500' :
            mode === 'Build' ? 'bg-emerald-600 text-white hover:bg-emerald-500' :
            'bg-amber-600 text-white hover:bg-amber-500'
          }`}
        >
          {mode === 'Ask' ? 'Deliver Inquiry' : mode === 'Build' ? 'Add Perspective' : 'Publish Reflection'} 
          <Send size={14} className="ml-1" />
        </button>
      </div>
    </div>
  );
}
