import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Search, Plus, Flame, Target, BookOpen, ArrowRight, Sparkles, BarChart3, Calendar, Download, Star } from 'lucide-react';
import { useJournalStore, type JournalMood, type JournalEntry } from '../store/useJournalStore';

export const moodConfig: Record<JournalMood, { label: string; color: string; emoji: string }> = {
  reflective:  { label: 'Reflective',  color: '#8b5cf6', emoji: '🌙' },
  grounded:    { label: 'Grounded',    color: '#10b981', emoji: '🌿' },
  anxious:     { label: 'Anxious',     color: '#f43f5e', emoji: '⚡' },
  grateful:    { label: 'Grateful',    color: '#f59e0b', emoji: '✨' },
  melancholic: { label: 'Melancholic', color: '#64748b', emoji: '🌧️' },
  charged:     { label: 'Charged',     color: '#06b6d4', emoji: '🌊' },
  empty:       { label: 'Empty',       color: '#374151', emoji: '○' },
  alive:       { label: 'Alive',       color: '#84cc16', emoji: '🔥' },
  inspired:    { label: 'Inspired',    color: '#e879f9', emoji: '💡' },
  nostalgic:   { label: 'Nostalgic',   color: '#fb923c', emoji: '📷' },
  focused:     { label: 'Focused',     color: '#38bdf8', emoji: '🎯' },
  tender:      { label: 'Tender',      color: '#f472b6', emoji: '🌸' },
  custom:      { label: 'Other',       color: '#9ca3af', emoji: '◈' },
};

function timeFormat(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(diff / 86400000);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function excerpt(body: string, chars = 160): string {
  const text = body.replace(/\n+/g, ' ').trim();
  return text.length > chars ? text.slice(0, chars) + '…' : text;
}

const PROMPTS: string[] = [
  "What's one thing you observed today that felt 'out of place'?",
  "If your current mood was a weather system, what would it look like?",
  "What idea are you currently protecting from being finished?",
  "Who is someone you want to be more like, and why?",
  "What is the most beautiful thing you saw today?",
  "What are you waiting for, and is it worth the wait?",
];

export default function Journal() {
  const navigate = useNavigate();
  const entries = useJournalStore(state => state.entries);
  const addEntry = useJournalStore(state => state.addEntry);
  const getTitle = useJournalStore(state => state.getTitle);
  const getStreak = useJournalStore(state => state.getStreak);
  const getTodayWordCount = useJournalStore(state => state.getTodayWordCount);
  const dailyWordGoal = useJournalStore(state => state.dailyWordGoal);

  const [search, setSearch] = useState('');
  const [filterMood, setFilterMood] = useState<JournalMood | 'all'>('all');
  const [showFavorites, setShowFavorites] = useState(false);
  const [showInsights, setShowInsights] = useState(false);

  const streak = getStreak();
  const todayWords = getTodayWordCount();
  const totalWords = entries.reduce((acc, e) => acc + e.wordCount, 0);
  const goalProgress = Math.min(100, (todayWords / dailyWordGoal) * 100);

  const filtered = entries.filter(e => {
    const matchSearch = search === '' ||
      e.body.toLowerCase().includes(search.toLowerCase()) ||
      getTitle(e).toLowerCase().includes(search.toLowerCase()) ||
      e.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchMood = filterMood === 'all' || e.mood === filterMood;
    const matchFav = !showFavorites || e.isFavorited;
    return matchSearch && matchMood && matchFav;
  });

  const moodStats = useMemo(() => {
    const stats: Record<string, number> = {};
    entries.forEach(e => {
      stats[e.mood] = (stats[e.mood] || 0) + 1;
    });
    return Object.entries(stats).sort((a, b) => b[1] - a[1]);
  }, [entries]);

  const heatmap = useMemo(() => {
    const days = [...Array(31)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (30 - i));
      const dateStr = d.toDateString();
      const count = entries.filter(e => new Date(e.createdAt).toDateString() === dateStr).reduce((sum, e) => sum + e.wordCount, 0);
      return { date: d, count };
    });
    return days;
  }, [entries]);

  const handleExport = () => {
    const content = entries.map(e => `
# ${getTitle(e)}
Date: ${new Date(e.createdAt).toLocaleString()}
Mood: ${e.mood} ${e.customMood ? `(${e.customMood})` : ''}
Tags: ${e.tags.join(', ')}

${e.body}

---
`).join('\n');
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `muse_journal_${new Date().toISOString().split('T')[0]}.md`;
    a.click();
  };

  const handleNewEntry = () => {
    const entry = addEntry();
    navigate(`/journal/${entry.id}`);
  };

  if (entries.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col justify-center items-center px-6">
        <div className="w-24 h-24 rounded-[2rem] bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-10 shadow-[0_0_80px_rgba(139,92,246,0.1)]">
          <BookOpen size={40} className="text-violet-400" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Your Journal</h1>
        <p className="text-gray-400 font-serif italic text-lg max-w-md text-center leading-relaxed mb-12">
          A private space for raw thought, emotional tracking, and quiet reflection. Completely local. Completely yours.
        </p>
        <button onClick={handleNewEntry}
          className="flex items-center gap-3 px-10 py-5 bg-white text-black font-bold uppercase tracking-widest text-sm rounded-full shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] hover:-translate-y-0.5 transition-all cursor-pointer">
          Write First Entry <ArrowRight size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* HERO SECTION */}
      <div className="relative overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.15),transparent_60%)] pointer-events-none" />

        <div className="relative z-10 px-6 md:px-10 pt-10 pb-8 max-w-5xl mx-auto">
          {/* Top meta row */}
          <div className="flex flex-wrap items-center gap-4 mb-10">
            <div className="flex items-center gap-2.5 px-5 py-3 bg-white/5 border border-white/8 rounded-2xl">
              <Flame size={18} className={streak > 0 ? "text-orange-400" : "text-gray-600"} />
              <div>
                <p className="text-white font-bold text-base leading-none">{streak} days</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">Streak</p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-5 py-3 bg-white/5 border border-white/8 rounded-2xl flex-1 max-w-xs">
              <Target size={16} className="text-violet-400 shrink-0" />
              <div className="flex-1">
                <div className="flex justify-between mb-1.5">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">Today</p>
                  <p className="text-[10px] font-bold text-gray-300">{todayWords}/{dailyWordGoal}</p>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-violet-500 transition-all duration-500" style={{ width: `${goalProgress}%` }} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 ml-auto">
              <button onClick={handleExport}
                className="w-11 h-11 flex items-center justify-center bg-white/5 border border-white/10 rounded-full text-gray-400 hover:text-white hover:border-white/20 transition-all cursor-pointer"
                title="Export to Markdown">
                <Download size={18} />
              </button>
              <button onClick={() => setShowInsights(!showInsights)}
                className={`flex items-center gap-2 px-5 h-11 rounded-full border text-[11px] font-bold uppercase tracking-widest transition-all cursor-pointer ${showInsights ? 'bg-violet-500/20 border-violet-500/40 text-violet-400' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'}`}>
                <BarChart3 size={15} /> {showInsights ? 'Hide Insights' : 'Insights'}
              </button>
              <button onClick={handleNewEntry}
                className="flex items-center gap-2.5 px-8 h-11 bg-white text-black font-bold uppercase tracking-widest text-[11px] rounded-full shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] hover:-translate-y-0.5 transition-all cursor-pointer">
                <Plus size={16} /> New Entry
              </button>
            </div>
          </div>

          {/* INSIGHTS PANEL */}
          {showInsights && (
            <div className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
              {/* Mood Distribution */}
              <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8">
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-6 flex items-center gap-2">
                  <Star size={14} className="text-violet-400" /> Mood Landscape
                </h3>
                <div className="space-y-4">
                  {moodStats.length === 0 ? <p className="text-gray-600 italic text-sm">No data yet.</p> :
                  moodStats.slice(0, 5).map(([mood, count]) => {
                    const cfg = moodConfig[mood as JournalMood];
                    const percent = Math.round((count / entries.length) * 100);
                    return (
                      <div key={mood} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                          <span className="text-gray-300">{cfg.emoji} {cfg.label}</span>
                          <span className="text-gray-500">{count} {count === 1 ? 'entry' : 'entries'}</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${percent}%`, backgroundColor: cfg.color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Writing Heatmap */}
              <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8">
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-6 flex items-center gap-2">
                  <Calendar size={14} className="text-violet-400" /> 30-Day Velocity
                </h3>
                <div className="flex justify-between items-end h-32 gap-1.5 pt-2">
                  {heatmap.map((day, i) => {
                    const height = Math.min(100, (day.count / (dailyWordGoal * 1.5)) * 100);
                    return (
                      <div key={i} className="flex-1 group relative">
                        <div
                          className={`w-full rounded-t-sm transition-all duration-700 ${day.count > 0 ? 'bg-violet-500/60 group-hover:bg-violet-400' : 'bg-white/5'}`}
                          style={{ height: `${Math.max(4, height)}%` }}
                        />
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-white text-black text-[9px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                          {day.date.toLocaleDateString([], { month: 'short', day: 'numeric' })}: {day.count} words
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-4 text-[9px] text-gray-600 font-bold uppercase tracking-widest">
                  <span>30 Days Ago</span>
                  <span>Today</span>
                </div>
              </div>
            </div>
          )}

          {/* LARGE SEARCH BAR */}
          <div className="relative group mb-8">
            <div className="absolute inset-0 rounded-[2.5rem] bg-violet-600/10 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700 pointer-events-none" />
            <div className="relative flex items-center border border-white/10 group-focus-within:border-violet-500/40 bg-white/[0.03] group-focus-within:bg-white/5 rounded-[2.5rem] p-2 transition-all duration-500 overflow-hidden">
              <div className="absolute left-8 text-gray-500 group-focus-within:text-violet-400 transition-colors">
                <Search size={24} strokeWidth={2.5} />
              </div>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search raw thoughts, patterns, depths…"
                className="w-full bg-transparent pl-20 pr-10 py-6 text-white text-2xl font-bold tracking-tight placeholder-gray-700 focus:outline-none"
              />
              <div className="absolute right-8 flex items-center gap-3">
                {search && (
                  <button onClick={() => setSearch('')} className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors cursor-pointer">
                    Clear
                  </button>
                )}
                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-600 text-xs font-bold font-mono">
                  {filtered.length}
                </div>
              </div>
            </div>
          </div>

          {/* Filters strip */}
          <div className="flex flex-wrap items-center gap-3 pb-4">
             <button onClick={() => setShowFavorites(!showFavorites)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest border transition-all cursor-pointer ${showFavorites ? 'bg-amber-500/20 border-amber-500/40 text-amber-500' : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/25'}`}>
              <Star size={13} fill={showFavorites ? 'currentColor' : 'transparent'} /> Favorites
            </button>
            <div className="w-px h-6 bg-white/5 mx-2 hidden sm:block" />
            <button onClick={() => setFilterMood('all')}
              className={`px-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest border transition-all cursor-pointer ${filterMood === 'all' && !showFavorites ? 'bg-white text-black border-white' : 'bg-transparent border-white/8 text-gray-500 hover:border-white/20'}`}>
              Everything
            </button>
            {(Object.entries(moodConfig) as [JournalMood, typeof moodConfig[JournalMood]][])
              .filter(([m]) => m !== 'custom')
              .map(([mood, cfg]) => (
                <button key={mood} onClick={() => setFilterMood(filterMood === mood ? 'all' : mood)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest border transition-all cursor-pointer group`}
                  style={filterMood === mood
                    ? { backgroundColor: cfg.color + '22', borderColor: cfg.color + '55', color: cfg.color }
                    : { borderColor: 'rgba(255,255,255,0.06)', color: 'rgb(107 114 128)' }
                  }
                >
                  <span className="group-hover:scale-125 transition-transform">{cfg.emoji}</span> {cfg.label}
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* PROMPT OF THE DAY */}
      {!search && !showFavorites && filterMood === 'all' && (
        <div className="px-6 md:px-10 pb-8 max-w-5xl mx-auto w-full">
          <div onClick={handleNewEntry}
            className="group cursor-pointer flex items-center gap-6 bg-white/[0.02] border border-white/5 hover:border-violet-500/30 hover:bg-violet-500/5 rounded-[2.5rem] p-8 transition-all duration-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center shrink-0 shadow-[0_0_40px_rgba(139,92,246,0.1)]">
              <Sparkles size={24} className="text-violet-400 group-hover:rotate-12 transition-transform" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-400/80 mb-2">Seed for contemplation</p>
              <h4 className="text-white font-serif italic text-xl leading-relaxed">"{PROMPTS[Math.floor(Date.now() / 86400000) % PROMPTS.length]}"</h4>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-600 group-hover:text-white transition-colors">
              Begin Writing <ArrowRight size={14} />
            </div>
          </div>
        </div>
      )}

      {/* JOURNAL FEED */}
      <main className="flex-1 px-6 md:px-10 pb-20 max-w-5xl mx-auto w-full">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center opacity-40">
            <BookOpen size={48} className="text-gray-600 mb-6" />
            <p className="text-gray-400 text-lg font-serif">Nothing resonates here.</p>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 gap-6 space-y-6">
            {filtered.map((entry, i) => {
              const cfg = moodConfig[entry.mood];
              const title = getTitle(entry);
              return (
                <div key={entry.id} onClick={() => navigate(`/journal/${entry.id}`)}
                  className="break-inside-avoid group relative bg-[#111318] border border-white/5 rounded-[2.2rem] p-8 cursor-pointer hover:border-white/15 hover:-translate-y-1 hover:bg-[#15181e] transition-all duration-300 overflow-hidden shadow-2xl">
                  {/* Favorite indicator */}
                  {entry.isFavorited && (
                    <div className="absolute top-8 right-8 z-20">
                      <Star size={16} fill="#f59e0b" className="text-amber-500" />
                    </div>
                  )}

                  {/* Mood accent bubble */}
                  <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full blur-[80px] opacity-[0.05] group-hover:opacity-[0.1] transition-opacity pointer-events-none" style={{ backgroundColor: cfg.color }} />

                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">{cfg.emoji}</span>
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500" style={{ color: `${cfg.color}99` }}>{entry.updatedAt ? timeFormat(entry.updatedAt) : 'Draft'}</p>
                    </div>

                    <h3 className="text-white font-bold text-2xl leading-tight tracking-tight mb-4 group-hover:text-violet-400 transition-colors">
                      {title || <span className="opacity-20 italic">Empty depth</span>}
                    </h3>

                    <p className="text-gray-400 text-base font-serif italic leading-relaxed mb-6 line-clamp-3 opacity-80 group-hover:opacity-100 transition-opacity">
                      {excerpt(entry.body)}
                    </p>

                    <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-auto">
                      <div className="flex items-center gap-5">
                       <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">{entry.wordCount} words</span>
                       {entry.linkedItemIds.length > 0 && (
                         <span className="text-[10px] font-bold uppercase tracking-widest text-violet-500/70 group-hover:text-violet-400 transition-colors">
                           🔗 {entry.linkedItemIds.length} artifacts
                         </span>
                       )}
                      </div>
                      <span className="text-[10px] font-mono text-gray-800 group-hover:text-gray-600 transition-colors">#{String(i+1).padStart(2,'0')}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
