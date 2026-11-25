/**
 * demo_data.ts
 * Single source of truth for rich demo content used when a user is in Demo Mode.
 */

const now = Date.now();
const iso = (offset: number) => new Date(now - offset).toISOString();

export const DEMO_USER = {
  id: "__demo__",
  username: "stranger",
  email: "stranger.danger@demo.muse",
  name: "Stranger Danger",
  bio: "I leave traces in the margins, collect fragments of other people's weather, and keep my own name in the shadows.",
  location: "Somewhere between the station and the sea",
  gender: "Non-binary",
  pronouns: "they / them",
  birthDate: "1992-10-04",
  occupation: "Signal courier • night archivist",
  timezone: "Europe/London",
  website: "https://stranger-danger.dev",
  avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=stranger",
  auraType: "Guardian" as const,
  auraColor: "#f97316",
  cognitiveStreak: 7,
  resonance: { views: 1320, connections: 91, resonanceScore: 781 },
  weeklyInsights: {
    resonanceScore: 84,
    topThemes: ["urban folklore", "unspoken signals", "private rituals"],
    synthesisCount: 6,
  },
  synthesisLineage: {
    totalRooms: 3,
    totalArtifacts: 8,
    wovenThreads: 2,
  },
  links: [
    { title: "Mastodon", url: "https://mastodon.social/@strangerdanger" },
    { title: "Obsidian", url: "https://obsidian.md" },
    { title: "Signal", url: "https://signal.org" },
  ],
  publicSettings: {
    showProfile: true,
    showLocation: true,
    showRooms: false,
    showThreads: false,
    showInsights: true,
  },
  privacySecurity: {
    accountVisibility: "connections" as const,
    showEmailInProfile: false,
    allowSearchIndexing: false,
    twoFactorEnabled: false,
  },
};

export const DEMO_ROOMS = [
  {
    id: "demo-r1",
    name: "Love & Romance",
    title: "Love & Romance",
    description:
      "A room for notes, screenshots, voice memos, and half-finished thoughts about intimacy, affection, and the messy texture of modern romance.",
    emoji: "💘",
    category: "journal",
    size: "large",
    mood: "warm",
    themeColor: "rose",
    isPublic: true,
    count: 6,
    tags: ["romance", "relationships", "attachment", "intimacy"],
    notificationsEnabled: true,
    updatedAt: iso(2 * 24 * 60 * 60 * 1000),
    semanticTags: ["dating", "love languages", "social cues"],
    resonanceMetrics: { views: 1240, wovenCount: 18 },
    coverImage:
      "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=80",
    customStyling: { auraIntensity: 0.9, fontFamily: "Cormorant Garamond" },
  },
  {
    id: "demo-r2",
    name: "Quiet Rituals",
    title: "Quiet Rituals",
    description:
      "A living collection of reflections on attention, identity, and the habits that make a life feel steadier and more honest.",
    emoji: "🌿",
    category: "journal",
    size: "medium",
    mood: "zen",
    themeColor: "emerald",
    isPublic: true,
    count: 4,
    tags: ["ritual", "attention", "identity", "self-trust"],
    notificationsEnabled: true,
    updatedAt: iso(6 * 24 * 60 * 60 * 1000),
    semanticTags: ["human behavior", "rituals", "attention"],
    resonanceMetrics: { views: 911, wovenCount: 11 },
    coverImage:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    customStyling: { auraIntensity: 0.75, fontFamily: "Playfair Display" },
  },
];

export const DEMO_ITEMS = [
  {
    id: "demo-i1",
    roomId: "demo-r1",
    title: "Instagram carousel: small gestures, big meaning",
    sourceUrl: "https://www.instagram.com/p/CyRj0f5Jm2g/",
    note:
      "A real-looking social post that captures how tiny acts of care can feel more intimate than grand declarations.",
    isPublic: true,
    createdAt: iso(3 * 60 * 60 * 1000),
    dataProvenance: {
      platform: "Instagram",
      extractedAt: iso(3 * 60 * 60 * 1000),
      integrityHash: "sha256-demo-1",
    },
    authorId: "__demo__",
    authorName: "Stranger Danger",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=stranger",
  },
  {
    id: "demo-i2",
    roomId: "demo-r1",
    title: "PDF excerpt: love languages in long-term relationships",
    sourceUrl: "https://www.attachmentproject.com/pdf/attachment-and-love-languages.pdf",
    note:
      "A document-style artifact that looks like a real attachment theory handout someone saved from a workshop or therapist session.",
    isPublic: true,
    createdAt: iso(18 * 60 * 60 * 1000),
    dataProvenance: {
      platform: "PDF",
      extractedAt: iso(18 * 60 * 60 * 1000),
      integrityHash: "sha256-demo-2",
    },
    authorId: "__demo__",
    authorName: "Stranger Danger",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=stranger",
  },
  {
    id: "demo-i3",
    roomId: "demo-r2",
    title: "YouTube clip: morning rituals that make the day feel lighter",
    sourceUrl: "https://www.youtube.com/watch?v=4s7QkYhP5JY",
    note:
      "A video artifact that feels like a genuine saved reference from someone trying to build a calmer, more intentional morning routine.",
    isPublic: true,
    createdAt: iso(30 * 60 * 60 * 1000),
    dataProvenance: {
      platform: "YouTube",
      extractedAt: iso(30 * 60 * 60 * 1000),
      integrityHash: "sha256-demo-3",
    },
    authorId: "__demo__",
    authorName: "Stranger Danger",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=stranger",
  },
  {
    id: "demo-i4",
    roomId: "demo-r2",
    title: "X thread: the difference between comfort and self-abandonment",
    sourceUrl: "https://x.com/psychologytoday/status/1775404517627285450",
    note:
      "A short social thread that feels like something someone actually bookmarked while thinking about boundaries and self-respect.",
    isPublic: true,
    createdAt: iso(45 * 60 * 60 * 1000),
    dataProvenance: {
      platform: "X",
      extractedAt: iso(45 * 60 * 60 * 1000),
      integrityHash: "sha256-demo-4",
    },
    authorId: "__demo__",
    authorName: "Stranger Danger",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=stranger",
  },
];

export const DEMO_THREADS = [
  {
    id: "demo-t1",
    title: "Synthesis: Attention, Systems, and Trust",
    description:
      "A public thread that connects the architecture room with the habits of attention and self-trust.",
    mood: "focus",
    format: "essay",
    depth: "80",
    theme: "Pattern synthesis",
    itemIds: ["demo-i1", "demo-i2"],
    sourceRoomIds: ["demo-r1"],
    isPublic: true,
    updatedAt: iso(2 * 60 * 60 * 1000),
    coverImage:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
    thesis:
      "The strongest systems are the ones that make trust legible, not just efficient.",
    synthesisScore: 92,
    resonanceMetrics: { views: 1180, connections: 37 },
    dialogueLayers: [
      {
        id: "demo-d1",
        userId: "__demo__",
        userName: "Stranger Danger",
        content:
          "It felt important to connect the design of attention with the design of trust. They are the same choreography in different forms.",
        type: "insight",
        resonanceScore: 58,
        timestamp: iso(90 * 60 * 1000),
      },
    ],
    customStyling: { auraGradients: ["#6366f1", "#10b981"] },
    synthesis: {
      patterns: ["attention", "trust", "systems thinking"],
      tensions: ["efficiency vs clarity"],
      coherenceScore: 91,
      recommendations: ["Link this thread to more ritual-driven reflections"],
    },
  },
  {
    id: "demo-t2",
    title: "The Ritual Layer of Human Behavior",
    description:
      "A synthesis of reflection, habit, and identity that brings together the orchard of human patterns.",
    mood: "zen",
    format: "manifesto",
    depth: "70",
    theme: "Human patterns",
    itemIds: ["demo-i3", "demo-i4"],
    sourceRoomIds: ["demo-r2"],
    isPublic: true,
    updatedAt: iso(8 * 60 * 60 * 1000),
    coverImage:
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80",
    thesis:
      "Ritual gives shape to attention, and shape makes trust feel possible.",
    synthesisScore: 88,
    resonanceMetrics: { views: 940, connections: 29 },
    dialogueLayers: [
      {
        id: "demo-d2",
        userId: "__demo__",
        userName: "Stranger Danger",
        content:
          "The best rituals are simple enough to repeat and serious enough to matter.",
        type: "signal",
        resonanceScore: 41,
        timestamp: iso(6 * 60 * 60 * 1000),
      },
    ],
    customStyling: { auraGradients: ["#10b981", "#f59e0b"] },
    synthesis: {
      patterns: ["ritual", "identity", "attention"],
      tensions: ["digital distraction vs quiet repetition"],
      coherenceScore: 87,
      recommendations: ["Add a reflective journal entry to close the loop"],
    },
  },
];

export const DEMO_JOURNALS = [
  {
    id: "demo-j1",
    body:
      "The most useful systems are the ones that reduce friction without flattening the human layer. I keep noticing how much trust lives in the small repeatable behaviors we barely name. When I write them down, I can see the architecture behind my own peace.",
    mood: "reflective",
    tags: ["systems", "trust", "clarity", "ritual"],
    linkedItemIds: ["demo-i1", "demo-i2"],
    isFavorited: true,
    isPublic: true,
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    wordCount: 56,
    type: "synthesis",
    synthesis: {
      sourceRoomIds: ["demo-r1"],
      sourceThreadIds: ["demo-t1"],
      keyInsights: ["Trust is designed", "Attention is a system input"],
      patterns: ["trust", "systems", "attention"],
      nextActions: ["Add a tighter notes map to the room"],
      synthesizedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    },
    linkedArtifacts: [
      { id: "demo-i1", type: "room" as const, title: "How attention shapes product design", linkedAt: Date.now() - 2 * 24 * 60 * 60 * 1000 },
      { id: "demo-t1", type: "thread" as const, title: "Synthesis: Attention, Systems, and Trust", linkedAt: Date.now() - 2 * 24 * 60 * 60 * 1000 },
    ],
    viewCount: 73,
  },
  {
    id: "demo-j2",
    body:
      "The rituals I keep are not ornamental. They are bridge points between the chaotic world outside and the steadier version of me that shows up when I slow down. A simple page, a consistent cup of tea, a few minutes of silence. These are not extras. They are the infrastructure of attention.",
    mood: "grounded",
    tags: ["ritual", "attention", "identity", "reflection"],
    linkedItemIds: ["demo-i3", "demo-i4"],
    isFavorited: true,
    isPublic: true,
    createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    wordCount: 62,
    type: "reflection",
    synthesis: {
      sourceRoomIds: ["demo-r2"],
      sourceThreadIds: ["demo-t2"],
      keyInsights: ["Ritual is infrastructure", "Identity stabilizes through repetition"],
      patterns: ["ritual", "identity", "attention"],
      nextActions: ["Bring this into an upcoming room note"],
      synthesizedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    },
    linkedArtifacts: [
      { id: "demo-i3", type: "room" as const, title: "The psychology of ritual and habit", linkedAt: Date.now() - 5 * 24 * 60 * 60 * 1000 },
      { id: "demo-t2", type: "thread" as const, title: "The Ritual Layer of Human Behavior", linkedAt: Date.now() - 5 * 24 * 60 * 60 * 1000 },
    ],
    viewCount: 49,
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
    timestamp: iso(60 * 60 * 1000),
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
    timestamp: iso(3 * 60 * 60 * 1000),
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
    timestamp: iso(5 * 60 * 60 * 1000),
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
    bio: "Product designer exploring the intersection of AI and human behavior.",
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
    bio: "Systems engineer. Obsessed with elegant abstractions and distributed systems.",
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
    bio: "Philosopher-poet. Writing about language, consciousness, and the edges of thought.",
    sharedThemes: ["Philosophy", "Language", "Consciousness"],
    aura: "#f59e0b",
    intelligenceProfile: "Challenger",
    matchPercentage: 79,
    topCitedNode: "The Limits of Language",
  },
];
