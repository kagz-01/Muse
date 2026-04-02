import { 
  X, Globe, Eye, EyeOff, ShieldCheck, Check 
} from "lucide-preact";
import { userSignal, togglePublicSetting, User } from "../signals/user.ts";

interface PrivacyManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyManager({ isOpen, onClose }: PrivacyManagerProps) {
  const user = userSignal.value;
  if (!user || !isOpen) return null;

  const settings = [
    { key: 'showProfile', label: 'Public Profile', desc: 'Allow others to see your name, bio, and avatar.' },
    { key: 'showLocation', label: 'Display Location', desc: 'Show your current city/digital coordinate.' },
    { key: 'showRooms', label: 'Shared Rooms', desc: 'List your public rooms on your community portrait.' },
    { key: 'showThreads', label: 'Active Dialogue', desc: 'Show your participation in community circles.' },
    { key: 'showInsights', label: 'Resonance Metrics', desc: 'Share your thematic resonance and connection stats.' },
  ] as const;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-canvas-bg-dark/90 backdrop-blur-3xl" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-[#111111] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
        {/* Glow Base */}
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-emerald-500/40 to-transparent" />

        <div className="flex justify-between items-start mb-10">
           <div>
              <div className="flex items-center gap-2 mb-2">
                 <Globe size={14} className="text-emerald-500" />
                 <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Community Permissions</span>
              </div>
              <h2 className="text-3xl font-bold text-white tracking-tight">Privacy Manager</h2>
           </div>
           <button type="button" onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-500 hover:text-white transition-all cursor-pointer">
             <X size={20} />
           </button>
        </div>

        <div className="space-y-6">
           {settings.map((s) => {
             const isActive = user.publicSettings[s.key as keyof User['publicSettings']];
             return (
               <div key={s.key} className="flex items-center justify-between group">
                  <div className="flex-1 pr-6">
                     <div className="flex items-center gap-3 mb-1">
                        <p className="text-sm font-bold text-white uppercase tracking-tight">{s.label}</p>
                        {isActive ? <Eye size={12} className="text-emerald-500" /> : <EyeOff size={12} className="text-gray-600" />}
                     </div>
                     <p className="text-[11px] text-gray-500 font-serif italic">{s.desc}</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => togglePublicSetting(s.key as keyof User['publicSettings'])}
                    className={`w-14 h-8 rounded-full flex items-center px-1 transition-all duration-500 cursor-pointer ${isActive ? 'bg-emerald-600' : 'bg-gray-800'}`}
                  >
                     <div 
                       className={`w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-lg transition-transform duration-500 ${isActive ? 'translate-x-6' : 'translate-x-0'}`}
                     >
                        {isActive && <Check size={12} className="text-emerald-600" />}
                     </div>
                  </button>
               </div>
             );
           })}
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col gap-4">
           <div className="flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
              <ShieldCheck size={18} className="text-emerald-500 shrink-0" />
              <p className="text-[10px] text-emerald-500/70 font-bold uppercase tracking-widest leading-relaxed">
                Changes are applied instantly to your public portrait.
              </p>
           </div>
           <button 
            onClick={onClose}
            className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest text-[11px] rounded-2xl hover:bg-emerald-500 hover:text-white transition-all active:scale-95 cursor-pointer"
           >
             Acknowledge & Close
           </button>
        </div>
      </div>
    </div>
  );
}
