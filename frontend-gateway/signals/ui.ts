import { signal } from "@preact/signals";

export const isMenuOpenSignal = signal(false);
export const isCaptureOpenSignal = signal(false);
export const isProfileOpenSignal = signal(false);
export const isNotificationsOpenSignal = signal(false);

export type AppTheme = "dark" | "dim" | "tint" | "light";
export type AppAccentColor =
  | "cyan"
  | "blue"
  | "purple"
  | "pink"
  | "green"
  | "yellow"
  | "red"
  | "white";
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

const LIGHT_THEME_ACCENT_MAP: Record<AppAccentColor, string> = {
  cyan: "8 145 178",
  blue: "37 99 235",
  purple: "147 51 234",
  pink: "219 39 119",
  green: "22 163 74",
  yellow: "202 138 4",
  red: "220 38 38",
  white: "15 23 42", // slate-900 (black equivalent for white accent on light theme)
};

const FONT_SIZE_MAP: Record<AppFontSize, string> = {
  small: "15px",
  medium: "16px",
  large: "18px",
};

export const notificationsSignal = signal<AppNotification[]>([]);

export function addNotification(title: string, detail: string) {
  const newNotification: AppNotification = {
    id: `n-${Date.now()}`,
    title,
    detail,
    time: "Just now",
    isRead: false,
  };
  notificationsSignal.value = [newNotification, ...notificationsSignal.value];
}
export const appThemeSignal = signal<AppTheme>("dark");
export const appAccentSignal = signal<AppAccentColor>("cyan");
export const appFontSizeSignal = signal<AppFontSize>("medium");

function updateStoredAppearance(
  partial: Partial<
    { theme: AppTheme; accentColor: AppAccentColor; fontSize: AppFontSize }
  >,
) {
  try {
    const settingsRaw = globalThis.localStorage?.getItem("muse-fresh-settings");
    const parsed = settingsRaw
      ? JSON.parse(settingsRaw) as {
        appearance?: Record<string, unknown>;
        [key: string]: unknown;
      }
      : {};

    const next = {
      ...parsed,
      appearance: {
        ...(parsed.appearance ?? {}),
        ...partial,
      },
    };

    globalThis.localStorage?.setItem(
      "muse-fresh-settings",
      JSON.stringify(next),
    );
  } catch {
    // Best effort persistence.
  }
}

function resolveSavedTheme(): AppTheme {
  try {
    const direct = globalThis.localStorage?.getItem(THEME_STORAGE_KEY);
    const themes: AppTheme[] = ["dark", "dim", "tint", "light"];
    if (themes.includes(direct as AppTheme)) return direct as AppTheme;

    const settingsRaw = globalThis.localStorage?.getItem("muse-fresh-settings");
    if (settingsRaw) {
      const parsed = JSON.parse(settingsRaw) as {
        appearance?: { theme?: string };
      };
      if (parsed.appearance?.theme === "light") return "light";
      if (parsed.appearance?.theme === "dark") return "dark";
      if (parsed.appearance?.theme === "system") {
        return globalThis.matchMedia?.("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
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

function applyAccentToDocument(accentColor: AppAccentColor, theme: AppTheme) {
  const docEl = globalThis.document?.documentElement;
  if (!docEl) return;
  const isLight = theme === "light" || theme === "tint";
  const rgb = isLight
    ? LIGHT_THEME_ACCENT_MAP[accentColor]
    : ACCENT_RGB_MAP[accentColor];
  docEl.style.setProperty("--muse-accent-rgb", rgb);
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
  // Try to load saved accent color too
  try {
    const settingsRaw = globalThis.localStorage?.getItem("muse-fresh-settings");
    if (settingsRaw) {
      const parsed = JSON.parse(settingsRaw) as {
        appearance?: { accentColor?: AppAccentColor };
      };
      if (parsed.appearance?.accentColor) {
        appAccentSignal.value = parsed.appearance.accentColor;
      }
    }
  } catch {
    // Ignore
  }
  applyAccentToDocument(appAccentSignal.value, theme);
}

export function setTheme(theme: AppTheme) {
  appThemeSignal.value = theme;
  applyThemeToDocument(theme);
  applyAccentToDocument(appAccentSignal.value, theme);

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
  applyAccentToDocument(accentColor, appThemeSignal.value);
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
