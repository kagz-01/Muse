/**
 * demo_data.ts
 * Single source of truth for all template data returned when a user
 * is in Demo Mode. Import from here across API handlers and SSR routes.
 */

export const DEMO_USER = {
  id: "__demo__",
  username: "explorer",
  email: "demo@muse.app",
  name: "Guest Explorer",
  bio: "Curious mind exploring the Muse ecosystem.",
  avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=explorer",
  auraType: "Synthesizer" as const,
  auraColor: "#10b981",
  cognitiveStreak: 3,
};

export const DEMO_ROOMS = [
  {
    id: "demo-r1",
    title: "Systems & Architecture",
    description:
      "A deep dive into distributed systems, software design patterns, and scalable architectures. Explore how great systems are built.",
    theme_color: "indigo",
    tags: ["systems", "architecture", "engineering", "design"],
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-r2",
    title: "The Human Algorithm",
    description:
      "Reflections on human behavior, cognitive biases, and the patterns that govern how we think, decide, and connect.",
    theme_color: "emerald",
    tags: ["psychology", "behavior", "philosophy", "cognition"],
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const DEMO_JOURNALS = [
  {
    id: "demo-j1",
    title: "First Principles Thinking",
    content:
      "Most people reason by analogy — copying what others do with slight modifications. First principles reasoning cuts through that. You boil things down to the most fundamental truths and reason up from there. When I looked at my own habits through this lens, I realized I was optimizing for things that didn't actually matter to me. The foundation was someone else's blueprint.",
    mood: "reflective",
    tags: ["thinking", "mental models", "clarity"],
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    room_id: "demo-r2",
  },
  {
    id: "demo-j2",
    title: "On Building in Public",
    content:
      "There's a strange alchemy that happens when you commit to transparency. The fear of judgment becomes fuel. The imperfect draft becomes a signal that you're moving. I started treating my projects like open-source research. The feedback loops accelerated everything. Vulnerability, it turns out, is a compounding asset.",
    mood: "energized",
    tags: ["creativity", "building", "growth"],
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    room_id: "demo-r1",
  },
];

export const DEMO_STREAM = [
  {
    id: "demo-s1",
    author: {
      name: "Amara Osei",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=amara",
      aura: "energized",
    },
    content:
      "The most dangerous assumption in product design is that users know what they want. They know what they feel. Your job is to translate.",
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    tags: ["product", "design", "empathy"],
    alignCount: 47,
    challengeCount: 3,
  },
  {
    id: "demo-s2",
    author: {
      name: "Kofi Mensah",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=kofi",
      aura: "reflective",
    },
    content:
      "Attention is the only truly non-renewable resource. Every notification is a withdrawal. Every deep work session is a deposit.",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    tags: ["focus", "productivity", "attention"],
    alignCount: 82,
    challengeCount: 11,
  },
  {
    id: "demo-s3",
    author: {
      name: "Zara Kimani",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=zara",
      aura: "creative",
    },
    content:
      "Language isn't just how we communicate ideas — it's how we imprison them. The moment a feeling becomes a word, something ineffable is lost.",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    tags: ["philosophy", "language", "consciousness"],
    alignCount: 61,
    challengeCount: 28,
  },
];

export const DEMO_CIRCLES = [
  {
    id: "demo-c1",
    name: "Deep Work Collective",
    description:
      "A circle for practitioners of deep, focused work. We share strategies, challenges, and breakthroughs.",
    theme: "Focus & Mastery",
    member_count: 14,
    recent_activity: "Someone shared a 90-minute session protocol.",
  },
  {
    id: "demo-c2",
    name: "Builders & Makers",
    description:
      "For those building in public. Weekly check-ins, accountability, and feedback on live projects.",
    theme: "Creation & Craft",
    member_count: 31,
    recent_activity: "New project launched: an AI-powered journaling tool.",
  },
];

export const DEMO_COLLABORATORS = [
  {
    id: "demo-col1",
    name: "Amara Osei",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=amara",
    role: "Synthesizer",
    status: "Online",
    bio:
      "Product designer exploring the intersection of AI and human behavior.",
    sharedThemes: ["Design", "AI", "Psychology"],
    aura: "#10b981",
    intelligenceProfile: "Synthesizer",
    matchPercentage: 94,
    topCitedNode: "Empathy in Product Design",
  },
  {
    id: "demo-col2",
    name: "Kofi Mensah",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=kofi",
    role: "Architect",
    status: "Deep Focus",
    bio:
      "Systems engineer. Obsessed with elegant abstractions and distributed systems.",
    sharedThemes: ["Systems", "Engineering", "Focus"],
    aura: "#6366f1",
    intelligenceProfile: "Architect",
    matchPercentage: 87,
    topCitedNode: "First Principles in Engineering",
  },
  {
    id: "demo-col3",
    name: "Zara Kimani",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=zara",
    role: "Challenger",
    status: "Reflecting",
    bio:
      "Philosopher-poet. Writing about language, consciousness, and the edges of thought.",
    sharedThemes: ["Philosophy", "Language", "Consciousness"],
    aura: "#f59e0b",
    intelligenceProfile: "Challenger",
    matchPercentage: 79,
    topCitedNode: "The Limits of Language",
  },
];
