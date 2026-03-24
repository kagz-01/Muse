import { create } from 'zustand';

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
  birthDate?: string;
  avatarUrl?: string;
  links: UserLink[];
}

interface UserState {
  user: User | null;
  soloMode: boolean;
  login: (email: string) => void;
  logout: () => void;
  toggleSoloMode: () => void;
  updateProfile: (updates: Partial<User>) => void;
  addLink: (link: Omit<UserLink, 'id'>) => void;
  removeLink: (id: string) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: {
    id: 'user_1',
    email: 'creator@muse.app',
    name: 'Anonymous Creator',
    username: '@creator',
    links: [],
  }, // Pre-populated for the MVP
  soloMode: true,
  login: (email) => set({ user: { id: '1', email, name: email.split('@')[0], username: `@${email.split('@')[0]}`, links: [] } }),
  logout: () => set({ user: null }),
  toggleSoloMode: () => set((state) => ({ soloMode: !state.soloMode })),
  
  updateProfile: (updates) => set((state) => ({
    user: state.user ? { ...state.user, ...updates } : null
  })),

  addLink: (link) => set((state) => {
    if (!state.user) return state;
    const newLink = { ...link, id: Date.now().toString() + Math.random().toString(36).substring(2, 6) };
    const currentLinks = state.user.links || [];
    return {
      user: {
        ...state.user,
        links: [...currentLinks, newLink]
      }
    };
  }),

  removeLink: (id) => set((state) => {
    if (!state.user) return state;
    const currentLinks = state.user.links || [];
    return {
      user: {
        ...state.user,
        links: currentLinks.filter(l => l.id !== id)
      }
    };
  }),
}));
