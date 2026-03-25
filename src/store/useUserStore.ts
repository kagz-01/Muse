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
  bio?: string;
  location?: string;
  links: UserLink[];
  publicSettings: {
    showProfile: boolean;
    showLocation: boolean;
    showRooms: boolean;
    showThreads: boolean;
    showInsights: boolean;
  };
}

interface UserState {
  user: User | null;
  soloMode: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
  toggleSoloMode: () => void;
  updateProfile: (updates: Partial<User>) => void;
  togglePublicSetting: (setting: keyof User['publicSettings']) => void;
  addLink: (link: Omit<UserLink, 'id'>) => void;
  removeLink: (id: string) => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: {
    id: 'user_x',
    email: 'alex@muse.app',
    name: 'Alex Rivera',
    username: '@alex',
    gender: 'Non-binary',
    birthDate: '1998-06-15',
    avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&h=400&q=80',
    bio: 'Curating the intersection of brutalist architecture and ambient soundscapes.',
    location: 'Berlin / Digital',
    links: [
      { id: 'l1', title: 'Portfolio', url: 'https://alexrivera.design' },
      { id: 'l2', title: 'Spotify', url: 'https://open.spotify.com/user/alexr' }
    ],
    publicSettings: {
      showProfile: true,
      showLocation: true,
      showRooms: true,
      showThreads: true,
      showInsights: true
    }
  },
  soloMode: true,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    // Validate email before using split
    if (!email || typeof email !== 'string') {
      console.error('Login failed: Invalid email provided', email);
      set({ error: 'Invalid email provided', isLoading: false });
      throw new Error('Invalid email provided');
    }

    set({ isLoading: true, error: null });

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Safe split operation with fallback
      const emailParts = email.split('@');
      const nameFromEmail = emailParts[0] || 'User';
      const usernameFromEmail = `@${nameFromEmail}`;

      // Create user object
      const newUser: User = {
        id: Date.now().toString(),
        email: email,
        name: nameFromEmail,
        username: usernameFromEmail,
        links: [],
        publicSettings: {
          showProfile: true,
          showLocation: true,
          showRooms: true,
          showThreads: true,
          showInsights: true
        }
      };

      // Optional: If you want to use the provided password for something
      if (password) {
        // You could store hashed password or validate here
        console.log('Password provided (would be validated in real app)');
      }

      set({ user: newUser, isLoading: false, error: null });

    } catch (error) {
      console.error('Login error:', error);
      set({
        error: error instanceof Error ? error.message : 'Login failed',
        isLoading: false
      });
      throw error;
    }
  },

  logout: () => set({ user: null, error: null, isLoading: false }),

  toggleSoloMode: () => set((state) => ({ soloMode: !state.soloMode })),

  updateProfile: (updates) => set((state) => ({
    user: state.user ? { ...state.user, ...updates } : null
  })),

  togglePublicSetting: (setting) => set((state) => {
    if (!state.user) return state;
    return {
      user: {
        ...state.user,
        publicSettings: {
          ...state.user.publicSettings,
          [setting]: !state.user.publicSettings[setting]
        }
      }
    };
  }),

  addLink: (link) => set((state) => {
    if (!state.user) return state;
    const newLink = {
      ...link,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 6)
    };
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
