import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { 
  Plus, Sparkles, BookOpen, Layers, Globe, 
  Music, Image as ImageIcon, Lightbulb, 
  ArrowRight, Link2, Zap, Layout
} from 'lucide-react';
import { useRoomsStore } from '../store/useRoomsStore';
import { useItemsStore } from '../store/useItemsStore';
import { useJournalStore } from '../store/useJournalStore';
import CreateRoomModal from '../components/modals/CreateRoomModal';
import CreateThreadModal from '../components/modals/CreateThreadModal';

export default function Create() {
  const navigate = useNavigate();
  const rooms = useRoomsStore(state => state.rooms);
  const addItem = useItemsStore(state => state.addItem);
  const addJournalEntry = useJournalStore(state => state.addEntry);

  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showCreateThread, setShowCreateThread] = useState(false);
  
  // Quick Seed state
  const [seedUrl, setSeedUrl] = useState('');
  const [seedRoomId, setSeedRoomId] = useState(rooms[0]?.id || '');
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  const handleQuickSeed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!seedUrl || !seedRoomId) return;

    setIsSeeding(true);
    
    // Simulate metadata fetch & add
    setTimeout(() => {
      addItem({
        roomId: seedRoomId,
        title: seedUrl.includes('http') ? new URL(seedUrl).hostname : 'Quick Note',
        sourceUrl: seedUrl.startsWith('http') ? seedUrl : `https://google.com/search?q=${encodeURIComponent(seedUrl)}`,
        note: `Quickly seeded from the Create Hub.`
      });
      
      setIsSeeding(false);
      setSeedSuccess(true);
      setSeedUrl('');
      
      setTimeout(() => setSeedSuccess(false), 3000);
    }, 800);
  };

  const handleStartJournal = () => {
    const entry = addJournalEntry();
    navigate(`/journal/${entry.id}`);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24 md:pb-10 relative overflow-hidden">
      {/* Modals */}
      {showCreateRoom && <CreateRoomModal onClose={() => setShowCreateRoom(false)} />}
      {showCreateThread && <CreateThreadModal onClose={() => setShowCreateThread(false)} />}

      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-canvas-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-canvas-accent/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 p-6 md:p-10 max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-3">Create Hub</h1>
          <p className="text-gray-400 font-serif italic text-lg max-w-xl leading-relaxed">
            What are you bringing into the world today? Choose your intention and start your flow.
          </p>
        </header>

        {/* SECTION 1: QUICK SEED (CAPTURE) */}
        <section className="mb-16">
          <div className="relative group">
            <div className="absolute inset-0 bg-canvas-primary/10 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            <form 
              onSubmit={handleQuickSeed}
              className="relative p-1 bg-white/[0.03] border border-white/10 group-focus-within:border-canvas-primary/40 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-2 transition-all duration-500 backdrop-blur-xl"
            >
              <div className="flex-1 flex items-center pl-8 w-full">
                <Link2 size={24} className="text-gray-500 mr-4" />
                <input 
                  value={seedUrl}
                  onChange={e => setSeedUrl(e.target.value)}
                  placeholder="Paste a URL or write a quick thought..."
                  className="w-full bg-transparent py-6 text-xl font-medium text-white placeholder-gray-700 focus:outline-none"
                />
              </div>

              <div className="w-full md:w-auto flex flex-row items-center gap-2 p-1.5 h-full">
                <select 
                  value={seedRoomId}
                  onChange={e => setSeedRoomId(e.target.value)}
                  className="bg-white/5 border border-white/10 text-gray-400 text-xs font-bold uppercase tracking-widest px-4 py-4 rounded-3xl focus:outline-none focus:border-white/20 transition-all cursor-pointer"
                >
                  {rooms.map(room => (
                    <option key={room.id} value={room.id}>{room.name}</option>
                  ))}
                </select>

                <button 
                  disabled={!seedUrl || isSeeding}
                  className={`px-8 py-4 rounded-3xl font-bold uppercase tracking-widest text-xs transition-all flex items-center gap-3 whitespace-nowrap cursor-pointer ${seedSuccess ? 'bg-emerald-500 text-white' : 'bg-white text-black hover:bg-white/90 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed'}`}
                >
                  {isSeeding ? (
                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  ) : seedSuccess ? (
                    <>Success <Zap size={14} /></>
                  ) : (
                    <>Seed Artifact <ArrowRight size={14} /></>
                  )}
                </button>
              </div>
            </form>
          </div>
          <p className="mt-4 ml-8 text-[10px] font-bold uppercase tracking-widest text-gray-500">Fast-capture any artifact into your permanent collection.</p>
        </section>

        {/* SECTION 2: INTENTIONAL PILLARS (LARGE CARDS) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {/* Room Pilllar */}
          <div 
            onClick={() => setShowCreateRoom(true)}
            className="group relative h-[400px] rounded-[3rem] overflow-hidden cursor-pointer border border-white/5 hover:border-canvas-primary/40 transition-all duration-500 shadow-2xl"
          >
            <div className="absolute inset-0 bg-linear-to-b from-canvas-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="absolute inset-0 p-10 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-center mb-8 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl">
                <Layout size={36} className="text-canvas-primary" />
              </div>
              <h3 className="text-3xl font-bold mb-3 tracking-tight">Expressive Room</h3>
              <p className="text-gray-400 font-serif italic mb-10 text-lg leading-relaxed px-4">
                Build a new cinematic container for a specific area of interest.
              </p>
              <div className="px-6 py-3 border border-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest text-white group-hover:bg-white group-hover:text-black transition-all">
                Choose Intent
              </div>
            </div>
          </div>

          {/* Thread Pillar */}
          <div 
            onClick={() => setShowCreateThread(true)}
            className="group relative h-[400px] rounded-[3rem] overflow-hidden cursor-pointer border border-white/5 hover:border-canvas-accent/40 transition-all duration-500 shadow-2xl"
          >
            <div className="absolute inset-0 bg-linear-to-b from-canvas-accent/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="absolute inset-0 p-10 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-center mb-8 transform group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 shadow-xl">
                <Layers size={36} className="text-canvas-accent" />
              </div>
              <h3 className="text-3xl font-bold mb-3 tracking-tight">Thematic Thread</h3>
              <p className="text-gray-400 font-serif italic mb-10 text-lg leading-relaxed px-4">
                Synthesize existing artifacts into a structured intellectual output.
              </p>
              <div className="px-6 py-3 border border-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest text-white group-hover:bg-white group-hover:text-black transition-all">
                Synthesize
              </div>
            </div>
          </div>

          {/* Journal Pillar */}
          <div 
            onClick={handleStartJournal}
            className="group relative h-[400px] rounded-[3rem] overflow-hidden cursor-pointer border border-white/5 hover:border-white/30 transition-all duration-500 shadow-2xl"
          >
            <div className="absolute inset-0 bg-linear-to-b from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="absolute inset-0 p-10 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-center mb-8 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-xl">
                <BookOpen size={36} className="text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-3 tracking-tight">Introspective Entry</h3>
              <p className="text-gray-400 font-serif italic mb-10 text-lg leading-relaxed px-4">
                Dive into a raw writing flow. Private, dated, and moody.
              </p>
              <div className="px-6 py-3 border border-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest text-white group-hover:bg-white group-hover:text-black transition-all">
                Start Writing
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: SYNTHESIS OUTPUTS (SECONDARY GRID) */}
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
              <h4 className="text-xl font-bold mb-2">Mood Board Engine</h4>
              <p className="text-sm text-gray-500 mb-8 leading-relaxed font-serif italic">Turn a Room or Thread into a high-fidelity visual grid for export.</p>
              <button className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors flex items-center gap-2">
                Launch Explorer <ArrowRight size={12} />
              </button>
            </div>
            
            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-white/20 transition-all cursor-pointer group shadow-lg">
              <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl mb-6 flex items-center justify-center group-hover:bg-[#1DB954]/20 transition-colors">
                <Music size={20} className="text-gray-400 group-hover:text-[#1DB954]" />
              </div>
              <h4 className="text-xl font-bold mb-2">Atmospheric Exports</h4>
              <p className="text-sm text-gray-500 mb-8 leading-relaxed font-serif italic">Sync Room soundtracks directly into Spotify or Apple Music playlists.</p>
              <button className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors flex items-center gap-2">
                Connect API <ArrowRight size={12} />
              </button>
            </div>
            
            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-white/20 transition-all cursor-pointer group shadow-lg">
              <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl mb-6 flex items-center justify-center group-hover:bg-canvas-primary/20 transition-colors">
                <Globe size={20} className="text-gray-400 group-hover:text-canvas-primary" />
              </div>
              <h4 className="text-xl font-bold mb-2">Portrait Preview</h4>
              <p className="text-sm text-gray-500 mb-8 leading-relaxed font-serif italic">Render your public persona. Curate what the world sees of your collection.</p>
              <button className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors flex items-center gap-2">
                View Persona <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
