import { signal } from "@preact/signals";

export interface ActiveCircle {
  id: string;
  name: string;
  description: string;
  theme: string;
  memberCount: number;
  recentActivity: string;
  members: { avatar: string }[];
}

export interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  role: string;
  status: 'Online' | 'Reflecting' | 'Deep Focus' | 'Offline';
  bio: string;
  sharedThemes: string[];
}

export interface CommunityRoom {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  coverImage: string;
}

export const circlesSignal = signal<ActiveCircle[]>([
  {
    id: 'c1',
    name: 'Architecture of Silence',
    description: 'Exploring the cognitive impact of brutalist spaces and ambient soundscapes.',
    theme: 'Brutalism',
    memberCount: 124,
    recentActivity: '8m ago',
    members: [{ avatar: '' }, { avatar: '' }, { avatar: '' }]
  },
  {
    id: 'c2',
    name: 'Digital Stoicism',
    description: 'Crafting intentional digital environments for deep work and contemplation.',
    theme: 'Mindfulness',
    memberCount: 86,
    recentActivity: '15m ago',
    members: [{ avatar: '' }, { avatar: '' }]
  }
]);

export const collaboratorsSignal = signal<Collaborator[]>([
  {
    id: 'p1',
    name: 'Amina El-Sayed',
    avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=150&q=80',
    role: 'Acoustic Architect',
    status: 'Deep Focus',
    bio: 'The friction of raw concrete is the point. A cognitive fortress against noise.',
    sharedThemes: ['Brutalism', 'Silence']
  },
  {
    id: 'p2',
    name: 'Marcus Thorne',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    role: 'Synthesist',
    status: 'Online',
    bio: 'Why do we keep collecting if we don\'t synthesize? A room is just a box until it becomes a thread.',
    sharedThemes: ['Synthesis', 'Identity']
  }
]);

export const communityRoomsSignal = signal<CommunityRoom[]>([
  {
    id: 'cr1',
    name: 'The Brutalist Vault',
    description: 'Public archive of monolithic structures and their psychological echoes.',
    memberCount: 412,
    coverImage: 'https://images.unsplash.com/photo-1518005020250-58003994bf3b?auto=format&fit=crop&w=1200&q=80'
  }
]);

export const activeThemesSignal = signal<string[]>([
  'Brutalism', 'Ambient Noise', 'Stoic Tech', 'Urban Rewilding', 'Cognitive Load', 'Silence', 'Minimalism'
]);

export const insightsSignal = signal<string[]>([
  "Community dialogue is currently high-fidelity and deeply reflective.",
  "Trends indicate a shift towards 'Quiet Tech' curation.",
  "The 'Silence' circle has seen a 40% increase in deep-linked artifacts this week."
]);

export function joinCircle(id: string) {
  console.log(`Joining circle: ${id}`);
  // Implementation logic here
}
