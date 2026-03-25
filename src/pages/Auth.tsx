import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { useUserStore } from '../store/useUserStore';
import museLogo from '../assets/muse-logo.png';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(false);
  const login = useUserStore(state => state.login);
  const navigate = useNavigate();

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    login();
    navigate('/dashboard');
  };

  const pillars = ['Consume', 'Collect', 'Contemplate', 'Create'];

  return (
    <div className="min-h-screen w-full flex bg-[#0a0a0a] text-white overflow-hidden">
      {/* Left: Brand Panel */}
      <div className="hidden lg:flex flex-col items-center justify-center flex-1 relative overflow-hidden p-12 border-r border-white/5">
        {/* Ambient glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-canvas-primary/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full" />

        <div className="relative z-10 text-center max-w-sm">
          {/* Logo */}
          <motion.img
            src={museLogo}
            alt="Muse"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="w-52 h-52 object-contain mx-auto mb-8 drop-shadow-[0_0_60px_rgba(99,102,241,0.3)]"
          />

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl font-bold tracking-tight text-white mb-3"
          >
            Muse
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-canvas-primary font-bold uppercase tracking-[0.3em] text-[11px] mb-10"
          >
            Turn consumption into creation
          </motion.p>

          {/* Pillar Loop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-2 flex-wrap"
          >
            {pillars.map((pillar, i) => (
              <React.Fragment key={pillar}>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-3 py-1.5 rounded-full bg-white/5 border border-white/8">
                  {pillar}
                </span>
                {i < pillars.length - 1 && (
                  <span className="text-canvas-primary text-xs">→</span>
                )}
              </React.Fragment>
            ))}
            <span className="text-canvas-primary text-xs">↩</span>
          </motion.div>
        </div>
      </div>

      {/* Right: Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <img src={museLogo} alt="Muse" className="h-10 w-10 object-contain rounded-xl" />
            <span className="text-xl font-bold text-white">Muse</span>
          </div>

          <div className="bg-white/[0.03] p-8 rounded-4xl border border-white/8 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-32 -left-32 w-64 h-64 bg-canvas-primary/15 blur-[80px] rounded-full pointer-events-none" />
            <div className="relative z-10">
              <div className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight mb-2">
                  {isLogin ? 'Welcome back.' : 'Begin your Muse.'}
                </h2>
                <p className="text-sm text-gray-400 font-serif italic">
                  {isLogin ? 'Continue your contemplation.' : 'Your private space. Your creative loop.'}
                </p>
              </div>

              <form onSubmit={handleAuth} className="space-y-5">
                {!isLogin && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Name</label>
                    <input
                      type="text"
                      required
                      className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-canvas-primary focus:ring-1 focus:ring-canvas-primary transition-all placeholder-gray-700 text-white"
                      placeholder="How should we call you?"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Email</label>
                  <input
                    type="email"
                    required
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-canvas-primary focus:ring-1 focus:ring-canvas-primary transition-all placeholder-gray-700 text-white"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Password</label>
                  <input
                    type="password"
                    required
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-canvas-primary focus:ring-1 focus:ring-canvas-primary transition-all placeholder-gray-700 text-white"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-canvas-primary hover:bg-[#4f46e5] hover:-translate-y-0.5 transform duration-200 transition-all rounded-2xl font-bold mt-2 shadow-[0_0_20px_rgba(99,102,241,0.2)] cursor-pointer"
                >
                  {isLogin ? 'Log In' : 'Create Account'}
                </button>
              </form>

              {!isLogin && (
                <p className="text-center text-xs text-gray-600 mt-5 font-serif italic">
                  Your Muse is private by default. Only you see your collections unless you choose to share.
                </p>
              )}

              <p className="text-center text-sm text-gray-500 mt-6">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-white font-semibold hover:underline decoration-canvas-primary underline-offset-4 cursor-pointer"
                >
                  {isLogin ? 'Sign up' : 'Log in'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
