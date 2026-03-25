import { create } from 'zustand';

export interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  role: string;
  bio: string;
  sharedThemes: string[];
  status: 'Online' | 'Reflecting' | 'Deep Focus' | 'Offline';
}

export type DialogueTone = 'Reflect' | 'Build' | 'Ask';

export interface CircleContribution {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  text: string;
  tone: DialogueTone;
  timestamp: number;
}

export interface ActiveCircle {
  id: string;
  name: string;
  theme: string;
  members: string[]; // member names/avatars simple ref
  memberCount: number;
  recentActivity: string;
  contributions: CircleContribution[];
  description: string;
}

export interface CommunityRoom {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  memberCount: number;
}

interface ConnectionsState {
  collaborators: Collaborator[];
  circles: ActiveCircle[];
  communityRooms: CommunityRoom[];
  insights: string[];
  activeThemes: string[];
  joinCircle: (circleId: string) => void;
  addContribution: (circleId: string, text: string, tone: DialogueTone) => void;
}

const MOCK_COLLABORATORS: Collaborator[] = [
  {
    id: 'c1',
    name: 'David Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    role: 'Architectural Philosopher',
    bio: 'Exploring the intersection of brutalism and digital ethics.',
    sharedThemes: ['Brutalism', 'Silence', 'Scale'],
    status: 'Deep Focus'
  },
  {
    id: 'c2',
    name: 'Elena Rossi',
    avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=150&q=80',
    role: 'Ambient Soundscaper',
    bio: 'Mapping emotional resonance in urban environments.',
    sharedThemes: ['Reverb', 'Memory', 'Urban Voids'],
    status: 'Online'
  },
  {
    id: 'c3',
    name: 'Marcus Thorne',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    role: 'Interface Poet',
    bio: 'Crafting semantic layers for human-machine intimacy.',
    sharedThemes: ['Typography', 'Intent', 'Identity'],
    status: 'Reflecting'
  }
];

const MOCK_CIRCLES: ActiveCircle[] = [
  {
    id: 'circle-1',
    name: 'The Silence Engine',
    theme: 'Silence',
    members: ['David Chen', 'Elena Rossi', 'You'],
    memberCount: 12,
    recentActivity: '5m ago',
    description: 'A study on digital voids and the cognitive value of non-activity.',
    contributions: [
      {
        id: 'con-1',
        authorId: 'c1',
        authorName: 'David Chen',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        text: 'I think we overestimate the need for constant "flow". Sometimes the most productive state is the void between tasks.',
        tone: 'Reflect',
        timestamp: Date.now() - 3600000 * 2
      },
      {
        id: 'con-2',
        authorId: 'c2',
        authorName: 'Elena Rossi',
        authorAvatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=150&q=80',
        text: 'Exactly. In sound design, the "negative space" is what gives the transients their power. Silence isn\'t empty; it\'s structural.',
        tone: 'Build',
        timestamp: Date.now() - 3600000 * 1
      }
    ]
  },
  {
    id: 'circle-2',
    name: 'Digital Identity Matrix',
    theme: 'Identity',
    members: ['Marcus Thorne', 'You'],
    memberCount: 8,
    recentActivity: '1h ago',
    description: 'Analyzing how curated digital spaces reshape the internal sense of self.',
    contributions: [
      {
        id: 'con-3',
        authorId: 'c3',
        authorName: 'Marcus Thorne',
        authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
        text: 'If our rooms are mirrors, then our threads are the paths we take through the glass. Does a multi-faceted UI encourage a multi-faceted self?',
        tone: 'Ask',
        timestamp: Date.now() - 3600000 * 5
      }
    ]
  }
];

const MOCK_COMMUNITY_ROOMS: CommunityRoom[] = [
  {
    id: 'cr1',
    name: 'Archive of Voids',
    description: 'A shared collection of minimalist architecture and spatial gaps.',
    coverImage: 'https://images.unsplash.com/photo-1509460913899-515f1df34fea?auto=format&fit=crop&w=800&q=80',
    memberCount: 45
  },
  {
    id: 'cr2',
    name: 'Sonic Synthesis',
    description: 'Experimental audio patterns and generative theory.',
    coverImage: 'https://images.unsplash.com/photo-1514467958098-de5b34812076?auto=format&fit=crop&w=800&q=80',
    memberCount: 89
  }
];

export const useConnectionsStore = create<ConnectionsState>((set) => ({
  collaborators: MOCK_COLLABORATORS,
  circles: MOCK_CIRCLES,
  communityRooms: MOCK_COMMUNITY_ROOMS,
  insights: [
    'Connection density has increased by 14% around the "Silence" theme this week.',
    'You and David Chen are achieving 92% thematic resonance on "Brutalism".',
    '3 new contributors joined "Digital Identity Matrix" after your last synthesis.'
  ],
  activeThemes: ['Silence', 'Brutalism', 'Identity', 'Urban Voids', 'Scale', 'Memory'],
  joinCircle: (circleId) => {
    console.log('Joining circle:', circleId);
    set((state) => ({
      circles: state.circles.map(c => 
        c.id === circleId && !c.members.includes('You')
          ? { ...c, members: [...c.members, 'You'], memberCount: c.memberCount + 1 }
          : c
      )
    }));
  },
  addContribution: (circleId, text, tone) => {
    const newContribution: CircleContribution = {
      id: 'con-' + Date.now(),
      authorId: 'me',
      authorName: 'You',
      text,
      tone,
      timestamp: Date.now()
    };
    set((state) => ({
      circles: state.circles.map(c => 
        c.id === circleId 
          ? { ...c, contributions: [...c.contributions, newContribution], recentActivity: 'Just now' }
          : c
      )
    }));
  }
}));
