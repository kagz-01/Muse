import { create } from 'zustand';

export type Tone = 'Reflective' | 'Supportive' | 'Curious' | 'Collaborative' | 'Appreciative' | 'Sensitive' | 'Respectful Tension';

export interface CommentNode {
  id: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  tone: Tone;
  themes: string[];
  timestamp: string;
}

export interface ConversationThread {
  id: string;
  title: string;
  participants: { name: string, avatar: string }[];
  status: 'Calm' | 'Thoughtful' | 'Growing' | 'Sensitive';
  themes: string[];
  comments: CommentNode[];
}

export interface Relationship {
  id: string;
  name: string;
  avatar: string;
  exchangeCount: number;
  sharedThemes: string[];
  strength: number; // 0-100
  communicationStyle: string;
}

interface ConnectionsState {
  threads: ConversationThread[];
  relationships: Relationship[];
  insights: string[];
  activeThemes: string[];
  addComment: (threadId: string, comment: Omit<CommentNode, 'id' | 'timestamp'>) => void;
}

const MOCK_RELATIONSHIPS: Relationship[] = [
  {
    id: 'r1',
    name: 'David Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    exchangeCount: 8,
    sharedThemes: ['Design', 'Identity', 'Creativity'],
    strength: 92,
    communicationStyle: 'Highly Collaborative & Curious'
  },
  {
    id: 'r2',
    name: 'Amina El-Sayed',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1bf98c?auto=format&fit=crop&w=150&q=80',
    exchangeCount: 14,
    sharedThemes: ['Growth', 'Purpose', 'Healing'],
    strength: 85,
    communicationStyle: 'Deeply Reflective & Supportive'
  },
  {
    id: 'r3',
    name: 'Marcus Thorne',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&q=80',
    exchangeCount: 3,
    sharedThemes: ['Innovation', 'Technology'],
    strength: 45,
    communicationStyle: 'Direct & Curious'
  }
];

const MOCK_THREADS: ConversationThread[] = [
  {
    id: 'th1',
    title: 'Exploring identity, ambition, and burnout.',
    status: 'Thoughtful',
    themes: ['Identity', 'Growth'],
    participants: [
      { name: 'David Chen', avatar: MOCK_RELATIONSHIPS[0].avatar },
      { name: 'Alex Rivera', avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=150&q=80' }
    ],
    comments: [
      {
        id: 'c1',
        authorName: 'David Chen',
        authorAvatar: MOCK_RELATIONSHIPS[0].avatar,
        content: 'I realized today that the friction I feel isn\'t a lack of ambition, but a misalignment of my core identity with the projects I\'m taking on.',
        tone: 'Reflective',
        themes: ['Identity'],
        timestamp: '2 hours ago'
      }
    ]
  },
  {
    id: 'th2',
    title: 'The aesthetic of brutalist isolation.',
    status: 'Growing',
    themes: ['Design', 'Reflective'],
    participants: [
      { name: 'Amina El-Sayed', avatar: MOCK_RELATIONSHIPS[1].avatar },
      { name: 'Marcus Thorne', avatar: MOCK_RELATIONSHIPS[2].avatar }
    ],
    comments: [
      {
        id: 'c2',
        authorName: 'Amina El-Sayed',
        authorAvatar: MOCK_RELATIONSHIPS[1].avatar,
        content: 'There is something incredibly secure about heavy architectural shadows. Great find.',
        tone: 'Appreciative',
        themes: ['Design'],
        timestamp: '5 hours ago'
      }
    ]
  }
];

const MOCK_INSIGHTS = [
  "Your strongest conversations happen when you begin with reflection.",
  "Supportive responses from you are leading to significantly longer, healthier discussion threads.",
  "You build deeper dialogue with users who share your creative themes.",
  "One conversation with Marcus may benefit from a clarifying question."
];

const MOCK_THEMES = ['Creativity', 'Identity', 'Growth', 'Healing', 'Design', 'Music', 'Purpose', 'Innovation', 'Reflection', 'Community'];

export const useConnectionsStore = create<ConnectionsState>((set) => ({
  threads: MOCK_THREADS,
  relationships: MOCK_RELATIONSHIPS,
  insights: MOCK_INSIGHTS,
  activeThemes: MOCK_THEMES,
  addComment: (threadId, comment) => set((state) => ({
    threads: state.threads.map(t => {
      if (t.id === threadId) {
        return {
          ...t,
          comments: [...t.comments, { ...comment, id: Date.now().toString(), timestamp: 'Just now' }]
        };
      }
      return t;
    })
  }))
}));
