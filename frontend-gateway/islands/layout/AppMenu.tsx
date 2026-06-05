import { useState } from "preact/hooks";
import {
  AppAccentColor,
  appAccentSignal,
  closeMenu,
  customAccentHexSignal,
  hslToHex,
  isMenuOpenSignal,
  setAccentColor,
  setCustomAccentHex,
} from "../../signals/ui.ts";
import { resonanceModeSignal } from "../../signals/resonance.ts";
import * as Icons from "lucide-preact";
import { userSignal } from "../../signals/user.ts";
import NotificationContainer from "../../components/notifications/NotificationContainer.tsx";

interface AppMenuProps {
  currentPath: string;
}

export default function AppMenu({ currentPath }: AppMenuProps) {
  const isOpen = isMenuOpenSignal.value;
  const user = userSignal.value;
  const isDemo = user?.email === "demo@muse.app";

  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customHue, setCustomHue] = useState(200);
  const [customSaturation, setCustomSaturation] = useState(100);
  const [customLightness, setCustomLightness] = useState(60);

  // Muse 2.0 Unified Lifecycle Flow
  const cycleNav = [
    {
      label: "Home",
      path: "/dashboard",
      icon: <Icons.Home size={24} />,
      desc: "Awareness",
    },
    {
      label: "Rooms",
      path: "/rooms",
      icon: <Icons.Layout size={24} />,
      desc: "Collection",
    },
    {
      label: "Threads",
      path: "/threads",
      icon: <Icons.GitCommit size={24} />,
      desc: "Synthesize",
    },
    {
      label: "Journal",
      path: "/journal",
      icon: <Icons.BookOpen size={24} />,
      desc: "Contemplate",
    },
    {
      label: "Community",
      path: "/connections",
      icon: <Icons.Users size={24} />,
      desc: "Collective",
    },
  ];

  const isActive = (path: string) => currentPath.startsWith(path);

  const presetAccents: AppAccentColor[] = [
    "cyan",
    "blue",
    "pink",
    "green",
    "yellow",
    "red",
    "white",
  ];

  const liveCustomHex = hslToHex(customHue, customSaturation, customLightness);
  const resonanceMode = resonanceModeSignal.value;
  const isHidden = resonanceMode === "deep" || resonanceMode === "cinematic";

  return (
    <>
      {/* UNIVERSAL BOTTOM NAVIGATION (Cycle Bar) */}
      <nav className={`fixed bottom-0 left-0 w-full bg-[var(--muse-surface)]/90 backdrop-blur-3xl border-t border-[var(--muse-border)] flex justify-around items-center h-20 px-4 md:px-32 z-[60] pb-safe transition-all duration-700 ease-in-out ${isHidden ? "translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100"}`}>
        {cycleNav.map((item) => (
          <a
            key={item.label}
            href={item.path}
            className="relative group flex flex-col items-center justify-center w-16 h-full transition-all duration-300"
          >
            {/* Active Glow Indicator */}
            {isActive(item.path) && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-12 h-12 bg-canvas-primary/20 blur-md rounded-full animate-pulse" />
                <div className="absolute w-8 h-8 bg-canvas-primary/40 blur-sm rounded-full" />
              </div>
            )}

            <div
              className={`relative z-10 flex flex-col items-center gap-1 transition-all duration-300 ${
                isActive(item.path)
                  ? "text-canvas-primary scale-110 -translate-y-1"
                  : "text-[var(--muse-muted)] hover:text-[var(--muse-text)]"
              }`}
            >
              <div
                className={isActive(item.path)
                  ? "drop-shadow-[0_0_8px_rgba(var(--muse-accent-rgb),0.8)]"
                  : "group-hover:drop-shadow-[0_0_8px_rgba(var(--muse-accent-rgb),0.4)]"}
              >
                {item.icon}
              </div>
              <span
                className={`text-[9px] font-bold uppercase tracking-widest transition-all duration-300 ${
                  isActive(item.path)
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 absolute -bottom-4"
                }`}
              >
                {item.label}
              </span>
            </div>
          </a>
        ))}
      </nav>

      {/* DRAWER MENU (Secondary Actions) */}
      <div
        className={`fixed inset-0 z-[70] flex justify-end transition-opacity duration-300 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          onClick={closeMenu}
          className="absolute inset-0 bg-[var(--muse-bg)]/60 backdrop-blur-md cursor-pointer"
        />

        <div
          className={`relative w-full max-w-[320px] h-full bg-[var(--muse-surface)] border-l border-[var(--muse-border)] shadow-2xl flex flex-col p-8 overflow-y-auto transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-[10px] font-bold text-canvas-primary uppercase tracking-[0.3em]">
              System Menu
            </h2>
            <button
              type="button"
              onClick={closeMenu}
              className="p-2 bg-[var(--muse-surface-soft)] rounded-xl text-[var(--muse-muted)] hover:text-[var(--muse-text)] transition-all cursor-pointer duration-300"
            >
              <Icons.X size={20} />
            </button>
          </div>

          <div className="flex flex-col flex-1">
            {/* PROFILE HEAD – Centered large avatar + single display name */}
            <div className="flex flex-col items-center gap-3 mb-8">
              <div className="relative group">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 overflow-hidden border-2 border-[var(--muse-border)] shadow-xl transition-transform duration-300 group-hover:scale-105">
                  {user?.avatarUrl
                    ? (
                      <img
                        src={user.avatarUrl}
                        className="w-full h-full object-cover"
                        alt={user.name}
                      />
                    )
                    : (
                      <div className="w-full h-full flex items-center justify-center text-4xl md:text-5xl text-[var(--muse-text)] font-bold">
                        {user?.name?.charAt(0) || "M"}
                      </div>
                    )}
                </div>
                {/* Subtle glow ring */}
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-canvas-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-sm" />
              </div>
              <h3 className="text-sm font-bold text-[var(--muse-text)] tracking-tight text-center">
                {user?.name}
              </h3>
            </div>

            {/* MAIN NAVIGATION LIST – Profile & Settings only */}
            <div className="flex flex-col gap-1 space-y-1">
              <a
                href={isDemo ? "/" : "/profile"}
                onClick={closeMenu}
                className="flex items-center gap-4 p-3 rounded-2xl text-[var(--muse-muted)] hover:text-[var(--muse-text)] hover:bg-[var(--muse-surface-soft)] transition-colors"
              >
                <Icons.User size={20} />
                <span className="text-xs font-bold uppercase tracking-widest">
                  {isDemo ? "Establish Soul Link" : "Profile"}
                </span>
              </a>

              <a
                href={isDemo ? "/" : "/settings"}
                onClick={isDemo
                  ? (e) => {
                    e.preventDefault();
                    globalThis.location.href = "/";
                  }
                  : closeMenu}
                className="flex items-center gap-4 p-3 rounded-2xl text-[var(--muse-muted)] hover:text-[var(--muse-text)] hover:bg-[var(--muse-surface-soft)] transition-colors relative"
              >
                <Icons.Settings size={20} />
                <span className="text-xs font-bold uppercase tracking-widest">
                  Settings
                </span>
                {isDemo && (
                  <Icons.Lock
                    size={12}
                    className="absolute right-4 opacity-50"
                  />
                )}
              </a>
            </div>

            {/* SYSTEM RESONANCE – Accent Color Palette */}
            <div className="mt-8 px-3">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--muse-muted)] mb-3 block px-1">
                System Resonance
              </span>

              {/* Preset accent swatches */}
              <div className="flex flex-wrap gap-2 mb-3">
                {presetAccents.map((color) => (
                  <button
                    type="button"
                    key={color}
                    onClick={() => {
                      setAccentColor(color);
                      setShowCustomPicker(false);
                    }}
                    className={`w-5 h-5 rounded-full border transition-all hover:scale-110 active:scale-90 cursor-pointer ${
                      appAccentSignal.value === color &&
                        !customAccentHexSignal.value
                        ? "border-[var(--muse-text)] scale-110 shadow-md"
                        : "border-transparent"
                    }`}
                    style={{
                      backgroundColor: color === "white" ? "#f1f5f9" : color,
                    }}
                  />
                ))}

                {/* Custom color toggle */}
                <button
                  type="button"
                  onClick={() => setShowCustomPicker(!showCustomPicker)}
                  className={`w-5 h-5 rounded-full border transition-all hover:scale-110 active:scale-90 cursor-pointer flex items-center justify-center ${
                    showCustomPicker || customAccentHexSignal.value
                      ? "border-[var(--muse-text)] scale-110 shadow-md"
                      : "border-[var(--muse-muted)]"
                  }`}
                  style={{
                    background:
                      "conic-gradient(from 0deg, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)",
                  }}
                  title="Custom color"
                />
              </div>

              {/* Custom HSL Color Picker (inline) */}
              {showCustomPicker && (
                <div className="space-y-3 bg-[var(--muse-surface-soft)] rounded-xl p-4 border border-[var(--muse-border)] animate-in slide-in-from-top-2 duration-200">
                  {/* Hue Strip */}
                  <div>
                    <div
                      className="w-full h-5 rounded-lg overflow-hidden mb-2 border border-[var(--muse-border)]"
                      style={{
                        background:
                          `linear-gradient(to right, hsl(0,100%,60%), hsl(60,100%,60%), hsl(120,100%,60%), hsl(180,100%,60%), hsl(240,100%,60%), hsl(300,100%,60%), hsl(360,100%,60%))`,
                      }}
                    >
                      <div
                        className="w-0.5 h-full bg-white border border-white/50 shadow pointer-events-none"
                        style={{
                          marginLeft: `${(customHue / 360) * 100}%`,
                        }}
                      />
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={customHue}
                      onInput={(e) => {
                        const v = Number(
                          (e.target as HTMLInputElement).value,
                        );
                        setCustomHue(v);
                        setCustomAccentHex(
                          hslToHex(v, customSaturation, customLightness),
                        );
                      }}
                      className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-canvas-primary"
                    />
                  </div>

                  {/* Saturation */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[8px] font-bold uppercase tracking-widest text-[var(--muse-muted)]">
                        Saturation
                      </span>
                      <span className="text-[8px] font-bold text-canvas-primary">
                        {customSaturation}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={customSaturation}
                      onInput={(e) => {
                        const v = Number(
                          (e.target as HTMLInputElement).value,
                        );
                        setCustomSaturation(v);
                        setCustomAccentHex(
                          hslToHex(customHue, v, customLightness),
                        );
                      }}
                      className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-canvas-primary"
                    />
                  </div>

                  {/* Lightness */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[8px] font-bold uppercase tracking-widest text-[var(--muse-muted)]">
                        Lightness
                      </span>
                      <span className="text-[8px] font-bold text-canvas-primary">
                        {customLightness}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="90"
                      value={customLightness}
                      onInput={(e) => {
                        const v = Number(
                          (e.target as HTMLInputElement).value,
                        );
                        setCustomLightness(v);
                        setCustomAccentHex(
                          hslToHex(customHue, customSaturation, v),
                        );
                      }}
                      className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-canvas-primary"
                    />
                  </div>

                  {/* Preview */}
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-lg border border-[var(--muse-border)] shadow-lg"
                      style={{ backgroundColor: liveCustomHex }}
                    />
                    <span className="text-[10px] font-mono text-[var(--muse-muted)]">
                      {liveCustomHex}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-auto pt-8 pb-4 px-2">
              <p className="text-center text-[8px] font-bold text-[var(--muse-muted)] opacity-50 uppercase tracking-[0.4em]">
                Muse v2.0 • Phase Alpha
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Container */}
      <NotificationContainer />
    </>
  );
}
