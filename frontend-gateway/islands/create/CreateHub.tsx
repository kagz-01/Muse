import { useState } from "preact/hooks";
import { 
  Sparkles, BookOpen, Layers, Globe, 
  Music, Image as ImageIcon, 
  ArrowRight, Link2, Zap, Layout, Lock, X 
} from "lucide-preact";
import { roomsSignal } from "../../signals/rooms.ts";
import { addItem } from "../../signals/items.ts";
import { addEntry } from "../../signals/journal.ts";
import CreateRoomModal from "../modals/CreateRoomModal.tsx";
import CreateThreadModal from "../modals/CreateThreadModal.tsx";

export default function CreateHub() {
  const rooms = roomsSignal.value;
  const totalArtifacts = rooms.reduce((count, room) => count + room.count, 0);
  
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showCreateThread, setShowCreateThread] = useState(false);
  
  const [seedUrl, setSeedUrl] = useState('');
  const [seedRoomId, setSeedRoomId] = useState(rooms[0]?.id || '');
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);
  const [seedIsPublic, setSeedIsPublic] = useState(false);

  const handleQuickSeed = (e: Event) => {
    e.preventDefault();
    if (!seedUrl || !seedRoomId) return;

    setIsSeeding(true);
    
    // Simulate metadata fetch & add
    setTimeout(() => {
      addItem({
        roomId: seedRoomId,
        title: seedUrl.includes('http') ? new URL(seedUrl).hostname : 'Quick Note',
        sourceUrl: seedUrl.startsWith('http') ? seedUrl : `https://google.com/search?q=${encodeURIComponent(seedUrl)}`,
        note: `Quickly seeded from the Create Hub.`,
        isPublic: seedIsPublic
      });
      
      setIsSeeding(false);
      setSeedSuccess(true);
      setSeedUrl('');
      
      setTimeout(() => setSeedSuccess(false), 3000);
    }, 800);
  };

  const handleStartJournal = (isPublic: boolean = false) => {
    const entry = addEntry(undefined, isPublic);
    globalThis.location.href = `/journal/${entry.id}`;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col pb-24 md:pb-10 space-y-12">
      <div className="p-6 md:p-10 max-w-7xl mx-auto w-full space-y-12">
        {showCreateRoom && <CreateRoomModal onClose={() => setShowCreateRoom(false)} />}
        {showCreateThread && <CreateThreadModal onClose={() => setShowCreateThread(false)} />}

        <section className="relative overflow-hidden rounded-[3rem] border border-white/5 bg-[#0d0d0d] p-10 md:p-16 shadow-2xl">
          <div className="absolute top-0 right-0 h-full w-1/2 bg-linear-to-l from-emerald-500/10 to-transparent blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-400">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Synthesis Hub
              </div>
              <h1 className="mt-8 text-5xl md:text-7xl font-bold tracking-tight leading-[0.95] text-white">
                Transmute Thought 
                <span className="block italic font-serif text-emerald-400 bg-linear-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Into Form.</span>
              </h1>
              <p className="mt-8 max-w-2xl text-gray-400 text-lg md:text-xl leading-relaxed font-serif italic border-l-2 border-white/10 pl-6">
                Creation is the inevitable result of deep contemplation. Whether initializing a new space, weaving a thread, or seeding an artifact, every act here is intentional.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4 mb-2">
                 <div className="flex-1 px-5 py-3 bg-white/5 border border-white/10 rounded-2xl">
                    <p className="text-white font-bold text-lg leading-none">{rooms.length}</p>
                    <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-1">Active Rooms</p>
                 </div>
                 <div className="flex-1 px-5 py-3 bg-white/5 border border-white/10 rounded-2xl">
                    <p className="text-white font-bold text-lg leading-none">{totalArtifacts}</p>
                    <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-1">Total Artifacts</p>
                 </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="relative group">
            <div className="absolute inset-x-0 -bottom-2 h-1 bg-indigo-500/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            <form 
              onSubmit={handleQuickSeed}
              className="relative p-1 bg-white/[0.03] border border-white/10 group-focus-within:border-indigo-500/40 rounded-4xl flex flex-col md:flex-row items-center gap-2 transition-all duration-500 backdrop-blur-xl overflow-hidden"
            >
              <div className="flex-1 flex items-center pl-8 w-full">
                <Link2 size={24} className={seedUrl ? "text-indigo-400" : "text-gray-500"} />
                <input 
                  value={seedUrl}
                  onInput={e => setSeedUrl((e.target as HTMLInputElement).value)}
                  placeholder="Paste a URL or write a quick thought..."
                  className="w-full bg-transparent py-6 text-xl font-medium text-white placeholder-gray-700 focus:outline-none"
                />
              </div>

              <div className="w-full md:w-auto flex flex-row items-center gap-2 p-1.5 h-full relative z-30">
                <select 
                  value={seedRoomId}
                  onChange={e => setSeedRoomId((e.target as HTMLSelectElement).value)}
                  className="bg-white/5 border border-white/10 text-gray-400 text-[10px] font-bold uppercase tracking-widest px-5 py-4 rounded-3xl focus:outline-none focus:border-indigo-500/30 transition-all cursor-pointer appearance-none pr-10"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'rgba(156, 163, 175, 0.5)\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2rem' }}
                >
                  {rooms.map(room => (
                    <option key={room.id} value={room.id} className="bg-[#111]">{room.name}</option>
                  ))}
                </select>

                <button 
                  type="submit"
                  disabled={!seedUrl || isSeeding}
                  className={`px-8 py-4 rounded-3xl font-bold uppercase tracking-widest text-[10px] transition-all flex items-center gap-3 whitespace-nowrap cursor-pointer shadow-lg ${seedSuccess ? 'bg-emerald-500 text-white' : 'bg-white text-black hover:bg-indigo-500 hover:text-white active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed'}`}
                >
                  {isSeeding ? (
                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  ) : seedSuccess ? (
                    <>Success <Zap size={14} className="fill-white" /></>
                  ) : (
                    <>Seed Artifact <Sparkles size={14} className="text-indigo-400" /></>
                  )}
                </button>
              </div>
            </form>
          </div>
          <div className="mt-4 px-8 flex justify-between items-center">
             <div className="flex items-center gap-6">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Fast-capture any artifact into your permanent collection.</p>
                
                <div className="flex items-center gap-2 p-0.5 bg-white/5 rounded-full border border-white/5">
                   <button 
                     type="button"
                     onClick={() => setSeedIsPublic(false)}
                     className={`px-3 py-1.5 rounded-full flex items-center gap-2 transition-all cursor-pointer ${!seedIsPublic ? 'bg-white/10 text-white' : 'text-gray-600'}`}
                   >
                     <Lock size={10} />
                     <span className="text-[8px] font-bold uppercase tracking-widest">Solo</span>
                   </button>
                   <button 
                     type="button"
                     onClick={() => setSeedIsPublic(true)}
                     className={`px-3 py-1.5 rounded-full flex items-center gap-2 transition-all cursor-pointer ${seedIsPublic ? 'bg-indigo-500/20 text-indigo-400' : 'text-gray-600'}`}
                   >
                     <Globe size={10} />
                     <span className="text-[8px] font-bold uppercase tracking-widest">Public</span>
                   </button>
                </div>
             </div>
             
             <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-[9px] font-bold text-gray-700 uppercase tracking-widest leading-none">Scanning Engine Active</span>
             </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div 
            onClick={() => setShowCreateRoom(true)}
            className="group relative h-[400px] rounded-4xl overflow-hidden cursor-pointer border border-white/5 hover:border-indigo-500/40 transition-all duration-500 shadow-2xl"
          >
            <div className="absolute inset-0 bg-linear-to-b from-indigo-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="absolute inset-0 p-10 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-4xl flex items-center justify-center mb-8 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl">
                <Layout size={36} className="text-indigo-400" />
              </div>
              <h3 className="text-3xl font-bold mb-3 tracking-tight text-white">Expressive Room</h3>
              <p className="text-gray-400 font-serif italic mb-10 text-lg leading-relaxed px-4">
                Build a new cinematic container for a specific area of interest.
              </p>
              <div className="px-6 py-3 border border-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest text-white group-hover:bg-white group-hover:text-black transition-all">
                Choose Intent
              </div>
            </div>
          </div>

          <div 
            onClick={() => setShowCreateThread(true)}
            className="group relative h-[400px] rounded-4xl overflow-hidden cursor-pointer border border-white/5 hover:border-violet-600/40 transition-all duration-500 shadow-2xl"
          >
            <div className="absolute inset-0 bg-linear-to-b from-violet-600/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="absolute inset-0 p-10 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-4xl flex items-center justify-center mb-8 transform group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 shadow-xl">
                <Layers size={36} className="text-violet-400" />
              </div>
              <h3 className="text-3xl font-bold mb-3 tracking-tight text-white">Thematic Thread</h3>
              <p className="text-gray-400 font-serif italic mb-10 text-lg leading-relaxed px-4">
                Synthesize existing artifacts into a structured intellectual output.
              </p>
              <div className="px-6 py-3 border border-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest text-white group-hover:bg-white group-hover:text-black transition-all">
                Synthesize
              </div>
            </div>
          </div>

          <div 
            onClick={() => handleStartJournal(false)}
            className="group relative h-[400px] rounded-4xl overflow-hidden cursor-pointer border border-white/5 hover:border-white/30 transition-all duration-500 shadow-2xl"
          >
            <div className="absolute inset-0 bg-linear-to-b from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="absolute inset-0 p-10 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-4xl flex items-center justify-center mb-8 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-xl">
                <BookOpen size={36} className="text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-3 tracking-tight text-white">Introspective Entry</h3>
              <p className="text-gray-400 font-serif italic mb-6 text-lg leading-relaxed px-4">
                Dive into a raw writing flow. Private, dated, and moody.
              </p>
              
              <div className="flex gap-2 mb-6" onClick={(e) => e.stopPropagation()}>
                <button 
                  onClick={() => handleStartJournal(false)}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[9px] font-bold uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 cursor-pointer"
                  type="button"
                >
                  <Lock size={12} /> Solo
                </button>
                <button 
                  onClick={() => handleStartJournal(true)}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[9px] font-bold uppercase tracking-widest text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all flex items-center gap-2 cursor-pointer"
                  type="button"
                >
                  <Globe size={12} /> Public
                </button>
              </div>

              <div className="px-6 py-3 border border-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest text-white group-hover:bg-white group-hover:text-black transition-all">
                Start Writing
              </div>
            </div>
          </div>
        </div>

        <section>
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Synthesis & Output</h2>
            <div className="h-px bg-white/5 flex-1" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-white/20 transition-all cursor-pointer group shadow-lg">
              <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl mb-6 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                <ImageIcon size={20} className="text-gray-400" />
              </div>
              <h4 className="text-xl font-bold mb-2 text-white">Mood Board Engine</h4>
              <p className="text-sm text-gray-500 mb-8 leading-relaxed font-serif italic">Turn a Room or Thread into a high-fidelity visual grid for export.</p>
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors flex items-center gap-2">
                Launch Explorer <ArrowRight size={12} />
              </div>
            </div>
            
            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-white/20 transition-all cursor-pointer group shadow-lg">
              <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl mb-6 flex items-center justify-center group-hover:bg-[#1DB954]/20 transition-colors">
                <Music size={20} className="text-gray-400 group-hover:text-[#1DB954]" />
              </div>
              <h4 className="text-xl font-bold mb-2 text-white">Atmospheric Exports</h4>
              <p className="text-sm text-gray-500 mb-8 leading-relaxed font-serif italic">Sync Room soundtracks directly into Spotify or Apple Music playlists.</p>
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors flex items-center gap-2">
                Connect API <ArrowRight size={12} />
              </div>
            </div>
            
            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-white/20 transition-all cursor-pointer group shadow-lg">
              <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl mb-6 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                <Globe size={20} className="text-gray-400 group-hover:text-indigo-400" />
              </div>
              <h4 className="text-xl font-bold mb-2 text-white">Portrait Preview</h4>
              <p className="text-sm text-gray-500 mb-8 leading-relaxed font-serif italic">Render your public persona. Curate what the world sees of your collection.</p>
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors flex items-center gap-2">
                View Persona <ArrowRight size={12} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
