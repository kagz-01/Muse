import { useEffect, useState } from "react";
import AuthModal from "../modals/AuthModal.tsx";
import SpectralHero from "./SpectralHero.tsx";
import LiveDashboardSimulation from "./LiveDashboardSimulation.tsx";
import LandingFooter from "./LandingFooter.tsx";
import DemoVideo from "./DemoVideo.tsx";
import BrandModal from "./BrandModal.tsx";
import * as Icons from "lucide-react";

type AppTheme = "dark" | "dim" | "tint" | "light";

const themes: AppTheme[] = ["dark", "dim", "tint", "light"];
const accentColors: Record<string, { dark: string; light: string }> = {
  cyan: { dark: "34 211 238", light: "8 145 178" },
  blue: { dark: "96 165 250", light: "37 99 235" },
  purple: { dark: "192 132 252", light: "147 51 234" },
  pink: { dark: "244 114 182", light: "219 39 119" },
  green: { dark: "74 222 128", light: "22 163 74" },
  yellow: { dark: "250 204 21", light: "202 138 4" },
  red: { dark: "248 113 113", light: "220 38 38" },
  white: { dark: "241 245 249", light: "15 23 42" },
};
const appearanceAttributes: Record<string, string> = {
  compactMode: "data-compact",
  animations: "data-animations",
  reduceMotion: "data-reduce-motion",
};

function isAppTheme(value: string | null): value is AppTheme {
  return themes.some((theme) => theme === value);
}

export default function LandingPage() {
  const [authMode, setAuthMode] = useState<"login" | "signup" | null>(null);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [isBrandOpen, setIsBrandOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<AppTheme>("dark");
  const [entryError, setEntryError] = useState("");

  useEffect(() => {
    let theme: AppTheme = "dark";
    let appearance: Record<string, unknown> = {};
    try {
      const savedTheme = globalThis.localStorage.getItem("muse-theme");
      if (isAppTheme(savedTheme)) {
        theme = savedTheme;
      }

      const settings = globalThis.localStorage.getItem("muse-fresh-settings");
      if (settings) {
        appearance = JSON.parse(settings)?.appearance ?? {};
        const savedAppearanceTheme = appearance.theme;
        if (
          !isAppTheme(savedTheme) &&
          typeof savedAppearanceTheme === "string" &&
          isAppTheme(savedAppearanceTheme)
        ) {
          theme = savedAppearanceTheme;
        } else if (
          !isAppTheme(savedTheme) &&
          savedAppearanceTheme === "system"
        ) {
          theme = globalThis.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
        }
      }
    } catch (error) {
      console.error("Unable to restore the saved theme preference.", error);
    }

    setCurrentTheme(theme);
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    const isLightTheme = theme === "light" || theme === "tint";
    const savedAccent = appearance.accentColor;
    const accent = typeof savedAccent === "string" && accentColors[savedAccent]
      ? accentColors[savedAccent]
      : accentColors.cyan;
    root.style.setProperty(
      "--muse-accent-rgb",
      isLightTheme ? accent.light : accent.dark,
    );
    const customAccentHex = appearance.customAccentHex;
    const customAccent = typeof customAccentHex === "string"
      ? /^#?([0-9a-f]{6})$/i.exec(customAccentHex)
      : null;

    if (customAccent) {
      const hex = customAccent[1];
      root.style.setProperty(
        "--muse-accent-rgb",
        `${parseInt(hex.slice(0, 2), 16)} ${parseInt(hex.slice(2, 4), 16)} ${
          parseInt(hex.slice(4, 6), 16)
        }`,
      );
    }

    for (const setting of ["compactMode", "animations", "reduceMotion"]) {
      const value = appearance[setting];
      if (typeof value === "boolean") {
        root.setAttribute(appearanceAttributes[setting], String(value));
      }
    }

    const fontSizes: Record<string, string> = {
      small: "15px",
      medium: "16px",
      large: "18px",
    };
    if (typeof appearance.fontSize === "string" && fontSizes[appearance.fontSize]) {
      root.style.fontSize = fontSizes[appearance.fontSize];
    }
  }, []);

  const handleToggleTheme = () => {
    const currentIndex = themes.indexOf(currentTheme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setCurrentTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);

    try {
      globalThis.localStorage.setItem("muse-theme", nextTheme);
    } catch (error) {
      console.error("Unable to save the theme preference.", error);
    }

    try {
      const settingsRaw = globalThis.localStorage.getItem("muse-fresh-settings");
      const settings = settingsRaw ? JSON.parse(settingsRaw) : {};
      globalThis.localStorage.setItem(
        "muse-fresh-settings",
        JSON.stringify({
          ...settings,
          appearance: { ...settings.appearance, theme: nextTheme },
        }),
      );
    } catch (error) {
      console.error("Unable to update the saved appearance settings.", error);
    }
  };

  const handleWatchDemo = () => {
    setIsDemoOpen(true);
  };

  // Demo entry: use a server-side POST and verify the cookie-based session
  // before navigating to the dashboard.
  const handleGuestEntry = async () => {
    setEntryError("");
    try {
      const demoResponse = await fetch("/api/auth/demo", {
        method: "POST",
        credentials: "same-origin",
        redirect: "manual",
      });

      if (
        !demoResponse.ok &&
        demoResponse.type !== "opaqueredirect" &&
        (demoResponse.status < 300 || demoResponse.status >= 400)
      ) {
        setEntryError("Unable to start a guest session. Please try again.");
        return;
      }

      const sessionResponse = await fetch("/api/auth/session", {
        credentials: "same-origin",
      });

      if (!sessionResponse.ok) {
        setEntryError("The guest session could not be verified. Please try again.");
        return;
      }

      const session = await sessionResponse.json();
      if (!session?.isDemo) {
        setEntryError("The guest session could not be verified. Please try again.");
        return;
      }

      globalThis.location.href = "/dashboard";
    } catch (error) {
      console.error("Unable to start a guest session.", error);
      setEntryError("A network error prevented guest access. Please try again.");
    }
  };

  return (
    <div className="bg-[var(--muse-bg)] text-[var(--muse-text)] font-sans overflow-x-hidden selection:bg-canvas-primary selection:text-white transition-colors duration-300">
      {authMode && (
        <AuthModal
          initialMode={authMode}
          onClose={() => setAuthMode(null)}
        />
      )}

      {isDemoOpen && (
        <DemoVideo
          isOpen={isDemoOpen}
          onClose={() => setIsDemoOpen(false)}
        />
      )}

      {isBrandOpen && (
        <BrandModal
          onClose={() => setIsBrandOpen(false)}
          onOpenAuth={setAuthMode}
        />
      )}

      {/* DYNAMIC BACKGROUND VIDEO (Observer Perspective) */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--muse-bg)] via-transparent to-[var(--muse-bg)] z-10 transition-colors duration-300" />
        {/* We would use a real loop video here. For now, we simulate with a pulse and movement */}
        <div className="absolute inset-0 bg-gradient-radial from-canvas-primary/20 to-transparent animate-slow-pulse blur-[150px]" />
      </div>

      {/* Header: The Command Bar */}
      <div className="fixed top-0 left-0 w-full px-4 md:px-8 py-6 z-[100] flex justify-center pointer-events-none">
        <header className="w-full max-w-6xl px-6 py-4 flex justify-between items-center backdrop-blur-3xl bg-[var(--muse-bg)]/80 border border-[var(--muse-border)] rounded-[3rem] shadow-[0_20px_40px_rgba(0,0,0,0.2)] pointer-events-auto transition-colors duration-300 relative overflow-hidden group/header">
          {/* Subtle hover gradient inside header */}
          <div className="absolute inset-0 bg-gradient-to-r from-canvas-primary/5 via-transparent to-indigo-500/5 opacity-0 group-hover/header:opacity-100 transition-opacity duration-700 pointer-events-none" />

          <div
            className="flex items-center gap-4 group cursor-pointer relative z-10"
            onClick={() => setIsBrandOpen(true)}
          >
            <div className="relative">
              <div className="h-10 w-10 bg-[var(--muse-text)] rounded-2xl flex items-center justify-center text-[var(--muse-bg)] font-bold shadow-[0_0_20px_rgba(255,255,255,0.1)] group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <Icons.Infinity size={24} strokeWidth={2.5} />
              </div>
            </div>
            <span className="text-xl font-bold tracking-tighter text-[var(--muse-text)] leading-none transition-colors duration-300">
              MUSE
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 relative z-10">
            {[
              { label: "Manifesto", href: "#about" },
              { label: "Ecosystem", href: "#ecosystem" },
              { label: "Live Ledger", href: "#ledger" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById(link.href.slice(1));
                  if (el) {
                    el.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }
                }}
                className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muse-muted)] hover:text-[var(--muse-text)] transition-colors duration-300"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4 sm:gap-6 relative z-10">
            <button
              type="button"
              onClick={handleToggleTheme}
              className="w-10 h-10 rounded-full bg-[var(--muse-surface)] border border-[var(--muse-border)] hover:border-[var(--muse-text)]/20 flex items-center justify-center transition-all text-[var(--muse-muted)] hover:text-[var(--muse-text)] duration-300"
              title={`Switch to next theme (Current: ${currentTheme})`}
            >
              {currentTheme === "dark" && <Icons.Moon size={16} />}
              {currentTheme === "dim" && (
                <Icons.Circle size={14} fill="currentColor" />
              )}
              {currentTheme === "tint" && <Icons.CloudSun size={16} />}
              {currentTheme === "light" && (
                <Icons.Sun size={16} fill="currentColor" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setAuthMode("login")}
              className="text-[10px] font-bold uppercase tracking-widest text-[var(--muse-muted)] hover:text-[var(--muse-text)] transition-colors hidden sm:block duration-300"
            >
              Auth
            </button>
            <button
              type="button"
              onClick={() => setAuthMode("signup")}
              className="group relative px-6 py-3 rounded-full bg-[var(--muse-text)] text-[var(--muse-bg)] text-[10px] font-bold uppercase tracking-widest shadow-[0_0_20px_var(--muse-text)]/10 hover:shadow-[0_0_30px_var(--muse-text)]/30 hover:-translate-y-0.5 active:scale-95 transition-all cursor-pointer overflow-hidden duration-300 border border-transparent hover:border-white/20"
            >
              <div className="absolute inset-0 bg-canvas-primary/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
              <span className="relative z-10 flex items-center gap-2">
                Init Sequence{" "}
                <Icons.ArrowRight
                  size={12}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </span>
            </button>
          </div>
        </header>
      </div>

      <main className="relative z-10 pt-20">
        {entryError && (
          <p
            role="alert"
            className="fixed top-28 left-1/2 z-[150] -translate-x-1/2 rounded-full border border-red-400/30 bg-black/90 px-5 py-3 text-center text-sm text-red-200 shadow-xl"
          >
            {entryError}
          </p>
        )}
        <SpectralHero
          onOpenAuth={setAuthMode}
          onWatchDemo={handleWatchDemo}
          onGuestEntry={handleGuestEntry}
        />

        <LiveDashboardSimulation viewerMode="guest" />

        <LandingFooter />
      </main>

      <style>
        {`
        @keyframes slow-pulse {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.25; transform: scale(1.05); }
        }
        .animate-slow-pulse {
          animation: slow-pulse 15s infinite ease-in-out;
        }
        html { scroll-behavior: smooth; }
      `}
      </style>
    </div>
  );
}
