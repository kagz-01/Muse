import React from 'react';
import { Sparkles } from 'lucide-react';

export default function InsightCard({ text }: { text: string }) {
  return (
    <div className="bg-[#1c1c1c] border border-white/5 rounded-2xl p-5 shadow-lg group hover:border-canvas-primary/30 transition-colors">
      <div className="flex gap-4 items-start">
        <div className="bg-canvas-primary/10 text-canvas-primary p-2 rounded-xl shrink-0">
          <Sparkles size={18} />
        </div>
        <p className="text-sm text-gray-300 leading-relaxed font-medium">{text}</p>
      </div>
    </div>
  );
}
