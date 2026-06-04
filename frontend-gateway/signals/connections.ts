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
  status: "Online" | "Reflecting" | "Deep Focus" | "Offline";
  bio: string;
  sharedThemes: string[];
  aura: string;
  intelligenceProfile: string;
  matchPercentage: number;
  topCitedNode: string;
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
  relationship: "Resonating" | "Challenging" | "Synthesizing" | "Initial";
  targetId?: string;
  source?: string;
  txId?: string; // Ledger Transaction ID
  encryptionStatus?: "Secure" | "End-to-End" | "Standard";
  isAnalyzing?: boolean; // Parallel Analysis state
  alignCount: number;
  challengeCount: number;
}

export interface WisdomNode {
  id: string;
  topic: string;
  x: number;
  y: number;
  radius: number;
  connectedTo: string[];
}

export interface SyncEngineStatus {
  nodesActive: number;
  latency: string;
  throughput: string;
  health: "Optimal" | "Degraded" | "Critical";
}

export const syncStatusSignal = signal<SyncEngineStatus>({
  nodesActive: 12,
  latency: "2ms",
  throughput: "1.2k req/s",
  health: "Optimal",
});

export const circlesSignal = signal<ActiveCircle[]>([
  {
    id: "c1",
    name: "Architecture of Silence",
    description:
      "Exploring the cognitive impact of brutalist spaces and ambient soundscapes.",
    theme: "Brutalism",
    memberCount: 124,
    recentActivity: "8m ago",
    members: [{ avatar: "" }, { avatar: "" }, { avatar: "" }],
  },
  {
    id: "c2",
    name: "Digital Stoicism",
    description:
      "Crafting intentional digital environments for deep work and contemplation.",
    theme: "Mindfulness",
    memberCount: 86,
    recentActivity: "15m ago",
    members: [{ avatar: "" }, { avatar: "" }],
  },
]);

export const collaboratorsSignal = signal<Collaborator[]>([
  {
    id: "p1",
    name: "Amina El-Sayed",
    avatar:
      "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=150&q=80",
    role: "Acoustic Architect",
    status: "Deep Focus",
    bio:
      "The friction of raw concrete is the point. A cognitive fortress against noise.",
    sharedThemes: ["Brutalism", "Silence"],
    aura: "cyan",
    intelligenceProfile: "Architect",
    matchPercentage: 92,
    topCitedNode: "The friction of raw concrete is the point.",
  },
  {
    id: "p2",
    name: "Marcus Thorne",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    role: "System Designer",
    status: "Online",
    bio:
      "I build systems that force friction. If it's too easy, it's not worth doing.",
    sharedThemes: ["Digital Sovereignty", "Stoicism"],
    aura: "purple",
    intelligenceProfile: "Challenger",
    matchPercentage: 78,
    topCitedNode: "Friction is the only metric of value in a hyper-optimized world.",
  },
  {
    id: "p3",
    name: "Elena V.",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    role: "Protocol Researcher",
    status: "Reflecting",
    bio:
      "Tracing the lineage of thoughts to their origin. Synthesizing disparate patterns.",
    sharedThemes: ["Collective Intelligence", "Open Source Ethics"],
    aura: "emerald",
    intelligenceProfile: "Synthesizer",
    matchPercentage: 85,
    topCitedNode: "We don't need more information. We need better routing.",
  },
]);

export const communityRoomsSignal = signal<CommunityRoom[]>([
  {
    id: "cr1",
    name: "The Brutalist Vault",
    description:
      "Public archive of monolithic structures and their psychological echoes.",
    memberCount: 412,
    coverImage:
      "https://images.unsplash.com/photo-1518005020250-58003994bf3b?auto=format&fit=crop&w=1200&q=80",
  },
]);

export const wisdomNodesSignal = signal<WisdomNode[]>([
  {
    id: "w1",
    topic: "Brutalism",
    x: 200,
    y: 150,
    radius: 60,
    connectedTo: ["w2", "w3"],
  },
  {
    id: "w2",
    topic: "Silence",
    x: 400,
    y: 100,
    radius: 45,
    connectedTo: ["w1"],
  },
  {
    id: "w3",
    topic: "Stoic Tech",
    x: 350,
    y: 300,
    radius: 50,
    connectedTo: ["w1"],
  },
  { id: "w4", topic: "Identity", x: 600, y: 200, radius: 40, connectedTo: [] },
]);

export const perspectivesSignal = signal<Perspective[]>([
  {
    id: "per1",
    author: { name: "Amina El-Sayed", avatar: "", aura: "cyan" },
    content:
      "The friction of raw concrete is the point. A cognitive fortress against noise.",
    timestamp: "2m ago",
    relationship: "Initial",
    source: "Journal",
    txId: "0x8f...3a2",
    encryptionStatus: "End-to-End",
    alignCount: 87,
    challengeCount: 12,
  },
  {
    id: "per2",
    author: { name: "Marcus Thorne", avatar: "", aura: "purple" },
    content:
      "I'd argue that noise is necessary for the silence to have meaning. It's the contrast that builds the experience.",
    timestamp: "Just now",
    relationship: "Challenging",
    targetId: "per1",
    source: "Vault",
    txId: "0x4c...9b1",
    encryptionStatus: "End-to-End",
    alignCount: 42,
    challengeCount: 3,
  },
]);

export function joinCircle(id: string) {
  console.log(`Joining circle: ${id}`);
}

export function submitPerspective(
  content: string,
  targetId?: string,
  source?: string,
) {
  const newId = "per-" + Date.now();
  const txId = "0x" + Math.random().toString(16).slice(2, 10) + "..." +
    Math.random().toString(16).slice(2, 6);

  const newPerspective: Perspective = {
    id: newId,
    author: { name: "Alex Rivera", avatar: "", aura: "indigo" },
    content,
    timestamp: "Just now",
    relationship: targetId
      ? (Math.random() > 0.5 ? "Resonating" : "Synthesizing")
      : "Initial",
    targetId,
    source,
    txId,
    encryptionStatus: "End-to-End",
    isAnalyzing: true,
    alignCount: 1,
    challengeCount: 0,
  };

  perspectivesSignal.value = [newPerspective, ...perspectivesSignal.value];

  // Simulate Parallel Analysis
  setTimeout(() => {
    perspectivesSignal.value = perspectivesSignal.value.map((p: Perspective) =>
      p.id === newId ? { ...p, isAnalyzing: false } : p
    );
  }, 2000);
}

export function alignWithPerspective(id: string) {
  perspectivesSignal.value = perspectivesSignal.value.map((p) => {
    if (p.id === id) {
      return { ...p, alignCount: p.alignCount + 1 };
    }
    return p;
  });
}

export function challengePerspective(id: string) {
  perspectivesSignal.value = perspectivesSignal.value.map((p) => {
    if (p.id === id) {
      return { ...p, challengeCount: p.challengeCount + 1 };
    }
    return p;
  });
}

export function synthesizePerspective(content: string, targetId: string) {
  submitPerspective(content, targetId, "Journal Synthesis");
}

export const insightsSignal = signal<string[]>([
  "Brutalism is trending across 3 rooms in your network.",
  "Your synthesis on 'Digital Sovereignty' has 86 resonance connections.",
  "Community dialogue is shifting toward minimalist aesthetics.",
]);

export const activeThemesSignal = signal<string[]>([
  "Brutalism",
  "Digital Sovereignty",
  "Stoicism",
  "Minimalism",
  "Collective Intelligence",
  "Open Source Ethics",
]);

// Map Selection State
export const activeWisdomFocusSignal = signal<string | null>(null);

export function setActiveWisdomFocus(nodeId: string | null) {
  activeWisdomFocusSignal.value = nodeId;
}
