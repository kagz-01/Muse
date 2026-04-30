import { useState, useEffect } from "preact/hooks";
import { 
  Link2, Sparkles, RefreshCcw, Check, 
  ExternalLink, Globe, Layout, Image as ImageIcon, MessageSquare 
} from "lucide-preact";

interface ExtractedMetadata {
  title: string;
  source: string;
  type: 'Post' | 'Article' | 'Image' | 'Thread';
  summary: string;
  image?: string;
}

export default function ArtifactExtractor({ onExtract }: { onExtract: (meta: ExtractedMetadata) => void }) {
  const [url, setUrl] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [step, setStep] = useState<number>(0);
  const [metadata, setMetadata] = useState<ExtractedMetadata | null>(null);

  const simulateExtraction = () => {
    if (!url.trim()) return;
    setIsExtracting(true);
    setStep(1);

    // Simulation steps
    setTimeout(() => setStep(2), 800);
    setTimeout(() => setStep(3), 1600);
    setTimeout(() => {
      const meta: ExtractedMetadata = {
        title: url.includes('x.com') ? "The Future of Digital Sovereignty" : "Aesthetic Brutalism in Modern Web",
        source: url.includes('x.com') ? "X (Twitter)" : "Instagram",
        type: url.includes('x.com') ? 'Post' : 'Image',
        summary: "An exploration into how decentralized protocols are reshaping user agency in the 2026 landscape.",
        image: "https://images.unsplash.com/photo-1518005020250-58003994bf3b?auto=format&fit=crop&w=1200&q=80"
      };
      setMetadata(meta);
      setIsExtracting(false);
      setStep(4);
    }, 2400);
  };

  const handleReset = () => {
    setUrl('');
    setMetadata(null);
    setStep(0);
  };

  return (
    <div className="bg-[#111318] border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 h-full w-1/3 bg-canvas-primary/5 blur-[100px] pointer-events-none" />
      
      {!metadata ? (
        <div className="space-y-8 relative z-10">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-500 flex items-center gap-3">
               <Link2 size={14} className="text-canvas-primary" /> Hyperlink Extraction Terminal
            </h3>
            {isExtracting && (
              <div className="flex items-center gap-3">
                <RefreshCcw size={14} className="text-canvas-primary animate-spin" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-canvas-primary animate-pulse">Scanning Signal...</span>
              </div>
            )}
          </div>

          <div className="relative">
            <input 
              value={url}
              onInput={(e) => setUrl((e.target as HTMLInputElement).value)}
              placeholder="Paste social signal (X, Instagram, Web)..."
              disabled={isExtracting}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-6 text-xl text-white placeholder-gray-700 focus:outline-none focus:border-canvas-primary/40 focus:bg-white/[0.08] transition-all font-serif italic outline-none"
            />
            {!isExtracting && (
              <button 
                onClick={simulateExtraction}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white text-black rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl"
              >
                <Sparkles size={20} />
              </button>
            )}
          </div>

          {isExtracting && (
            <div className="space-y-4">
              {[
                { label: 'Establishing connection to source node...', active: step >= 1 },
                { label: 'Bypassing algorithm noise...', active: step >= 2 },
                { label: 'Extracting semantic metadata...', active: step >= 3 }
              ].map((s, i) => (
                <div key={i} className={`flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest transition-all duration-500 ${s.active ? 'text-white' : 'text-gray-700'}`}>
                  {s.active ? <Check size={12} className="text-emerald-500" /> : <div className="w-3 h-3 rounded-full border border-gray-800" />}
                  {s.label}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="relative z-10 animate-in fade-in zoom-in-95 duration-500">
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                 <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-[9px] font-bold uppercase tracking-widest text-emerald-500">Extraction Complete</div>
                 <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Provenance Verified</span>
              </div>
              <button onClick={handleReset} className="text-[9px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Discard Signal</button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
              <div className="md:col-span-4 aspect-square rounded-3xl overflow-hidden border border-white/5">
                 <img src={metadata.image} className="w-full h-full object-cover" alt="" />
              </div>
              <div className="md:col-span-8 flex flex-col justify-center">
                 <div className="flex items-center gap-3 mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-canvas-primary">{metadata.source}</span>
                    <div className="w-1 h-1 rounded-full bg-gray-700" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{metadata.type}</span>
                 </div>
                 <h4 className="text-3xl font-bold text-white mb-6 tracking-tight leading-tight">{metadata.title}</h4>
                 <p className="text-lg text-gray-400 font-serif italic leading-relaxed border-l-4 border-white/10 pl-8">{metadata.summary}</p>
                 
                 <div className="mt-10 flex gap-4">
                    <button 
                      onClick={() => onExtract(metadata)}
                      className="px-10 py-4 bg-white text-black font-bold uppercase tracking-widest text-[11px] rounded-2xl hover:-translate-y-1 transition-all shadow-xl cursor-pointer"
                    >
                      Collect to Room
                    </button>
                    <button className="px-10 py-4 bg-white/5 border border-white/10 text-white font-bold uppercase tracking-widest text-[11px] rounded-2xl hover:bg-white/10 transition-all cursor-pointer">
                      Open Original
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}
