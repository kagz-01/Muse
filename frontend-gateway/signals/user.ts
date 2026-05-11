import { signal } from "@preact/signals";

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
  name: "Kagz",
  username: "kagz",
  email: "kagz@muse.app",
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

export function toggleSoloMode() {
  soloModeSignal.value = !soloModeSignal.value;
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
  userSignal.value = {
    ...user,
    privacySecurity: { ...user.privacySecurity, ...updates },
  };
}

export function login(email: string) {
  const name = email.split("@")[0];
  userSignal.value = {
    ...userSignal.value,
    name: name.charAt(0).toUpperCase() + name.slice(1),
    email,
  };
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
}
