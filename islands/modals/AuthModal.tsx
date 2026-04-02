import { useState } from "preact/hooks";
import { X } from "lucide-preact";
import { login } from "../../signals/user.ts";

interface AuthModalProps {
  initialMode: 'signup' | 'login';
  onClose: () => void;
}

export default function AuthModal({ initialMode, onClose }: AuthModalProps) {
  const [localMode, setLocalMode] = useState(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    login(email);
    window.location.href = '/dashboard';
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-xl transition-opacity animate-in fade-in duration-300" 
        onClick={onClose}
      />

      <div className="relative w-full max-w-md z-10 animate-in zoom-in-95 duration-300">
        {/* Glow */}
        <div className="absolute -inset-4 bg-canvas-primary/10 blur-3xl rounded-full pointer-events-none" />

        <div className="relative bg-[#0f0f12] border border-white/10 rounded-[2.5rem] p-10 overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.6)]">
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-canvas-primary/15 blur-3xl rounded-full" />
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-violet-600/10 blur-3xl rounded-full" />

          <button
            onClick={onClose}
            type="button"
            className="absolute top-6 right-6 w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-white transition-all cursor-pointer"
          >
            <X size={16} />
          </button>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <img src="/assets/muse-logo.png" alt="Muse" className="h-10 w-10 object-contain rounded-xl" />
              <div>
                <p className="text-[10px] font-bold text-canvas-primary uppercase tracking-[0.3em]">Muse</p>
                <p className="text-xs text-gray-500 font-serif italic">Turn consumption into creation</p>
              </div>
            </div>

            <h2 className="text-3xl font-bold tracking-tight mb-2">
              {localMode === 'signup' ? 'Begin your Muse.' : 'Welcome back.'}
            </h2>
            <p className="text-sm text-gray-500 mb-8 font-serif italic">
              {localMode === 'signup'
                ? 'Your private creative loop starts here.'
                : 'Your rooms are waiting.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {localMode === 'signup' && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName((e.target as HTMLInputElement).value)}
                    placeholder="What shall we call you?"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-700 focus:outline-none focus:border-canvas-primary/40 transition-all text-sm"
                  />
                </div>
              )}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
                  placeholder="you@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-700 focus:outline-none focus:border-canvas-primary/40 transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-700 focus:outline-none focus:border-canvas-primary/40 transition-all text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-canvas-primary text-white font-bold uppercase tracking-widest text-[11px] shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(99,102,241,0.5)] transition-all cursor-pointer mt-2"
              >
                {localMode === 'signup' ? 'Enter Muse →' : 'Continue →'}
              </button>
            </form>

            <p className="text-center text-xs text-gray-600 mt-6">
              {localMode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
              <button
                type="button"
                onClick={() => setLocalMode(localMode === 'signup' ? 'login' : 'signup')}
                className="text-white hover:text-canvas-primary transition-colors font-semibold cursor-pointer"
              >
                {localMode === 'signup' ? 'Log in' : 'Sign up'}
              </button>
            </p>

            <p className="text-center text-[10px] text-gray-700 mt-4 font-serif italic">
              Demo mode — any input (or none) will work
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
