import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';
import { useItemsStore } from '../../store/useItemsStore';

interface CaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CaptureModal({ isOpen, onClose }: CaptureModalProps) {
  const [url, setUrl] = useState('');
  const [note, setNote] = useState('');
  const addItem = useItemsStore(state => state.addItem);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleCapture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    // Create short title from URL domain for MVP
    let title = 'Captured Artifact';
    try {
      title = new URL(url).hostname;
    } catch(e) {}

    addItem({
      roomId: '1', // Default to first room
      title,
      sourceUrl: url,
      note
    });
    
    setUrl('');
    setNote('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment>
          {/* Extremely dark backdrop emphasizing "the pause" */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#000000]/95 backdrop-blur-3xl z-[100]"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-6 pointer-events-none"
          >
            <div className="w-full max-w-xl pointer-events-auto">
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white transition-colors rounded-full hover:bg-white/5"
              >
                <X size={24} />
              </button>
              
              <h2 className="text-4xl text-center font-serif font-medium tracking-tight mb-10 text-white leading-tight">
                What resonated with you?
              </h2>
              
              <form onSubmit={handleCapture} className="space-y-6">
                <input 
                  type="url"
                  required
                  placeholder="Paste link here..."
                  autoFocus
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-white/20 focus:border-canvas-primary text-2xl p-4 text-center outline-none transition-colors placeholder-gray-600 font-sans"
                />
                
                <input 
                  type="text"
                  placeholder="Add a contemplation (optional)..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-transparent border-b border-white/10 focus:border-white/40 text-lg p-2 text-center outline-none transition-colors placeholder-gray-700 font-serif italic"
                />
                
                <div className="flex justify-center pt-8">
                  <button type="submit" className="px-8 py-4 bg-white text-black hover:bg-gray-200 transition-colors rounded-full font-medium flex items-center gap-2 shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                    <Download size={18} /> Collect into Muse
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
}
