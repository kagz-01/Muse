import { create } from 'zustand';

interface UserState {
  isAuthenticated: boolean;
  user: { name: string; avatar?: string } | null;
  soloMode: boolean;
  toggleSoloMode: () => void;
  login: () => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  isAuthenticated: false,
  user: null,
  soloMode: false,
  toggleSoloMode: () => set((state) => ({ soloMode: !state.soloMode })),
  login: () => set({ isAuthenticated: true, user: { name: 'Creator' } }),
  logout: () => set({ isAuthenticated: false, user: null }),
}));
