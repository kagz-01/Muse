import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { 
  ArrowLeft, Trash2, AlertTriangle, Clock, Hash, X, Check, 
  ChevronDown, Link2, Plus, Sparkles, Star, Type, Download, 
  ArrowRight, Book
} from 'lucide-react';
import { useJournalStore, type JournalMood, type JournalEntry } from '../store/useJournalStore';
import { useItemsStore } from '../store/useItemsStore';
import { useRoomsStore } from '../store/useRoomsStore';
import { moodConfig } from './Journal';

const moods = Object.entries(moodConfig) as [JournalMood, typeof moodConfig[JournalMood]][];

const PROMPTS_BY_MOOD: Record<JournalMood, string[]> = {
  reflective: ['What have you been replaying in your mind lately?', 'What truth are you slowly coming to accept?'],
  grounded: ['Describe the physical space you\'re in right now, in detail.', 'What feels stable right now, and why?'],
  anxious: ['Name the thing you\'re avoiding thinking about.', 'Write down every fear, no matter how irrational.'],
  grateful: ['Who helped you recently that you haven\'t thanked?', 'What ordinary thing are you most glad exists?'],
  melancholic: ['What are you mourning that no one knows about?', 'Write a letter to a past version of yourself.'],
  charged: ['What idea is consuming you right now?', 'Where is this energy trying to take you?'],
  empty: ['Write one sentence. Any sentence.', 'Describe the last thing you noticed that made you feel anything.'],
  alive: ['What made today feel worth it?', 'Write about the last moment you felt completely present.'],
  inspired: ['Where did this inspiration come from?', 'If you acted on this idea right now, what\'s the first step?'],
  nostalgic: ['What memory keeps coming back?', 'What from the past still shapes who you are today?'],
  focused: ['What is the one thing that matters most today?', 'What would you do if distraction was impossible?'],
  tender: ['Who are you feeling soft towards right now?', 'What are you being gentle with in yourself?'],
  custom: ['What\'s on your mind?', 'Start anywhere.'],
};

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}
function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

type FontSize = 'standard' | 'large' | 'huge';
const fontSizes: Record<FontSize, { label: string; class: string }> = {
  standard: { label: 'A', class: 'text-xl md:text-[22px]' },
  large:    { label: 'AA', class: 'text-2xl md:text-[28px]' },
  huge:     { label: 'AAA', class: 'text-3xl md:text-[36px]' }
};

export default function JournalEntry() {
  const { id } = useParams();
  const navigate = useNavigate();

  const entries = useJournalStore(state => state.entries);
  const entry = entries.find(e => e.id === id);
  const updateEntry = useJournalStore(state => state.updateEntry);
  const deleteEntry = useJournalStore(state => state.deleteEntry);
  const toggleFavorite = useJournalStore(state => state.toggleFavorite);
  const getTitle = useJournalStore(state => state.getTitle);

  const allItems = useItemsStore(state => state.items);
  const rooms = useRoomsStore(state => state.rooms);

  const [body, setBody] = useState(entry?.body ?? '');
  const [mood, setMood] = useState<JournalMood>(entry?.mood ?? 'reflective');
  const [customMoodText, setCustomMoodText] = useState(entry?.customMood ?? '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(entry?.tags ?? []);
  const [linkedItemIds, setLinkedItemIds] = useState<string[]>(entry?.linkedItemIds ?? []);
  const [fontSize, setFontSize] = useState<FontSize>('standard');
  const [saved, setSaved] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [showLinkArtifacts, setShowLinkArtifacts] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<number | null>(entry?.updatedAt ?? null);
  const [showPrompt, setShowPrompt] = useState(!entry?.body);
  const [promptIdx, setPromptIdx] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!entry?.body) textareaRef.current?.focus();
  }, []);

  const save = useCallback(() => {
    if (!entry) return;
    updateEntry(entry.id, {
      body,
      mood,
      customMood: mood === 'custom' ? customMoodText : undefined,
      tags,
      linkedItemIds,
    });
    setSaved(true);
    setLastSavedTime(Date.now());
  }, [entry, body, mood, customMoodText, tags, linkedItemIds, updateEntry]);

  useEffect(() => {
    setSaved(false);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(save, 1500);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [body, mood, customMoodText, tags, linkedItemIds]);

  if (!entry) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#0a0a0a]">
      <p className="text-2xl font-bold text-white">Entry not found.</p>
      <button onClick={() => navigate('/journal')} className="text-gray-400 hover:text-white text-sm cursor-pointer underline">Back to Journal</button>
    </div>
  );

  const cfg = moodConfig[mood];
  const prompts = PROMPTS_BY_MOOD[mood];
  const currentPrompt = prompts[promptIdx % prompts.length];
  const wordCount = body.trim().split(/\s+/).filter(Boolean).length;
  const charCount = body.length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Find related entries by tag
  const relatedEntries = entries
    .filter(e => e.id !== entry.id && e.tags.some(t => tags.includes(t)))
    .slice(0, 2);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
      if (newTag && !tags.includes(newTag)) setTags(prev => [...prev, newTag]);
      setTagInput('');
    }
  };

  const handleExportEntry = () => {
    const content = `
# ${getTitle(entry)}
Date: ${new Date(entry.createdAt).toLocaleString()}
Mood: ${mood} ${mood === 'custom' ? `(${customMoodText})` : ''}
Tags: ${tags.join(', ')}

${body}
`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${getTitle(entry).toLowerCase().replace(/\s+/g, '_')}.md`;
    a.click();
  };

  const toggleLinkedItem = (itemId: string) => {
    setLinkedItemIds(prev => prev.includes(itemId) ? prev.filter(i => i !== itemId) : [...prev, itemId]);
  };

  const getRoomName = (roomId: string) => rooms.find(r => r.id === roomId)?.name ?? 'Unknown Room';

  const handleDelete = () => { deleteEntry(entry.id); navigate('/journal'); };

  const linkedItems = allItems.filter(i => linkedItemIds.includes(i.id));
  const unlinkable = allItems.filter(i => !linkedItemIds.includes(i.id));

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] relative">
      {/* Ambient mood glow */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.1] transition-colors duration-1000"
        style={{ background: `radial-gradient(ellipse at top, ${cfg.color}50, transparent 60%)` }} />

      {/* TOP HEADER */}
      <header className="sticky top-0 z-30 px-6 md:px-10 py-4 flex items-center justify-between border-b border-white/5 backdrop-blur-xl bg-[#0a0a0a]/80">
        <div className="flex items-center gap-4">
          <button onClick={() => { save(); navigate('/journal'); }}
            className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer">
            <ArrowLeft size={18} />
          </button>

          {/* Mood Selector Component */}
          <div className="relative">
            <button onClick={() => setShowMoodPicker(!showMoodPicker)}
              className="flex items-center gap-2 px-4 py-2 rounded-full border text-[11px] font-bold uppercase tracking-widest transition-all cursor-pointer"
              style={{ backgroundColor: cfg.color + '22', borderColor: cfg.color + '55', color: cfg.color }}>
              <span>{cfg.emoji}</span>
              {mood === 'custom' && customMoodText ? customMoodText : cfg.label}
              <ChevronDown size={12} />
            </button>

            {showMoodPicker && (
              <div className="absolute top-full left-0 mt-3 bg-[#151515] border border-white/10 rounded-[2rem] p-4 shadow-2xl z-40 w-72 animate-in fade-in slide-in-from-top-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4 px-1">How are you feeling?</p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {moods.filter(([m]) => m !== 'custom').map(([m, c]) => (
                    <button key={m} onClick={() => { setMood(m as JournalMood); setShowMoodPicker(false); }}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all text-left ${mood === m ? 'text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                      style={mood === m ? { backgroundColor: c.color + '25' } : {}}
                    >
                      <span className="text-lg">{c.emoji}</span> {c.label}
                    </button>
                  ))}
                </div>
                <div className="border-t border-white/10 pt-4">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2 px-1">Custom Mood</p>
                  <input
                    value={customMoodText}
                    onChange={e => setCustomMoodText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && customMoodText.trim()) { setMood('custom'); setShowMoodPicker(false); } }}
                    placeholder="Wistful, electric..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-xs focus:outline-none focus:border-white/20 transition-all"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Controls row */}
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full p-1 mr-2 invisible md:visible">
            {(Object.entries(fontSizes) as [FontSize, typeof fontSizes[FontSize]][]).map(([size, config]) => (
              <button key={size} onClick={() => setFontSize(size)}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold transition-all cursor-pointer ${fontSize === size ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}>
                {config.label}
              </button>
            ))}
          </div>

          <button onClick={() => toggleFavorite(entry.id)}
            className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all cursor-pointer ${entry.isFavorited ? 'border-amber-500/40 bg-amber-500/10 text-amber-500' : 'border-white/10 text-gray-600 hover:text-white hover:bg-white/5'}`}>
            <Star size={18} fill={entry.isFavorited ? 'currentColor' : 'transparent'} />
          </button>

          <button onClick={handleExportEntry}
            className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            title="Download Entry (.md)">
            <Download size={18} />
          </button>

          <div className="w-px h-6 bg-white/10 mx-2" />

          {/* Save Status & Trash */}
          <div className="flex items-center gap-4 font-bold text-[10px] uppercase tracking-widest">
            {saved ? (
              <span className="text-gray-600 flex items-center gap-2">
                <Check size={12} strokeWidth={3} className="text-emerald-500" /> {lastSavedTime ? formatTime(lastSavedTime) : 'Saved'}
              </span>
            ) : (
              <span className="text-amber-500/80 flex items-center gap-2 italic">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Saving
              </span>
            )}
            <button onClick={() => setShowDelete(!showDelete)}
              className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-600 hover:text-rose-400 hover:border-rose-500/30 transition-all cursor-pointer">
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Delete Confirmation Overlay */}
      {showDelete && (
        <div className="bg-rose-500/10 border-b border-rose-500/20 px-6 md:px-10 py-5 flex items-center justify-between relative z-20 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-4 text-sm font-medium text-rose-200">
            <AlertTriangle size={18} className="text-rose-500" /> Confirm permanent deletion of this thought.
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setShowDelete(false)} className="text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors cursor-pointer">Cancel</button>
            <button onClick={handleDelete} className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-bold uppercase tracking-[0.2em] rounded-xl shadow-lg transition-all cursor-pointer">Delete Forever</button>
          </div>
        </div>
      )}

      {/* EDITOR CANVAS */}
      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-6 md:px-16 py-12 relative z-10">
        
        {/* Entry Date & Prompt Toggle */}
        <div className="mb-12 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: cfg.color }}>
              {formatDate(entry.createdAt)}
            </p>
            <div className="mt-4 w-16 h-1 rounded-full" style={{ backgroundColor: cfg.color + '40' }} />
          </div>
          <button onClick={() => setShowPrompt(!showPrompt)}
            className="flex items-center gap-2 group text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-all cursor-pointer">
            <Sparkles size={14} className="group-hover:rotate-12 transition-transform" />
            Prompt Engine
          </button>
        </div>

        {/* Floating Writing Prompt */}
        {showPrompt && (
          <div className="mb-10 flex items-start gap-5 bg-white/[0.03] border rounded-3xl p-7 animate-in fade-in slide-in-from-top-4 duration-500 backdrop-blur-sm"
            style={{ borderColor: cfg.color + '25' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: cfg.color + '20' }}>
              <Sparkles size={18} style={{ color: cfg.color }} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-2">Contemplation Seed</p>
              <h5 className="text-white font-serif italic text-[17px] leading-relaxed">"{currentPrompt}"</h5>
            </div>
            <button onClick={() => setPromptIdx(p => p + 1)}
              className="px-4 py-2 rounded-full border border-white/10 text-[9px] font-bold uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer">
              Next
            </button>
          </div>
        )}

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder={cfg.placeholder ?? 'Start writing...'}
          className={`flex-1 w-full min-h-[60vh] bg-transparent text-white/95 resize-none outline-none font-serif leading-[2.1] placeholder-gray-800 transition-all tracking-wide ${fontSizes[fontSize].class}`}
          style={{ caretColor: cfg.color }}
        />

        {/* FOOTER: ARTIFACTS, TAGS, RELATED */}
        <div className="mt-16 pt-12 border-t border-white/5 space-y-12">
          
          {/* Related Artifacts Panel */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2.5">
                <Link2 size={13} className="text-violet-400" /> Inspiration Artifacts
              </label>
              <button onClick={() => setShowLinkArtifacts(!showLinkArtifacts)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/8 text-[9px] font-bold uppercase tracking-widest text-gray-500 hover:text-white hover:bg-white/10 transition-all cursor-pointer">
                <Plus size={11} /> Link From Rooms
              </button>
            </div>

            <div className="flex flex-wrap gap-3">
              {linkedItems.map(item => (
                <div key={item.id} className="group flex items-center gap-3 bg-white/[0.04] border border-white/8 rounded-2xl px-5 py-3.5 hover:border-white/20 transition-all">
                  <div className="w-2 h-2 rounded-full bg-gray-500 shrink-0" />
                  <div>
                    <p className="text-[13px] font-bold text-white max-w-[200px] truncate">{item.title}</p>
                    <p className="text-[9px] text-gray-600 uppercase tracking-widest font-bold mt-0.5">{getRoomName(item.roomId)}</p>
                  </div>
                  <button onClick={() => toggleLinkedItem(item.id)} className="text-gray-700 hover:text-rose-400 transition-colors ml-2 cursor-pointer">
                    <X size={14} />
                  </button>
                </div>
              ))}
              {linkedItems.length === 0 && !showLinkArtifacts && (
                <p className="text-gray-700 font-serif italic text-sm">No linked artifacts from your rooms yet.</p>
              )}
            </div>

            {showLinkArtifacts && (
              <div className="mt-6 bg-white/[0.02] border border-white/8 rounded-[2rem] p-6 animate-in slide-in-from-bottom-4 duration-500">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-5">Your Room Collective</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {unlinkable.length === 0 ? <p className="text-gray-600 text-xs italic p-2">Everything is already connected.</p> :
                  unlinkable.map(item => (
                    <button key={item.id} onClick={() => toggleLinkedItem(item.id)}
                      className="group w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl border border-transparent hover:border-white/10 hover:bg-white/5 transition-all text-left">
                      <Plus size={14} className="text-gray-600 group-hover:text-white" />
                      <div>
                        <p className="text-sm font-bold text-white group-hover:text-violet-400 transition-colors line-clamp-1">{item.title}</p>
                        <p className="text-[9px] text-gray-600 uppercase font-bold tracking-widest">{getRoomName(item.roomId)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Tag Engine */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-5 flex items-center gap-2.5">
                <Hash size={13} className="text-rose-400" /> Introspection Tags
              </label>
              <div className="flex flex-wrap gap-2.5">
                {tags.map(tag => (
                  <span key={tag} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold text-gray-400 hover:text-white transition-all">
                    #{tag}
                    <button onClick={() => setTags(prev => prev.filter(t => t !== tag))} className="text-gray-600 hover:text-rose-400 transition-colors cursor-pointer">
                      <X size={12} />
                    </button>
                  </span>
                ))}
                <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={handleAddTag}
                  placeholder="New tag..."
                  className="bg-transparent text-[11px] font-bold text-gray-500 placeholder-gray-800 outline-none w-24 py-2"
                />
              </div>
            </div>

            {/* Related Entries */}
            {relatedEntries.length > 0 && (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-5 flex items-center gap-2.5">
                  <Book size={13} className="text-amber-400" /> Resonating Entries
                </label>
                <div className="space-y-3">
                  {relatedEntries.map(re => (
                    <button key={re.id} onClick={() => navigate(`/journal/${re.id}`)}
                      className="w-full flex items-center gap-4 group p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all text-left">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500/60 group-hover:text-amber-500 transition-colors font-bold text-xs ring-1 ring-amber-500/20">
                        {re.tags[0].slice(0, 1).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors truncate">{getTitle(re)}</p>
                        <p className="text-[9px] text-gray-600 uppercase font-bold tracking-widest mt-0.5">{new Date(re.createdAt).toLocaleDateString()}</p>
                      </div>
                      <ArrowRight size={14} className="text-gray-800 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Stats */}
          <div className="flex items-center justify-between text-[10px] font-bold font-mono tracking-widest text-gray-700 pt-8">
            <div className="flex gap-8">
              <span>W:{wordCount.toLocaleString()}</span>
              <span>C:{charCount.toLocaleString()}</span>
              <span>R:{readingTime}M</span>
            </div>
            <div className="flex items-center gap-2" style={{ color: cfg.color }}>
               {mood === 'custom' && customMoodText ? customMoodText : cfg.label}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
