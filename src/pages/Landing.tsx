import React from 'react';
import { useNavigate } from 'react-router';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function Landing() {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  
  // Section 1: Consume (Noise)
  const consumeOpacity = useTransform(scrollYProgress, [0, 0.2, 0.3], [1, 1, 0]);
  const consumeY = useTransform(scrollYProgress, [0, 0.3], [0, -100]);

  // Section 2: Collect (Intentional)
  const collectOpacity = useTransform(scrollYProgress, [0.25, 0.4, 0.55, 0.65], [0, 1, 1, 0]);
  const collectY = useTransform(scrollYProgress, [0.25, 0.4, 0.65], [50, 0, -100]);

  // Section 3: Contemplate (Journal)
  const contemplateOpacity = useTransform(scrollYProgress, [0.6, 0.75, 0.85, 0.95], [0, 1, 1, 0]);
  const contemplateY = useTransform(scrollYProgress, [0.6, 0.75, 0.95], [50, 0, -100]);

  // Section 4: Create (Output)
  const createOpacity = useTransform(scrollYProgress, [0.9, 1], [0, 1]);
  const createY = useTransform(scrollYProgress, [0.9, 1], [50, 0]);

  return (
    <div className="bg-canvas-bg-dark text-white font-sans overflow-x-hidden relative">
      {/* Background ambient light */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-canvas-primary/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 blur-[120px] rounded-full"></div>
      </div>

      {/* Global Header */}
      <header className="fixed top-0 left-0 w-full p-6 md:px-12 flex justify-between items-center z-50">
        <div className="text-2xl font-bold tracking-tight">Muse</div>
        <button onClick={() => navigate('/dashboard')} className="text-sm font-medium text-gray-300 hover:text-white transition-colors px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/5">
          Sign In
        </button>
      </header>

      {/* 4-Act Story Scroller */}
      <div className="h-[400vh] w-full relative z-10">
        <div className="sticky top-0 h-screen w-full flex items-center justify-center p-6 text-center">
          
          {/* Act 1: Consume */}
          <motion.div style={{ opacity: consumeOpacity, y: consumeY }} className="absolute w-full max-w-2xl mx-auto px-6">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">The Infinite Scroll.</h1>
            <p className="text-xl text-gray-500 max-w-lg mx-auto leading-relaxed">
              Algorithms dictate your attention. Thousands of fleeting moments, swallowed by the void.
            </p>
            <div className="text-sm text-gray-600 mt-12 animate-pulse flex flex-col items-center gap-2">
               <span>Scroll to pause</span>
               <div className="w-px h-12 bg-gradient-to-b from-gray-600 to-transparent"></div>
            </div>
          </motion.div>

          {/* Act 2: Collect */}
          <motion.div style={{ opacity: collectOpacity, y: collectY }} className="absolute w-full max-w-2xl mx-auto px-6 pointer-events-none">
            <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-canvas-primary">The Intentional Pause.</h2>
            <p className="text-xl text-gray-400 max-w-lg mx-auto leading-relaxed font-serif italic pb-4">
              "What resonates with you?"
            </p>
            <p className="text-lg text-gray-500 max-w-lg mx-auto leading-relaxed">
              Stop endlessly consuming. Take a breath. Save it to your private Canvas. 
            </p>
          </motion.div>

          {/* Act 3: Contemplate */}
          <motion.div style={{ opacity: contemplateOpacity, y: contemplateY }} className="absolute w-full max-w-2xl mx-auto px-6 pointer-events-none">
            <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">Connect The Dots.</h2>
            <p className="text-xl text-gray-400 max-w-lg mx-auto leading-relaxed">
              Every detail you save forms a thread. Understand your patterns, reflect in your Journal, and see the mirror of your mind.
            </p>
          </motion.div>

          {/* Act 4: Create */}
          <motion.div style={{ opacity: createOpacity, y: createY }} className="absolute w-full max-w-2xl mx-auto px-6">
            <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-2xl mb-8 flex items-center justify-center shadow-2xl mx-auto">
              <span className="text-4xl font-serif italic tracking-tighter mix-blend-screen opacity-90">M</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">Muse.</h2>
            <p className="text-xl text-gray-400 mb-12 max-w-lg mx-auto leading-relaxed">
              Your consumption, your collection, your creation. An intentional sanctuary for the digital age.
            </p>
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-8 py-4 bg-canvas-primary hover:bg-[#4f46e5] text-white rounded-full font-medium transition-all text-lg shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_40px_rgba(99,102,241,0.5)] transform hover:-translate-y-1 active:scale-95 duration-200"
            >
              Start Your Muse
            </button>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
