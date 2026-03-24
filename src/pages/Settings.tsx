import React from 'react';
import { useUserStore } from '../store/useUserStore';

export default function Settings() {
  const { soloMode, toggleSoloMode, logout } = useUserStore();

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto pb-24 md:pb-10 h-full">
      <header className="mb-10">
        <h2 className="text-3xl font-bold tracking-tight mb-2">Settings</h2>
        <p className="text-gray-400">Manage your Muse experience.</p>
      </header>
      
      <div className="space-y-6">
        <section className="bg-[#1c1c1c] p-6 rounded-3xl border border-white/5 shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-white/90">Privacy & Security</h3>
          <div className="flex items-center justify-between py-4 border-b border-white/5">
            <div>
              <p className="font-medium text-lg">Solo Mode</p>
              <p className="text-sm text-gray-500 max-w-xs mt-1 leading-relaxed">When active, your Canvas is completely invisible. No social features will be accessible.</p>
            </div>
            <button 
              onClick={toggleSoloMode}
              className={`w-14 h-8 rounded-full transition-colors relative ${soloMode ? 'bg-[#10B981]' : 'bg-[#333]'}`}
            >
              <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-all shadow-md ${soloMode ? 'left-7' : 'left-1'}`}></div>
            </button>
          </div>
          <div className="flex items-center justify-between py-4">
             <div>
               <p className="font-medium">Public Portrait Visibility</p>
               <p className="text-sm text-gray-500 mt-1">Control who can see your curated rooms.</p>
             </div>
             <button className="text-sm px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white font-medium transition-colors">Manage</button>
          </div>
        </section>

        <section className="bg-[#1c1c1c] p-6 rounded-3xl border border-white/5 shadow-lg flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-1 text-red-400">Account</h3>
            <p className="text-sm text-gray-500">Log out of your active session on this device.</p>
          </div>
          <button onClick={logout} className="px-6 py-3 border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors rounded-xl font-medium">
            Log Out
          </button>
        </section>
      </div>
    </div>
  );
}
