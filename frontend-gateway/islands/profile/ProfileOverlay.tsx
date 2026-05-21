import { useState } from "preact/hooks";
import * as Icons from "lucide-preact";
import {
  logout,
  soloModeSignal,
  toggleSoloMode,
  userSignal,
} from "../../signals/user.ts";
import { roomsSignal } from "../../signals/rooms.ts";
import { isProfileOpenSignal, toggleProfile } from "../../signals/ui.ts";
import { PortraitCard } from "../../components/profile/index.ts";
import { PrivacyManager } from "../settings/index.ts";

export default function ProfileOverlay() {
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  const isOpen = isProfileOpenSignal.value;
  const user = userSignal.value;
  const soloMode = soloModeSignal.value;
  const rooms = roomsSignal.value;

  if (!user || !isOpen) return null;

  const activeRooms = rooms.slice().sort((a, b) =>
    (b.count || 0) - (a.count || 0)
  ).slice(0, 3);

  const handleLogout = () => {
    logout();
    toggleProfile();
    if (typeof globalThis !== "undefined") {
      globalThis.location.href = "/auth";
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <PrivacyManager
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />

      {/* Backdrop blur */}
      <div
        onClick={toggleProfile}
        className="absolute inset-0 bg-canvas-bg-dark/80 backdrop-blur-[40px] cursor-pointer"
      />

      <div className="relative w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center animate-in zoom-in-95 duration-500">
        {/* Left side: The Portrait Card */}
        <div className="flex justify-center lg:justify-end">
          <PortraitCard
            user={user}
            activeRooms={activeRooms}
            soloMode={soloMode}
          />
        </div>

        {/* Right side: Management Actions */}
        <div className="flex flex-col gap-6 max-w-md mx-auto lg:mx-0">
          <div className="mb-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-canvas-primary mb-2">
              Persona Control
            </h3>
            <h2 className="text-3xl font-bold tracking-tight text-white italic font-serif">
              Manage your digital replica.
            </h2>
          </div>

          <div className="space-y-3">
            <a
              href="/settings"
              onClick={toggleProfile}
              className="w-full group flex items-center justify-between p-5 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 group-hover:text-white group-hover:bg-canvas-primary transition-all">
                  <Icons.Settings size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Edit Profile</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                    Blocks & Identity
                  </p>
                </div>
              </div>
              <Icons.ChevronRight
                size={16}
                className="text-gray-700 group-hover:text-white transition-colors"
              />
            </a>

            <button
              type="button"
              onClick={toggleSoloMode}
              className="w-full group flex items-center justify-between p-5 rounded-3xl bg-white/[0.03] border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all text-left cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${
                    soloMode
                      ? "bg-canvas-primary/20 border-canvas-primary/40 text-canvas-primary"
                      : "bg-white/5 border-white/10 text-gray-500 group-hover:text-white"
                  }`}
                >
                  <Icons.Shield size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">
                    {soloMode ? "Solo Mode Active" : "Solo Mode Disabled"}
                  </p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                    Privacy & Noise control
                  </p>
                </div>
              </div>
              <div
                className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${
                  soloMode ? "bg-canvas-primary" : "bg-gray-800"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    soloMode ? "translate-x-4" : "translate-x-0"
                  }`}
                >
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setIsPrivacyOpen(true)}
              className="w-full group flex items-center justify-between p-5 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/10 hover:border-emerald-500/20 transition-all text-left cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-500 transition-all">
                  <Icons.Globe size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">
                    Community Settings
                  </p>
                  <p className="text-[10px] text-emerald-500/60 font-bold uppercase tracking-widest">
                    Granular sharing
                  </p>
                </div>
              </div>
              <ChevronRight
                size={16}
                className="text-emerald-500 group-hover:scale-110 transition-transform"
              />
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full group flex items-center justify-between p-5 rounded-3xl bg-white/[0.03] border border-white/10 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all text-left cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 group-hover:text-rose-400 group-hover:bg-rose-500/20 transition-all">
                  <Icons.LogOut size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Logout</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                    End session
                  </p>
                </div>
              </div>
              <Icons.X
                size={16}
                className="text-gray-700 group-hover:text-rose-400 transition-colors"
              />
            </button>
          </div>

          <button
            type="button"
            onClick={toggleProfile}
            className="mt-4 w-full py-4 rounded-3xl border border-white/10 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            Close Persona
          </button>
        </div>
      </div>
    </div>
  );
}
