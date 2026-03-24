import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useUserStore } from '../store/useUserStore';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(false);
  const login = useUserStore(state => state.login);
  const navigate = useNavigate();

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    login(); // Mock login logic
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#0f0f0f] text-white">
      <div className="w-full max-w-md bg-[#1c1c1c] p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-canvas-primary/20 blur-[80px] rounded-full"></div>
        
        <div className="text-center mb-10 relative z-10">
           <h2 className="text-3xl font-bold tracking-tight mb-2">{isLogin ? 'Welcome Back' : 'Join Muse'}</h2>
           <p className="text-sm text-gray-400">
             {isLogin ? 'Continue your contemplation.' : 'Your consumption, your collection, your creation.'}
           </p>
        </div>
        
        <form onSubmit={handleAuth} className="space-y-5 relative z-10">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">Name</label>
              <input type="text" required className="w-full bg-[#0a0a0a] border border-white/5 p-4 rounded-xl outline-none focus:border-canvas-primary focus:ring-1 focus:ring-canvas-primary transition-all placeholder-gray-700" placeholder="How should we call you?" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">Email</label>
            <input type="email" required className="w-full bg-[#0a0a0a] border border-white/5 p-4 rounded-xl outline-none focus:border-canvas-primary focus:ring-1 focus:ring-canvas-primary transition-all placeholder-gray-700" placeholder="you@example.com" />
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">Password</label>
             <input type="password" required className="w-full bg-[#0a0a0a] border border-white/5 p-4 rounded-xl outline-none focus:border-canvas-primary focus:ring-1 focus:ring-canvas-primary transition-all placeholder-gray-700" placeholder="••••••••" />
          </div>
          
          <button type="submit" className="w-full py-4 bg-canvas-primary hover:bg-[#4f46e5] hover:-translate-y-0.5 transform duration-200 transition-all rounded-xl font-bold mt-2 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            {isLogin ? 'Log In' : 'Create Account'}
          </button>
        </form>

        {!isLogin && (
          <p className="text-center text-xs text-gray-500 mt-6 relative z-10 px-4">
            Your Canvas is private by default. Only you can see your collections unless you choose to share.
          </p>
        )}
        
        <p className="text-center text-sm text-gray-400 mt-8 relative z-10">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-white font-semibold hover:underline decoration-canvas-primary underline-offset-4">
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  );
}
