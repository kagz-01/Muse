import { useState, useEffect } from "preact/hooks";
import { 
  X, Link2, Layout, 
  ChevronRight, ArrowLeft, Zap, Sparkles,
  Check, Plus, Globe, Lock
} from "lucide-preact";
import { isCaptureOpenSignal, toggleCapture } from "../signals/ui.ts";
import { roomsSignal, addRoom } from "../signals/rooms.ts";
import { addItem } from "../signals/items.ts";

type CaptureStep = 'input' | 'context' | 'contemplation';

export default function CaptureModal() {
  const [step, setStep] = useState<CaptureStep>('input');
  const [url, setUrl] = useState('');
  const [roomId, setRoomId] = useState('');
  const [note, setNote] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  
  // Inline Room Creation State
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomIsPublic, setNewRoomIsPublic] = useState(false);
  
  const isOpen = isCaptureOpenSignal.value;
  const rooms = roomsSignal.value;

  // Initialize roomId if not set
  useEffect(() => {
    if (rooms.length > 0 && !roomId) {
      setRoomId(rooms[0].id);
    }
  }, [rooms, roomId]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step === 'input' && url) {
      setIsScanning(true);
      // Mock scanning effect
      setTimeout(() => {
        setIsScanning(false);
        setStep('context');
      }, 1200);
    } else if (step === 'context') {
      setStep('contemplation');
    }
  };

  const handleBack = () => {
    if (step === 'context') setStep('input');
    if (step === 'contemplation') setStep('context');
  };

  const handleCreateRoom = () => {
    if (!newRoomName.trim()) return;
    const newRoom = addRoom(newRoomName.trim(), '', 'indigo', '', newRoomIsPublic);
    setRoomId(newRoom.id);
    setIsAddingRoom(false);
    setNewRoomName('');
    setNewRoomIsPublic(false);
    setStep('contemplation');
  };

  const handleCapture = (e: Event) => {
    e.preventDefault();
    if (!url || !roomId) return;
    
    let title = 'Captured Artifact';
    try {
      title = url.startsWith('http') ? new URL(url).hostname : 'Personal Thought';
    } catch(_e) {}

    addItem({
      roomId,
      title,
      sourceUrl: url.startsWith('http') ? url : `https://google.com/search?q=${encodeURIComponent(url)}`,
      note,
      isPublic: false
    });
    
    // Reset and close
    setStep('input');
    setUrl('');
    setNote('');
    toggleCapture();
  };

  const steps: CaptureStep[] = ['input', 'context', 'contemplation'];
  const currentStepIdx = steps.indexOf(step);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div 
        onClick={toggleCapture}
        className="absolute inset-0 bg-[#000000]/95 backdrop-blur-3xl"
      />
      
      <div className="relative w-full max-w-2xl bg-white/[0.02] border border-white/10 rounded-[3rem] p-12 md:p-16 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500">
        
        {/* Scanline Effect during scanning */}
        {isScanning && (
          <div className="absolute inset-x-0 h-1 bg-canvas-primary blur-md z-20 pointer-events-none animate-[slide-down_1.2s_linear_infinite]" />
        )}

        <button 
          type="button"
          onClick={toggleCapture}
          className="absolute top-8 right-8 p-3 text-gray-500 hover:text-white transition-all rounded-2xl hover:bg-white/5 active:scale-95 cursor-pointer"
        >
          <X size={24} />
        </button>

        {step !== 'input' && (
          <button 
            type="button"
            onClick={handleBack}
            className="absolute top-8 left-8 p-3 text-gray-500 hover:text-white transition-all rounded-2xl hover:bg-white/5 active:scale-95 flex items-center gap-2 group cursor-pointer"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Back</span>
          </button>
        )}

        {/* Local Progress Indicator */}
        <div className="flex justify-center gap-3 mb-10">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`h-1 w-12 rounded-full transition-all duration-700 ${i <= currentStepIdx ? 'bg-canvas-primary' : 'bg-white/10'}`} 
            />
          ))}
        </div>

        <div className="min-h-[300px] flex flex-col justify-center">
          {/* STEP 1: INPUT */}
          {step === 'input' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="text-center space-y-4">
                 <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                   Capture the <span className="text-canvas-primary">Essence.</span>
                 </h2>
                 <p className="text-gray-500 font-serif italic text-lg leading-relaxed">
                   What artifact has entered your field of vision?
                 </p>
              </div>

              <div className="relative group max-w-lg mx-auto">
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-white/10 group-focus-within:bg-canvas-primary transition-colors duration-500 shadow-[0_0_20px_rgba(99,102,241,0.2)]" />
                <input 
                  type="text"
                  required
                  placeholder="Paste a URL or a deep thought..."
                  autoFocus
                  value={url}
                  onInput={(e) => setUrl((e.target as HTMLInputElement).value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleNext();
                    if (e.key === 'Escape') toggleCapture();
                  }}
                  className="w-full bg-transparent text-2xl p-6 text-center outline-none transition-colors placeholder-gray-800 font-sans text-white border-0"
                />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2 pr-4">
                   <Link2 size={18} className="text-gray-600" />
                </div>
              </div>

              <div className="flex justify-center pt-8">
                <button 
                  type="button"
                  onClick={handleNext}
                  disabled={!url || isScanning}
                  className="group px-10 py-5 bg-white text-black font-bold uppercase tracking-widest text-[11px] rounded-3xl flex items-center gap-3 shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-30 disabled:translate-y-0 cursor-pointer"
                >
                  {isScanning ? 'Scanning Artifact...' : 'Analyze Resonance'} 
                  {!isScanning && <Sparkles size={16} className="text-canvas-primary group-hover:rotate-12 transition-transform" />}
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: CONTEXT */}
          {step === 'context' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="text-center space-y-4">
                 <div className="flex justify-center mb-6">
                    <div className="px-5 py-2 rounded-full bg-canvas-primary/10 border border-canvas-primary/20 flex items-center gap-3">
                       <Check size={14} className="text-canvas-primary" />
                       <span className="text-[10px] font-bold text-canvas-primary uppercase tracking-widest">Resonance Verified</span>
                    </div>
                 </div>
                 <h2 className="text-4xl font-bold text-white tracking-tight leading-tight">
                   Where does this <span className="text-gray-500 italic font-serif">belong?</span>
                 </h2>
                 <p className="text-gray-500 font-serif italic text-lg leading-relaxed">
                   Choose a Room or create a new thematic anchor.
                 </p>
              </div>

              <div className="min-h-[220px]">
                {!isAddingRoom ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-lg mx-auto h-[220px] overflow-y-auto px-4 scrollbar-hide py-2">
                    {rooms.map((room) => (
                      <button
                      type="button"
                      key={room.id}
                      onClick={() => setRoomId(room.id)}
                        className={`p-6 rounded-4xl border transition-all flex flex-col items-center gap-4 group cursor-pointer ${roomId === room.id ? 'bg-canvas-primary/10 border-canvas-primary shadow-[0_0_30px_rgba(99,102,241,0.2)]' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                      >
                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${roomId === room.id ? 'bg-canvas-primary text-white' : 'bg-white/5 text-gray-500 group-hover:text-white'}`}>
                            <Layout size={18} />
                         </div>
                         <span className={`text-[10px] font-bold uppercase tracking-widest text-center leading-tight ${roomId === room.id ? 'text-white' : 'text-gray-500'}`}>{room.name}</span>
                      </button>
                    ))}
                    
                    <button 
                      type="button"
                      onClick={() => setIsAddingRoom(true)}
                      className="p-6 rounded-4xl border border-dashed border-white/10 hover:border-canvas-primary/40 hover:bg-canvas-primary/5 transition-all flex flex-col items-center justify-center gap-4 group cursor-pointer"
                    >
                       <div className="w-10 h-10 rounded-full border border-dashed border-gray-600 flex items-center justify-center group-hover:border-canvas-primary transition-colors">
                          <Plus size={18} className="text-gray-600 group-hover:text-canvas-primary" />
                       </div>
                       <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-white transition-colors">New Room</span>
                    </button>
                  </div>
                ) : (
                  <div className="max-w-md mx-auto space-y-6 bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden animate-in zoom-in-95 duration-300">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-4">Room Identity</label>
                       <input 
                         autoFocus
                         placeholder="e.g. Digital Ephemera"
                         value={newRoomName}
                         onInput={(e) => setNewRoomName((e.target as HTMLInputElement).value)}
                         onKeyDown={(e) => {
                           if (e.key === 'Enter') handleCreateRoom();
                           if (e.key === 'Escape') setIsAddingRoom(false);
                         }}
                         className="w-full bg-white/5 border border-white/10 rounded-3xl p-5 text-lg outline-none focus:border-canvas-primary transition-all text-white placeholder-gray-800"
                       />
                    </div>

                    <div className="flex gap-2 p-1 bg-white/5 rounded-3xl">
                       <button 
                         type="button"
                         onClick={() => setNewRoomIsPublic(false)}
                         className={`flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all ${!newRoomIsPublic ? 'bg-white/10 text-white shadow-lg' : 'text-gray-600'} cursor-pointer`}
                       >
                          <Lock size={14} />
                          <span className="text-[9px] font-bold uppercase tracking-widest">Solo Vault</span>
                       </button>
                       <button 
                         type="button"
                         onClick={() => setNewRoomIsPublic(true)}
                         className={`flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all ${newRoomIsPublic ? 'bg-canvas-accent/20 text-canvas-accent shadow-lg' : 'text-gray-600'} cursor-pointer`}
                       >
                          <Globe size={14} />
                          <span className="text-[9px] font-bold uppercase tracking-widest">Public Hub</span>
                       </button>
                    </div>

                    <div className="flex gap-3">
                       <button 
                         type="button"
                         onClick={() => setIsAddingRoom(false)}
                         className="flex-1 py-4 rounded-2xl border border-white/10 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-all cursor-pointer"
                       >
                         Cancel
                       </button>
                       <button 
                         type="button"
                         onClick={handleCreateRoom}
                         disabled={!newRoomName.trim()}
                         className="flex-[2] py-4 rounded-2xl bg-canvas-primary text-white text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-canvas-primary/20 disabled:opacity-30 transition-all hover:-translate-y-0.5 cursor-pointer"
                       >
                         Establish Room
                       </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-center pt-8">
                <button 
                  type="button"
                  onClick={handleNext}
                  disabled={!roomId}
                  className="group px-10 py-5 bg-white text-black font-bold uppercase tracking-widest text-[11px] rounded-3xl flex items-center gap-3 shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-30 cursor-pointer"
                >
                  Anchor Context <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CONTEMPLATION */}
          {step === 'contemplation' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="text-center space-y-4">
                 <h2 className="text-4xl font-bold text-white tracking-tight leading-tight">
                   A Breath for <span className="text-canvas-accent">Contemplation.</span>
                 </h2>
                 <p className="text-gray-500 font-serif italic text-lg leading-relaxed">
                   Why did this resonance matter to you?
                 </p>
              </div>

              <div className="relative group max-w-lg mx-auto">
                <textarea 
                  placeholder="Your silent thoughts go here..."
                  autoFocus
                  value={note}
                  onInput={(e) => setNote((e.target as HTMLTextAreaElement).value)}
                  className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-8 text-lg outline-none transition-all placeholder-gray-700 min-h-[140px] font-serif italic text-white focus:border-canvas-accent/40"
                />
              </div>

              <div className="flex justify-center pt-8">
                <button 
                  type="button"
                  onClick={handleCapture}
                  className="group px-12 py-6 bg-canvas-primary text-white font-bold uppercase tracking-widest text-[11px] rounded-[2rem] flex items-center gap-4 shadow-[0_25px_50px_rgba(99,102,241,0.3)] hover:-translate-y-1 active:scale-95 transition-all cursor-pointer"
                >
                  <Zap size={18} className="fill-white" /> Commit to Muse
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-canvas-primary/10 blur-[60px] rounded-full" />
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-canvas-accent/10 blur-[60px] rounded-full" />
      </div>
    </di