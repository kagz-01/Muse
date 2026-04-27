import { signal } from "@preact/signals";

export interface UserLink {
  id: string;
  title: string;
  url: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  gender?: string;
  pronouns?: string;
  birthDate?: string;
  occupation?: string;
  timezone?: string;
  website?: string;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  walletAddress?: string;
  links: UserLink[];
  publicSettings: {
    showProfile: boolean;
    showLocation: boolean;
    showRooms: boolean;
    showThreads: boolean;
    showInsights: boolean;
  };
  privacySecurity: {
    accountVisibility: 'public' | 'private';
    showEmailInProfile: boolean;
    allowSearchIndexing: boolean;
    twoFactorEnabled: boolean;
  };
}

function createDefaultUser(email = 'alex@muse.app'): User {
  return {
    id: 'user_x',
    email,
    name: 'Alex Rivera',
    username: '@alex',
    gender: 'Non-binary',
    pronouns: 'they/them',
    birthDate: '1998-06-15',
    occupation: 'Experience Designer',
    timezone: 'Europe/Berlin',
    website: 'https://alexrivera.design',
    avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&h=400&q=80',
    bio: 'Curating the intersection of brutalist architecture and ambient soundscapes.',
    location: 'Berlin / Digital',
    links: [
      { id: 'l1', title: 'Portfolio', url: 'https://alexrivera.design' },
      { id: 'l2', title: 'Spotify', url: 'https://open.spotify.com/user/alexr' },
    ],
    publicSettings: {
      showProfile: true,
      showLocation: true,
      showRooms: true,
      showThreads: true,
      showInsights: true,
    },
    privacySecurity: {
      accountVisibility: 'public',
      showEmailInProfile: false,
      allowSearchIndexing: true,
      twoFactorEnabled: false,
    },
  };
}

// Global mutable signals
export const userSignal = signal<User | null>(createDefaultUser());

export const soloModeSignal = signal<boolean>(false);

// Actions
export function login(email?: string) {
  const e = email || "demo@muse.app";
  userSignal.value = {
    ...createDefaultUser(e),
    id: '1',
    name: e.split('@')[0],
    username: `@${e.split('@')[0]}`,
    links: [],
  };
}

export function logout() {
  userSignal.value = null;
}

export function toggleSoloMode() {
  soloModeSignal.value = !soloModeSignal.value;
}

export function updateProfile(updates: Partial<User>) {
  if (userSignal.value) {
    userSignal.value = { ...userSignal.value, ...updates };
  }
}

export function togglePublicSetting(setting: keyof User['publicSettings']) {
  if (userSignal.value) {
    userSignal.value = {
      ...userSignal.value,
      publicSettings: {
        ...userSignal.value.publicSettings,
        [setting]: !userSignal.value.publicSettings[setting]
      }
    };
  }
}
export function addLink(link: Omit<UserLink, 'id'>) {
  if (userSignal.value) {
    const newLink = { ...link, id: 'l-' + Date.now() };
    userSignal.value = {
      ...userSignal.value,
      links: [...userSignal.value.links, newLink]
    };
  }
}

export function updatePrivacySecurity(updates: Partial<User['privacySecurity']>) {
  if (userSignal.value) {
    userSignal.value = {
      ...userSignal.value,
      privacySecurity: {
        ...userSignal.value.privacySecurity,
        ...updates,
      },
    };
  }
}

export function removeLink(id: string) {
  if (userSignal.value) {
    userSignal.value = {
      ...userSignal.value,
      links: userSignal.value.links.filter(l => l.id !== id)
    };
  }
}

export function resetUserProfile() {
  userSignal.value = createDefaultUser();
}
