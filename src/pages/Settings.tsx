import React, { useRef, useState } from 'react';
import { Shield, Upload, Plus, Trash2, Camera, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { useUserStore } from '../store/useUserStore';
import { useRoomsStore } from '../store/useRoomsStore';

export default function Settings() {
  const { user, soloMode, updateProfile, addLink, removeLink } = useUserStore();
  const rooms = useRoomsStore(state => state.rooms);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  const activeRooms = rooms.slice().sort((a, b) => b.count - a.count).slice(0, 3);

  const calculateAge = (birthDateString?: string) => {
    if (!birthDateString) return null;
    const today = new Date();
    const birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };
  const userAge = calculateAge(user?.birthDate);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateProfile({ avatarUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddLink = (e: React.FormEvent) => {
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

  if (!user) return null;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto pb-24 md:pb-10 min-h-full font-sans transition-all duration-500 flex flex-col items-center">
      
      {!isEditing ? (
        <div className="w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-500 mt-2 md:mt-8">
          <div className="mb-8 text-center max-w-lg">
             <h2 className="text-3xl font-bold tracking-tight text-white mb-3">Live Portrait</h2>
             <p className="text-gray-400 font-serif italic text-lg leading-relaxed px-4">This is the exact digital replica of how your identity is rendered globally across the Muse network.</p>
          </div>
          
          <div className="w-full max-w-sm perspective-[1200px]">
             {/* The Trading Card */}
             <div className="bg-linear-to-b from-[#1c1c1c] to-[#0a0a0a] rounded-[2rem] border border-white/10 overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.6)] transform-gpu transition-all duration-500 hover:rotate-y-[2deg] hover:rotate-x-[2deg] hover:-translate-y-2 relative">
               
               {/* Cover Image / Gradient */}
               <div className="h-32 bg-linear-to-r from-canvas-primary/20 via-purple-500/10 to-transparent relative border-b border-white/5 flex justify-center">
                  {soloMode && (
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-xl border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-semibold text-gray-300 shadow-lg z-20">
                      <Shield size={12} className="text-canvas-primary" /> Solo Mode
                    </div>
                  )}

                  <div className="absolute -bottom-10 w-20 h-20 rounded-full bg-[#0a0a0a] border-[3px] border-[#0a0a0a] overflow-hidden shadow-2xl flex items-center justify-center text-3xl font-serif text-gray-500 z-10">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      user.name.charAt(0)
                    )}
                 </div>
               </div>

               {/* Profile Info */}
               <div className="px-8 pb-10 relative mt-16 text-center">
                 <h2 className="text-2xl font-bold tracking-tight text-white mb-1">{user.name}</h2>
                 <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
                   <span className="font-mono text-canvas-primary">{user.username}</span>
                   {(userAge !== null || user.gender) && <span>•</span>}
                   {user.gender && <span className="capitalize">{user.gender}</span>}
                   {userAge !== null && <span>{userAge} yrs</span>}
                 </div>

                 {/* Top Rooms */}
                 <div className="mt-8 flex flex-col items-center">
                   <h4 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-canvas-primary animate-pulse"></span>
                      Dominant Realms
                   </h4>
                   <div className="flex flex-wrap justify-center gap-2">
                     {activeRooms.map(room => (
                       <div key={room.id} className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300">
                         {room.name}
                       </div>
                     ))}
                   </div>
                 </div>

                 {/* Social Links */}
                 <div className="mt-8 space-y-2">
                   {(user.links || []).length > 0 ? (
                     (user.links || []).map(link => (
                       <a 
                         key={link.id} 
                         href={link.url} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all group"
                       >
                         <span className="text-sm font-semibold text-white/90 group-hover:text-canvas-primary transition-colors truncate">{link.title}</span>
                         <ExternalLink size={14} className="text-gray-500 group-hover:text-canvas-primary transition-colors transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 duration-200 shrink-0" />
                       </a>
                     ))
                   ) : (
                     <div className="text-xs text-gray-600 italic font-serif flex items-center justify-center h-12 border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
                        No external links mapped yet
                     </div>
                   )}
                 </div>
                 
               </div>
             </div>
          </div>

          <button 
             onClick={() => setIsEditing(true)}
             className="mt-12 px-10 py-4 bg-white text-black font-bold uppercase tracking-widest text-sm rounded-full shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:-translate-y-1 transition-all active:scale-95 cursor-pointer"
          >
             Edit Profile
          </button>
        </div>
      ) : (
        <div className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">Editor</h2>
              <p className="text-gray-400">Manage your foundational identity blocks.</p>
            </div>
            <button 
               onClick={() => setIsEditing(false)}
               className="px-8 py-3 bg-canvas-primary text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/20 transition-all hover:-translate-y-0.5 cursor-pointer"
            >
               Save & Preview
            </button>
          </header>
          
          <div className="space-y-10 pb-10">
            <div className="bg-[#1c1c1c] p-6 rounded-2xl border border-white/5 shadow-lg space-y-8">
              <div className="flex items-center gap-6">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 rounded-full bg-[#0a0a0a] border border-white/10 flex items-center justify-center cursor-pointer hover:border-canvas-primary/50 transition-colors overflow-hidden relative group shadow-inner shrink-0"
                >
                  {user.avatarUrl ? (
                    <>
                      <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera size={24} className="text-white" />
                      </div>
                    </>
                  ) : (
                    <Upload size={24} className="text-gray-500 group-hover:text-canvas-primary transition-colors" />
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
                  <h3 className="text-lg font-semibold tracking-tight mb-1">Avatar</h3>
                  <p className="text-xs text-gray-500">Upload a square image. Base64 conversion guarantees immediate MVP rendering.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400 pl-1">Display Name</label>
                  <input 
                    type="text" 
                    value={user.name}
                    onChange={(e) => updateProfile({ name: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-canvas-primary transition-colors text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400 pl-1">Handle</label>
                  <input 
                    type="text" 
                    value={user.username}
                    onChange={(e) => updateProfile({ username: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-canvas-primary transition-colors text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400 pl-1">Birth Date (Optional)</label>
                  <input 
                    type="date" 
                    value={user.birthDate || ''}
                    onChange={(e) => updateProfile({ birthDate: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-canvas-primary transition-colors text-white"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400 pl-1">Gender (Optional)</label>
                  <input 
                    type="text" 
                    value={user.gender || ''}
                    onChange={(e) => updateProfile({ gender: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-canvas-primary transition-colors text-white"
                  />
                </div>
              </div>
            </div>

            {/* Dynamic Links Manager */}
            <div className="bg-[#1c1c1c] p-6 rounded-2xl border border-white/5 shadow-lg space-y-6">
              <div>
                <h3 className="text-lg font-semibold tracking-tight">External Realms</h3>
                <p className="text-sm text-gray-400 mt-1">Connect your other social identities or portfolios to your Portrait.</p>
              </div>

              <div className="space-y-3">
                {(user.links || []).map(link => (
                  <div key={link.id} className="flex items-center justify-between p-4 bg-[#0a0a0a] border border-white/5 rounded-xl group hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <LinkIcon size={16} className="text-gray-500 shrink-0 group-hover:text-canvas-primary transition-colors" />
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-white truncate leading-tight">{link.title}</p>
                        <p className="text-xs text-gray-500 truncate mt-0.5 font-mono">{link.url}</p>
                      </div>
                    </div>
                    <button onClick={() => removeLink(link.id)} className="p-2 text-gray-500 hover:text-red-400 transition-colors shrink-0 outline-none">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex flex-col md:flex-row gap-3 pt-6 border-t border-white/5">
                <input 
                  type="text" 
                  placeholder="Platform (e.g. LinkedIn)" 
                  value={newLinkTitle}
                  onChange={e => setNewLinkTitle(e.target.value)}
                  className="w-full md:w-1/3 bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-canvas-primary transition-colors text-white"
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddLink(e); }}
                />
                <input 
                  type="text" 
                  placeholder="https://..." 
                  value={newLinkUrl}
                  onChange={e => setNewLinkUrl(e.target.value)}
                  className="w-full md:flex-1 bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-canvas-primary transition-colors text-white"
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddLink(e); }}
                />
                <button 
                  onClick={handleAddLink}
                  disabled={!newLinkTitle.trim() || !newLinkUrl.trim()}
                  className="bg-white text-black hover:bg-gray-200 disabled:bg-white/10 disabled:text-gray-500 px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all disabled:shadow-none shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
                >
                  <Plus size={16} /> Add
                </button>
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
