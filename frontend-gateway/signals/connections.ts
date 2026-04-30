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

export interface Perspective {
  id: string;
  author: {
    name: string;
    avatar: string;
    aura: string;
  };
  content: string;
  timestamp: string;
  relationship: 'Resonating' | 'Challenging' | 'Synthesizing' | 'Initial';
  targetId?: string;
}

export interface ThoughtCluster {
  id: string;
  topic: string;
  perspectiveIds: string[];
  resonanceScore: number;
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

export const perspectivesSignal = signal<Perspective[]>([
  {
    id: 'per1',
    author: { name: 'Amina El-Sayed', avatar: '', aura: 'cyan' },
    content: "The friction of raw concrete is the point. A cognitive fortress against noise.",
    timestamp: '2m ago',
    relationship: 'Initial'
  },
  {
    id: 'per2',
    author: { name: 'Marcus Thorne', avatar: '', aura: 'purple' },
    content: "I'd argue that noise is necessary for the silence to have meaning. It's the contrast that builds the experience.",
    timestamp: 'Just now',
    relationship: 'Challenging',
    targetId: 'per1'
  }
]);

export const clustersSignal = signal<ThoughtCluster[]>([
  {
    id: 'cl1',
    topic: 'Brutalist Psychology',
    perspectiveIds: ['per1', 'per2'],
    resonanceScore: 0.85
  }
]);

export function joinCircle(id: string) {
  console.log(`Joining circle: ${id}`);
}

export function submitPerspective(content: string, targetId?: string) {
  const newId = 'per-' + Date.now();
  const newPerspective: Perspective = {
    id: newId,
    author: { name: 'Alex Rivera', avatar: '', aura: 'indigo' },
    content,
    timestamp: 'Just now',
    relationship: targetId ? (Math.random() > 0.5 ? 'Resonating' : 'Synthesizing') : 'Initial',
    targetId
  };
  
  perspectivesSignal.value = [newPerspective, ...perspectivesSignal.value];
  
  if (perspectivesSignal.value.length % 3 === 0) {
    const newCluster: ThoughtCluster = {
      id: 'cl-' + Date.now(),
      topic: 'Emerging Pattern: ' + content.slice(0, 20) + '...',
      perspectiveIds: [newId, 'per1', 'per2'],
      resonanceScore: Math.random()
    };
    clustersSignal.value = [newCluster, ...clustersSignal.value];
  }
}
