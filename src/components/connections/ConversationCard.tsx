import React from 'react';
import { Sparkles, MessageCircle, Heart, Share2, Layers } from 'lucide-react';
import { CommentNode } from '../../store/useConnectionsStore';

const toneColors: Record<string, string> = {
  'Reflective': 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  'Supportive': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  'Curious': 'text-[#00E5FF] bg-[#00E5FF]/10 border-[#00E5FF]/20',
  'Collaborative': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  'Appreciative': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  'Sensitive': 'text-pink-400 bg-pink-500/10 border-pink-500/20',
  'Respectful Tension': 'text-orange-400 bg-orange-500/10 border-orange-500/20',
};

export default function ConversationCard({ comment }: { comment: CommentNode }) {
  const toneStyle = toneColors[comment.tone] || toneColors['Reflective'];

  return (
    <div className="bg-[#1c1c1c]/80 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 shadow-xl w-full group hover:border-white/10 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <img src={comment.authorAvatar} alt={comment.authorName} className="w-10 h-10 rounded-full object-cover shadow-sm border border-white/10" />
          <div>
            <h4 className="font-bold text-white text-sm">{comment.authorName}</h4>
            <p className="text-xs text-gray-500 font-medium">{comment.timestamp}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full border text-[10px] font-bold tracking-widest uppercase flex items-center gap-1.5 ${toneStyle}`}>
          <Sparkles size={12} />
          {comment.tone}
        </div>
      </div>
      
      <p className="text-gray-300 font-serif text-lg leading-relaxed mb-6 pl-1 pr-4">
        "{comment.content}"
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {comment.themes.map(theme => (
          <span key={theme} className="text-[10px] uppercase tracking-widest bg-[#0a0a0a] text-gray-500 px-2.5 py-1.5 rounded-lg font-bold border border-white/5">
            {theme}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/5">
        <button className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-xs font-semibold text-gray-300 hover:text-white transition-colors cursor-pointer">
          <MessageCircle size={14} /> Reflect
        </button>
        <button className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-xs font-semibold text-gray-300 hover:text-white transition-colors cursor-pointer">
          <Heart size={14} /> Appreciate
        </button>
        <button className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-xs font-semibold text-canvas-primary hover:text-indigo-400 transition-colors md:ml-auto shadow-sm cursor-pointer border border-canvas-primary/20 hover:border-canvas-primary/40">
          <Share2 size={14} /> Build Together
        </button>
        <button className="flex items-center gap-1.5 px-3 py-2 bg-[#0a0a0a] hover:bg-white/10 rounded-full text-xs font-semibold text-gray-500 hover:text-white transition-colors cursor-pointer border border-white/5">
          <Layers size={14} /> Pod
        </button>
      </div>
    </div>
  );
}
