import React, { useState } from 'react';
import { useUserStore } from '../../store/useUserStore';
import { Send, Leaf } from 'lucide-react';
import { Tone } from '../../store/useConnectionsStore';

export default function ThoughtfulComposer({ onSubmit }: { onSubmit: (text: string, tone: Tone) => void }) {
  const user = useUserStore(state => state.user);
  const [text, setText] = useState('');
  const [activeTone, setActiveTone] = useState<Tone>('Reflective');
  
  const tones: Tone[] = ['Reflective', 'Curious', 'Supportive', 'Collaborative', 'Respectful Tension'];

  if (!user) return null;

  return (
    <div className="bg-linear-to-b from-[#1c1c1c] to-[#0a0a0a] border border-white/10 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden transition-all duration-500">
      
      {/* Soft animated background glow based on tone selection */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-colors duration-700" 
           style={{ 
             backgroundColor: 
               activeTone === 'Curious' ? 'rgba(0, 229, 255, 0.05)' : 
               activeTone === 'Supportive' ? 'rgba(16, 185, 129, 0.06)' : 
               activeTone === 'Collaborative' ? 'rgba(251, 191, 36, 0.05)' :
               activeTone === 'Respectful Tension' ? 'rgba(249, 115, 22, 0.06)' :
               'rgba(108, 99, 255, 0.05)' 
           }}>
      </div>

      <div className="flex items-center gap-3 mb-5 relative z-10">
        <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover border border-white/10 shadow-sm" />
        <p className="text-sm font-medium text-gray-400 flex items-center gap-2 font-serif italic">
          How does this connect to your experience? <Leaf size={14} className="text-emerald-500/80" />
        </p>
      </div>

      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Transform a quick reaction into a thoughtful reflection..."
        className="w-full bg-transparent text-lg md:text-xl font-serif text-white placeholder-gray-600 focus:outline-none resize-none min-h-[110px] relative z-10 leading-relaxed"
      />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-2 pt-5 border-t border-white/5 relative z-10">
        <div className="flex flex-wrap gap-2">
          {tones.map(tone => (
             <button 
               key={tone}
               onClick={() => setActiveTone(tone)}
               className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${activeTone === tone ? 'bg-canvas-primary border-canvas-primary text-white shadow-lg' : 'bg-white/5 border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/10'} border`}
             >
               {tone}
             </button>
          ))}
        </div>
        
        <button 
          onClick={() => { if (text.trim()) { onSubmit(text.trim(), activeTone); setText(''); } }}
          disabled={!text.trim()}
          className="flex items-center gap-2 px-6 py-2.5 bg-white text-black rounded-full font-bold text-sm tracking-wide disabled:opacity-50 disabled:bg-white/20 disabled:text-gray-400 transition-all hover:bg-gray-200 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.15)] cursor-pointer w-full md:w-auto justify-center"
        >
          Publish <Send size={14} />
        </button>
      </div>
    </div>
  );
}
