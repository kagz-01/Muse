import { useRef, useState } from "preact/hooks";
import { 
  Shield, Upload, Plus, Trash2, Camera, 
  ExternalLink, MapPin, AlignLeft 
} from "lucide-preact";
import { 
  userSignal, soloModeSignal, updateProfile, 
  addLink, removeLink 
} from "../signals/user.ts";
import { roomsSignal } from "../signals/rooms.ts";
import PortraitCard from "./PortraitCard.tsx";

export default function Settings() {
  const user = userSignal.value;
  const soloMode = soloModeSignal.value;
  const rooms = roomsSignal.value;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  if (!user) return (
     <div className="min-h-screen flex items-center justify-center">
        <a href="/login" className="text-white underline">Please login</a>
     </div>
  );

  const activeRooms = rooms.slice().sort((a, b) => (b.itemIds?.length || 0) - (a.itemIds?.length || 0)).slice(0, 3);

  const handleImageUpload = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateProfile({ avatarUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddLink = (e: any) => {
    e.preventDefault();
    if (!newLinkTitle || !newLinkUrl) return;
    
    let finalUrl = newLinkUrl;
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = 'https://' + finalUrl;
    }

    addLink({ title: newLinkTitle, url: finalUrl });
    setNewLinkTitle('');
    setNewLinkUrl('');
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto pb-24 md:pb-10 min-h-screen flex flex-col items-center">
      
      {!isEditing ? (
        <div className="w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-500 mt-2 md:mt-8">
          <div className="mb-10 text-center max-w-lg">
             <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-indigo-400 mb-3">Persona Hub</h3>
             <h2 className="text-4xl font-bold tracking-tight text-white mb-4 italic font-serif">Live Portrait</h2>
             <p className="text-gray-400 font-serif italic text-lg leading-relaxed px-4">This is the exact digital replica of how your identity is rendered globally across the Muse network.</p>
          </div>
          
          <PortraitCard user={user} activeRooms={activeRooms} soloMode={soloMode} />

          <button 
             onClick={() => setIsEditing(true)}
             type="button"
             className="mt-12 px-10 py-5 bg-white text-black font-bold uppercase tracking-widest text-xs rounded-full shadow-[0_20px_40px_rgba(255,255,255,0.1)] hover:shadow-[0_30px_60px_rgba(255,255,255,0.25)] hover:-translate-y-1 transition-all active:scale-95 cursor-pointer"
          >
             Edit Persona Blocks
          </button>
        </div>
      ) : (
        <div className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
            <div>
              <h2 className="text-4xl font-bold tracking-tight mb-3 text-white">Editor</h2>
              <p className="text-gray-400 font-serif italic text-lg">Manage your foundational identity blocks.</p>
            </div>
            <button 
               onClick={() => setIsEditing(false)}
               type="button"
               className="px-10 py-4 bg-indigo-500 text-white font-bold uppercase tracking-widest text-[11px] rounded-2xl shadow-lg hover:shadow-indigo-500/30 transition-all hover:-translate-y-1 cursor-pointer"
            >
               Save & Preview
            </button>
          </header>
          
          <div className="space-y-10 pb-20">
            <div className="bg-[#111318] p-8 rounded-4xl border border-white/5 shadow-2xl space-y-10">
              <div className="flex items-center gap-8">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-28 h-28 rounded-full bg-black border border-white/10 flex items-center justify-center cursor-pointer hover:border-indigo-400/50 transition-all overflow-hidden relative group shadow-inner shrink-0"
                >
                  {user.avatarUrl ? (
                    <>
                      <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera size={28} className="text-white" />
                      </div>
                    </>
                  ) : (
                    <Upload size={28} className="text-gray-600 group-hover:text-indigo-400 transition-colors" />
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight mb-2 text-white">Primary Avatar</h3>
                  <p className="text-xs text-gray-500 font-serif italic leading-relaxed max-w-sm">Capture a unique visual. High-fidelity rendering scales across both list and detail views natively.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Full Display Name</label>
                  <input 
                    type="text" 
                    value={user.name}
                    onInput={(e) => updateProfile({ name: (e.target as HTMLInputElement).value })}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-indigo-400 transition-all text-white font-medium"
                    placeholder="E.g. Alex Rivera"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Global Handle</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-400 font-bold">@</span>
                    <input 
                      type="text" 
                      value={user.username.startsWith('@') ? user.username.slice(1) : user.username}
                      onInput={(e) => updateProfile({ username: '@' + (e.target as HTMLInputElement).value })}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl px-10 py-4 focus:outline-none focus:border-indigo-400 transition-all text-white font-mono"
                    />
                  </div>
                </div>
                
                <div className="space-y-3 md:col-span-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1 flex items-center gap-2">
                    <AlignLeft size={10} /> Thoughtful Bio
                  </label>
                  <textarea 
                    value={user.bio || ''}
                    onInput={(e) => updateProfile({ bio: (e.target as HTMLTextAreaElement).value })}
                    placeholder="What drives your curation flow?"
                    rows={3}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-indigo-400 transition-all text-white font-serif italic text-lg leading-relaxed placeholder-gray-800"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1 flex items-center gap-2">
                    <MapPin size={10} /> Current Location
                  </label>
                  <input 
                    type="text" 
                    value={user.location || ''}
                    onInput={(e) => updateProfile({ location: (e.target as HTMLInputElement).value })}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-indigo-400 transition-all text-white"
                    placeholder="Berlin / Digital Hub"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Birth Date</label>
                  <input 
                    type="date" 
                    value={user.birthDate || ''}
                    onInput={(e) => updateProfile({ birthDate: (e.target as HTMLInputElement).value })}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-indigo-400 transition-all text-white"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-[#111318] p-8 rounded-4xl border border-white/5 shadow-2xl space-y-8">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-white">External Realms</h3>
                <p className="text-sm text-gray-500 font-serif italic mt-1">Connect your other social identities or portfolios to your Portrait.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(user.links || []).map(link => (
                  <div key={link.id} className="flex items-center justify-between p-5 bg-[#0a0a0a] border border-white/5 rounded-2xl group hover:border-white/10 transition-all">
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-600 group-hover:text-indigo-400 transition-colors">
                        <ExternalLink size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-white truncate leading-tight tracking-wide">{link.title}</p>
                        <p className="text-[9px] text-gray-600 truncate mt-1 font-mono uppercase tracking-widest">{new URL(link.url).hostname}</p>
                      </div>
                    </div>
                    <button onClick={() => removeLink(link.id)} className="p-2 text-gray-600 hover:text-rose-400 transition-colors shrink-0 outline-none cursor-pointer">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex flex-col md:flex-row gap-3 pt-8 border-t border-white/5">
                <input 
                  type="text" 
                  placeholder="Platform Label" 
                  value={newLinkTitle}
                  onInput={e => setNewLinkTitle((e.target as HTMLInputElement).value)}
                  className="w-full md:w-1/3 bg-[#0a0a0a] border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-indigo-400 transition-all text-white font-medium"
                />
                <input 
                  type="text" 
                  placeholder="https://hub.com/username" 
                  value={newLinkUrl}
                  onInput={e => setNewLinkUrl((e.target as HTMLInputElement).value)}
                  className="w-full md:flex-1 bg-[#0a0a0a] border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-indigo-400 transition-all text-white font-medium"
                />
                <button 
                  onClick={handleAddLink}
                  type="button"
                  disabled={!newLinkTitle.trim() || !newLinkUrl.trim()}
                  className="bg-white text-black hover:bg-gray-200 disabled:bg-white/10 disabled:text-gray-500 px-8 py-4 rounded-2xl flex items-center justify-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] transition-all cursor-pointer"
                >
                  <Plus size={16} /> Add Link
                </button>
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
