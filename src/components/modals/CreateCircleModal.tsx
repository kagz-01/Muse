import React, { useState, useRef, useEffect } from 'react';
import { X, ArrowRight, Globe } from 'lucide-react';
import { useConnectionsStore } from '../../store/useConnectionsStore';

interface Props { onClose: () => void; }

const THEME_OPTIONS = ['Silence', 'Brutalism', 'Identity', 'Urban Voids', 'Scale', 'Memory', 'Flow State', 'Aesthetics'];

export default function CreateCircleModal({ onClose }: Props) {
    const { createCircle } = useConnectionsStore();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [theme, setTheme] = useState(THEME_OPTIONS[0]);
    const [error, setError] = useState('');

    const nameRef = useRef<HTMLInputElement>(null);

    useEffect(() => { nameRef.current?.focus(); }, []);
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    const handleCreate = () => {
        if (!name.trim()) { setError('Give your circle a name.'); return; }
        if (!description.trim()) { setError('Provide a brief inspiration or descriptive thesis.'); return; }

        try {
            createCircle(name.trim(), theme, description.trim());
            onClose();
        } catch (err) {
            setError('Failed to establish circle.');
        }
    };

    return (
        <div onClick={handleBackdropClick} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg bg-[#111318] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto">

                {/* Ambient glow */}
                <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-500 bg-canvas-primary" />

                <div className="relative z-10 p-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-7">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2"><Globe size={20} className="text-canvas-primary" /> Create a Circle</h2>
                            <p className="text-sm text-gray-400 mt-1 font-serif italic">Form a collective intelligence hub.</p>
                        </div>
                        <button onClick={onClose} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Circle Name */}
                    <div className="mb-5">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Circle Name *</label>
                        <input
                            ref={nameRef}
                            value={name}
                            onChange={e => { setName(e.target.value); setError(''); }}
                            onKeyDown={e => { if (e.key === 'Enter') handleCreate(); }}
                            placeholder="e.g. Sonic Synthesis"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-canvas-primary/50 transition-all text-base font-medium tracking-tight"
                        />
                        {error && <p className="text-rose-400 text-xs mt-2 font-medium">{error}</p>}
                    </div>

                    {/* Core Theme */}
                    <div className="mb-6">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Core Theme Focus</label>
                        <div className="flex flex-wrap gap-2">
                            {THEME_OPTIONS.map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => setTheme(opt)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${theme === opt ? 'bg-canvas-primary text-white shadow-md shadow-canvas-primary/20 scale-105' : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'}`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Description / Thesis */}
                    <div className="mb-8">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Inspirations & Opinions (Description) *</label>
                        <textarea
                            value={description} onChange={e => { setDescription(e.target.value); setError(''); }}
                            placeholder="What perspectives and ideas will you exchange with friends, family, or like-minded peers?"
                            rows={4}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-canvas-primary/50 transition-all text-sm font-serif italic leading-relaxed resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <button onClick={onClose} className="flex-1 py-4 rounded-2xl border border-white/10 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer">
                            Cancel
                        </button>
                        <button onClick={handleCreate}
                            className="flex-[2] py-4 rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-xl bg-canvas-primary text-white transition-all cursor-pointer hover:-translate-y-0.5 active:scale-95 hover:shadow-canvas-primary/40 shadow-canvas-primary/20"
                        >
                            Establish Circle <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
