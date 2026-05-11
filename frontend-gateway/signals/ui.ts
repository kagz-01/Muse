import { signal } from "@preact/signals";

export const isMenuOpenSignal = signal(false);
export const isCaptureOpenSignal = signal(false);
export const isProfileOpenSignal = signal(false);
export const isNotificationsOpenSignal = signal(false);

export type AppTheme = "dark" | "dim" | "tint" | "light";
export type AppAccentColor = "cyan" | "blue" | "purple" | "pink" | "green" | "yellow" | "red" | "white";
export type AppFontSize = "small" | "medium" | "large";

export type AppNotification = {
  id: string;
  title: string;
  detail: string;
  time: string;
  isRead: boolean;
};

const THEME_STORAGE_KEY = "muse-theme";

const ACCENT_RGB_MAP: Record<AppAccentColor, string> = {
  cyan: "34 211 238",
  blue: "96 165 250",
  purple: "192 132 252",
  pink: "244 114 182",
  green: "74 222 128",
  yellow: "250 204 21",
  red: "248 113 113",
  white: "241 245 249",
};

const FONT_SIZE_MAP: Record<AppFontSize, string> = {
  small: "15px",
  medium: "16px",
  large: "18px",
};

const initialNotifications: AppNotification[] = [
  {
    id: "n-1",
    title: "New reply in Threads",
    detail: "Alex replied to your discussion on Creative Identity.",
    time: "2m ago",
    isRead: false,
  },
  {
    id: "n-2",
    title: "Room activity spike",
    detail: "Brutalist Architecture Room has 5 new captures.",
    time: "16m ago",
    isRead: false,
  },
  {
    id: "n-3",
    title: "Weekly insight ready",
    detail: "Your weekly synthesis report is now available.",
    time: "1h ago",
    isRead: true,
  },
];

export const notificationsSignal = signal<AppNotification[]>(initialNotifications);
export const appThemeSignal = signal<AppTheme>("dark");
export const appAccentSignal = signal<AppAccentColor>("cyan");
export const appFontSizeSignal = signal<AppFontSize>("medium");

function updateStoredAppearance(partial: Partial<{ theme: AppTheme; accentColor: AppAccentColor; fontSize: AppFontSize }>) {
  try {
    const settingsRaw = globalThis.localStorage?.getItem("muse-fresh-settings");
    const parsed = settingsRaw
      ? JSON.parse(settingsRaw) as { appearance?: Record<string, unknown>; [key: string]: unknown }
      : {};

    const next = {
      ...parsed,
      appearance: {
        ...(parsed.appearance ?? {}),
        ...partial,
      },
    };

    globalThis.localStorage?.setItem("muse-fresh-settings", JSON.stringify(next));
  } catch {
    // Best effort persistence.
  }
}

function resolveSavedTheme(): AppTheme {
  try {
    const direct = globalThis.localStorage?.getItem(THEME_STORAGE_KEY);
    if (direct === "light" || direct === "dark") return direct;

    const settingsRaw = globalThis.localStorage?.getItem("muse-fresh-settings");
    if (settingsRaw) {
      const parsed = JSON.parse(settingsRaw) as { appearance?: { theme?: string } };
      if (parsed.appearance?.theme === "light") return "light";
      if (parsed.appearance?.theme === "dark") return "dark";
      if (parsed.appearance?.theme === "system") {
        return globalThis.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }
    }
  } catch {
    // Keep fallback below.
  }

  return "dark";
}

function applyThemeToDocument(theme: AppTheme) {
  const docEl = globalThis.document?.documentElement;
  if (!docEl) return;
  docEl.setAttribute("data-theme", theme);
}

function applyAccentToDocument(accentColor: AppAccentColor) {
  const docEl = globalThis.document?.documentElement;
  if (!docEl) return;
  docEl.style.setProperty("--muse-accent-rgb", ACCENT_RGB_MAP[accentColor]);
}

function applyFontSizeToDocument(fontSize: AppFontSize) {
  const docEl = globalThis.document?.documentElement;
  if (!docEl) return;
  docEl.style.fontSize = FONT_SIZE_MAP[fontSize];
}

export function initializeTheme() {
  const theme = resolveSavedTheme();
  appThemeSignal.value = theme;
  applyThemeToDocument(theme);
}

export function setTheme(theme: AppTheme) {
  appThemeSignal.value = theme;
  applyThemeToDocument(theme);

  try {
    globalThis.localStorage?.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Best effort persistence.
  }

  updateStoredAppearance({ theme });
}

export function toggleTheme() {
  const themes: AppTheme[] = ["dark", "dim", "tint", "light"];
  const currentIndex = themes.indexOf(appThemeSignal.value);
  const nextIndex = (currentIndex + 1) % themes.length;
  setTheme(themes[nextIndex]);
}

export function setAccentColor(accentColor: AppAccentColor) {
  appAccentSignal.value = accentColor;
  applyAccentToDocument(accentColor);
  updateStoredAppearance({ accentColor });
}

export function setGlobalFontSize(fontSize: AppFontSize) {
  appFontSizeSignal.value = fontSize;
  applyFontSizeToDocument(fontSize);
  updateStoredAppearance({ fontSize });
}

export function toggleMenu() {
  isMenuOpenSignal.value = !isMenuOpenSignal.value;
}

export function closeMenu() {
  isMenuOpenSignal.value = false;
}

export function toggleCapture() {
  isCaptureOpenSignal.value = !isCaptureOpenSignal.value;
}

export function toggleProfile() {
  isProfileOpenSignal.value = !isProfileOpenSignal.value;
}

export function toggleNotifications() {
  isNotificationsOpenSignal.value = !isNotificationsOpenSignal.value;
}

export function closeNotifications() {
  isNotificationsOpenSignal.value = false;
}

export function markNotificationRead(id: string) {
  notificationsSignal.value = notificationsSignal.value.map((notification) =>
    notification.id === id ? { ...notification, isRead: true } : notification
  );
}

export function markAllNotificationsRead() {
  notificationsSignal.value = notificationsSignal.value.map((notification) => ({
    ...notification,
    isRead: true,
  }));
}
