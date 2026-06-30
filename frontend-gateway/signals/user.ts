import { signal } from "@preact/signals";
import { safeFetch } from "../utils/safeFetch.ts";

export interface ResonanceMetrics {
  views: number;
  connections: number;
  resonanceScore: number;
}

export interface SocialLink {
  title: string;
  url: string;
}

export interface PrivacySecurity {
  accountVisibility: "public" | "private" | "connections";
  showEmailInProfile: boolean;
  allowSearchIndexing: boolean;
  twoFactorEnabled: boolean;
}

export interface PublicSettings {
  showProfile: boolean;
  showLocation: boolean;
  showRooms: boolean;
  showThreads: boolean;
  showInsights: boolean;
}

export interface User {
  id: string;
  name: string;
  username?: string;
  email?: string;
  bio?: string;
  location?: string;
  gender?: string;
  pronouns?: string;
  birthDate?: string;
  occupation?: string;
  timezone?: string;
  website?: string;
  avatarUrl?: string;
  links: SocialLink[];
  auraType: "Architect" | "Synthesizer" | "Visionary" | "Guardian";
  auraColor: string;
  cognitiveStreak: number;
  resonance: ResonanceMetrics;
  weeklyInsights: {
    resonanceScore: number;
    topThemes: string[];
    synthesisCount: number;
  };
  synthesisLineage: {
    totalRooms: number;
    totalArtifacts: number;
    wovenThreads: number;
  };
  publicSettings: PublicSettings;
  privacySecurity: PrivacySecurity;
  customStyling?: {
    journalWallpaper?: string;
    fontFamily?: string;
  };
  walletAddress?: string;
}

export const userSignal = signal<User>({
  id: "u1",
  name: "",
  username: "",
  email: "",
  bio: "Synthesizer of patterns, collector of signals.",
  location: "",
  links: [],
  auraType: "Synthesizer",
  auraColor: "#6366f1",
  cognitiveStreak: 12,
  resonance: {
    views: 1240,
    connections: 86,
    resonanceScore: 94,
  },
  weeklyInsights: {
    resonanceScore: 88,
    topThemes: ["Brutalism", "Sovereignty", "Stoicism"],
    synthesisCount: 5,
  },
  synthesisLineage: {
    totalRooms: 12,
    totalArtifacts: 48,
    wovenThreads: 8,
  },
  publicSettings: {
    showProfile: true,
    showLocation: false,
    showRooms: true,
    showThreads: true,
    showInsights: true,
  },
  privacySecurity: {
    accountVisibility: "public",
    showEmailInProfile: false,
    allowSearchIndexing: true,
    twoFactorEnabled: false,
  },
});

export const soloModeSignal = signal(false);

function setupBannerKeyForUser(userId?: string): string {
  return `muse-setup-dismissed:${userId || "anonymous"}`;
}

function readSetupDismissed(userId?: string): boolean {
  try {
    return globalThis.localStorage?.getItem(setupBannerKeyForUser(userId)) ===
      "true";
  } catch {
    return false;
  }
}

// Tracks whether the user has dismissed the setup banner in this session
export const setupBannerDismissedSignal = signal(
  readSetupDismissed(userSignal.value.id),
);

export function refreshSetupBannerDismissed(userId?: string) {
  const resolvedId = userId || userSignal.value.id;
  setupBannerDismissedSignal.value = readSetupDismissed(resolvedId);
}

export function dismissSetupBanner() {
  try {
    globalThis.localStorage?.setItem(
      setupBannerKeyForUser(userSignal.value.id),
      "true",
    );
  } catch { /* noop */ }
  setupBannerDismissedSignal.value = true;
}

export interface SetupStep {
  id: string;
  label: string;
  done: boolean;
  href: string;
}

export function getSetupSteps(user: User): SetupStep[] {
  return [
    {
      id: "name",
      label: "Add your name",
      done: Boolean(user.name && user.name !== "Guest"),
      href: "/settings",
    },
    {
      id: "username",
      label: "Choose a username",
      done: Boolean(user.username && user.username !== "guest"),
      href: "/settings",
    },
    {
      id: "avatar",
      label: "Upload a photo",
      done: Boolean(user.avatarUrl),
      href: "/settings",
    },
    {
      id: "bio",
      label: "Write your bio",
      done: Boolean(user.bio && user.bio.length > 0),
      href: "/settings",
    },
    {
      id: "location",
      label: "Set your location",
      done: Boolean(user.location && user.location.trim()),
      href: "/settings",
    },
    // Website and social links are optional for most users; don't block setup completion
    // {
    //   id: "website",
    //   label: "Add a website",
    //   done: Boolean(user.website && user.website.trim()),
    //   href: "/settings",
    // },
    // {
    //   id: "link",
    //   label: "Add a social link",
    //   done: (user.links || []).length > 0,
    //   href: "/settings",
    // },
  ];
}

export function isProfileComplete(user: User): boolean {
  return getSetupSteps(user).every((s) => s.done);
}

interface BackendProfilePayload {
  id?: string;
  email?: string;
  username?: string;
  name?: string;
  wallet_address?: string;
  resonance_score?: number;
  current_streak?: number;
}

interface BackendSettingsPayload {
  name?: string;
  bio?: string;
  avatarUrl?: string;
  preferences?: {
    appearance?: Partial<PublicSettings>;
    notifications?: Partial<Record<string, unknown>>;
    dataSettings?: Partial<Record<string, unknown>>;
    publicSettings?: PublicSettings;
    privacySecurity?: PrivacySecurity;
    profile?: Partial<Pick<
      User,
      | "location"
      | "gender"
      | "pronouns"
      | "birthDate"
      | "occupation"
      | "timezone"
      | "website"
      | "links"
    >>;
  };
}

export async function syncCurrentUserFromBackend(): Promise<void> {
  const current = userSignal.value;

  try {
    const [profileResponse, settingsResponse] = await Promise.all([
      fetch("/api/profile"),
      fetch("/api/user/settings"),
    ]);

    let nextUser: User = { ...current };

    if (profileResponse.ok) {
      const profile = await profileResponse.json() as BackendProfilePayload;
      nextUser.id = profile.id || nextUser.id;
      nextUser.email = profile.email || nextUser.email;
      nextUser.username = profile.username || nextUser.username;
      nextUser.name = profile.name || nextUser.name;
      nextUser.walletAddress = profile.wallet_address || nextUser.walletAddress;
      if (typeof profile.current_streak === "number") {
        nextUser.cognitiveStreak = profile.current_streak;
      }
      if (typeof profile.resonance_score === "number") {
        nextUser.resonance = {
          ...nextUser.resonance,
          resonanceScore: profile.resonance_score,
        };
      }
    }

    if (settingsResponse.ok) {
      const settings = await settingsResponse.json() as BackendSettingsPayload;
      nextUser.name = settings.name || nextUser.username || nextUser.name || "";
      nextUser.bio = settings.bio || nextUser.bio;
      nextUser.avatarUrl = settings.avatarUrl || nextUser.avatarUrl;

      if (settings.preferences?.publicSettings) {
        nextUser.publicSettings = {
          ...nextUser.publicSettings,
          ...settings.preferences.publicSettings,
        };
      }

      if (settings.preferences?.privacySecurity) {
        nextUser.privacySecurity = {
          ...nextUser.privacySecurity,
          ...settings.preferences.privacySecurity,
        };
      }

      if (settings.preferences?.profile) {
        nextUser = { ...nextUser, ...settings.preferences.profile };
      }
    }

    userSignal.value = nextUser;
    soloModeSignal.value = nextUser.privacySecurity.accountVisibility !== "public";
    refreshSetupBannerDismissed(nextUser.id);
  } catch {
    // Best effort hydration; keep existing local state if the backend is unavailable.
  }
}

async function persistPrivacySecurity(updates: Partial<PrivacySecurity>) {
  try {
    const body = { preferences: { privacySecurity: updates } };
    const response = await safeFetch("/api/user/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      entity: "settings",
    });

    if (!response.ok && response.status !== 202) {
      console.warn("[persistPrivacySecurity] Backend update failed", response.status);
    }
  } catch {
    // Ignore failures; the client state remains authoritative until the queue flushes.
  }
}

export function toggleSoloMode() {
  const user = userSignal.value;
  const nextAccountVisibility = user.privacySecurity.accountVisibility === "public"
    ? "connections"
    : "public";

  userSignal.value = {
    ...user,
    privacySecurity: {
      ...user.privacySecurity,
      accountVisibility: nextAccountVisibility,
    },
  };
  soloModeSignal.value = nextAccountVisibility !== "public";

  void persistPrivacySecurity({ accountVisibility: nextAccountVisibility });
}

export function updateUserAura(type: User["auraType"], color: string) {
  userSignal.value = { ...userSignal.value, auraType: type, auraColor: color };
}

export function updateProfile(updates: Partial<User>) {
  userSignal.value = { ...userSignal.value, ...updates };
}

export function addLink(link: SocialLink) {
  const user = userSignal.value;
  userSignal.value = { ...user, links: [...(user.links || []), link] };
}

export function removeLink(index: number) {
  const user = userSignal.value;
  const newLinks = [...(user.links || [])];
  newLinks.splice(index, 1);
  userSignal.value = { ...user, links: newLinks };
}

export function togglePublicSetting(key: keyof PublicSettings) {
  const user = userSignal.value;
  userSignal.value = {
    ...user,
    publicSettings: {
      ...user.publicSettings,
      [key]: !user.publicSettings[key],
    },
  };
}

export function updatePrivacySecurity(updates: Partial<PrivacySecurity>) {
  const user = userSignal.value;
  const nextPrivacySecurity = {
    ...user.privacySecurity,
    ...updates,
  };

  userSignal.value = {
    ...user,
    privacySecurity: nextPrivacySecurity,
  };

  if (updates.accountVisibility !== undefined) {
    soloModeSignal.value = nextPrivacySecurity.accountVisibility !== "public";
    void persistPrivacySecurity({ accountVisibility: nextPrivacySecurity.accountVisibility });
  }
}

export function login(email: string) {
  const name = email.split("@")[0];
  userSignal.value = {
    ...userSignal.value,
    name: name.charAt(0).toUpperCase() + name.slice(1),
    email,
  };
  setupBannerDismissedSignal.value = false;
}

export function logout() {
  userSignal.value = {
    id: "u1",
    name: "Guest",
    username: "guest",
    links: [],
    auraType: "Synthesizer",
    auraColor: "#6366f1",
    cognitiveStreak: 0,
    resonance: { views: 0, connections: 0, resonanceScore: 0 },
    weeklyInsights: { resonanceScore: 0, topThemes: [], synthesisCount: 0 },
    synthesisLineage: { totalRooms: 0, totalArtifacts: 0, wovenThreads: 0 },
    publicSettings: {
      showProfile: true,
      showLocation: false,
      showRooms: true,
      showThreads: true,
      showInsights: true,
    },
    privacySecurity: {
      accountVisibility: "public",
      showEmailInProfile: false,
      allowSearchIndexing: true,
      twoFactorEnabled: false,
    },
  };
  refreshSetupBannerDismissed("u1");
}
