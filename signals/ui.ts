import { signal } from "@preact/signals";

export const isMenuOpenSignal = signal(false);
export const isCaptureOpenSignal = signal(false);
export const isProfileOpenSignal = signal(false);
export const isNotificationsOpenSignal = signal(false);

export type AppTheme = "dark" | "light";

export type AppNotification = {
  id: string;
  title: string;
  detail: string;
  time: string;
  isRead: boolean;
};

const THEME_STORAGE_KEY = "muse-theme";

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

    const settingsRaw = globalThis.localStorage?.getItem("muse-fresh-settings");
    if (settingsRaw) {
      const parsed = JSON.parse(settingsRaw) as {
        appearance?: { theme?: string };
        [key: string]: unknown;
      };
      const next = {
        ...parsed,
        appearance: {
          ...(parsed.appearance ?? {}),
          theme,
        },
      };
      globalThis.localStorage?.setItem("muse-fresh-settings", JSON.stringify(next));
    }
  } catch {
    // Best effort persistence.
  }
}

export function toggleTheme() {
  setTheme(appThemeSignal.value === "dark" ? "light" : "dark");
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
