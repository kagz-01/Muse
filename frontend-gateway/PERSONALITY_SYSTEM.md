# Muse Personality-Driven Humor System

## Overview

The personality-driven humor system generates contextual, personalized prompts based on:
- **User engagement metrics** (streak, resonance score, journal entries, community participation)
- **Time of day** (morning, afternoon, evening)
- **Platform context** (journaling, synthesis, community, onboarding)
- **UI state** (empty, error, loading, success)

This ensures greetings and prompts feel relevant to each user's journey, not generic.

---

## Core Components

### 1. **`utils/dynamicHumor.ts`** - Main System
Generates humor messages based on user engagement and time period.

**Key Function:**
```typescript
generateDynamicHumor(period: GreetingPeriod, userContext?: Partial<UserContext>): string
```

**User Context Metrics:**
- `currentStreak` - cognitive streak (0-N days)
- `resonanceScore` - engagement score (0-1000+)
- `journalEntryCount` - total journal entries
- `roomsJoined` - number of rooms user is active in
- `threadsActive` - number of threads participated in
- `hasUsername` - whether user has completed profile

**Engagement Levels:**
- **High engagement**: 7+ streak, 500+ resonance, 10+ entries → Celebrates momentum & depth
- **Building momentum**: 3+ streak, 200+ resonance → Encourages consistency
- **Community active**: 3+ rooms OR 5+ threads → Acknowledges connection
- **Early stages**: <5 entries → Supportive, foundational messaging
- **Returning user**: 5+ entries but 0 streak → Welcomes back with compassion
- **Default**: Falls back to time-based messages for any other state

---

### 2. **`utils/contextualPrompts.ts`** - UI Context Integration
Provides personality-driven prompts for different UI states and screen contexts.

**Available Contexts:**
- **Empty states**: `empty_journal`, `empty_rooms`, `empty_threads`, `empty_community`
- **Error states**: `error_sync`, `error_network`
- **Loading states**: `loading_deep`
- **Success states**: `success_journal`, `success_synthesis`
- **Setup/onboarding**: `setup_profile`, `setup_first_journal`, `setup_first_room`

**Usage:**
```typescript
const prompt = getContextualPrompt("empty_journal", "morning", userContext);
const emptyState = emptyStateMessages.journal;
const loading = getRandomLoadingMessage();
```

---

## Where to Apply

### ✅ Already Implemented
- **`islands/dashboard/PulseHome.tsx`** - Hero greeting with animated greeting + name + contextual humor
- **`islands/dashboard/HomeOverview.tsx`** - Dashboard heading with dynamic personality-driven subheading

### 🎯 Should Be Implemented
1. **Error Boundaries & Error Pages**
   - Use `errorMessages` from `contextualPrompts.ts`
   - Apply dynamic humor to 404, 500, network error pages

2. **Empty States** (Journal, Rooms, Threads, Community)
   - Already active for journal, rooms, and thread empty states
   - Uses `/api/personality/greeting` for Groq-backed prompts with fallback
   - Add time/engagement context to make feel personalized

3. **Setup/Onboarding Banner**
   - Setup banner now uses the same personality prompt system
   - Encouraging, context-aware messaging is fetched from the API

4. **Loading States**
   - Replace spinner-only UX with `getRandomLoadingMessage()`
   - Show messages that relate to what's being loaded (synthesizing, connecting, etc.)

4. **Setup/Onboarding Flow** (Profile completion, first entry, etc.)
   - Use `getContextualPrompt("setup_*")` to encourage actions
   - Make signup/profile setup feel like beginning a journey, not a chore

5. **Success States**
   - After creating journal entry: "Captured. Your reflection is now part of your wisdom thread."
   - After synthesizing: "Synthesis complete. The threads are woven, the signal is clear."
   - After joining room/community: Celebration message tailored to their engagement

6. **Community/Room Components**
   - Room list headers: Use `getContextualPrompt("empty_community")` when no rooms
   - Thread views: Add personality to "no threads yet" state
   - Collaborator section: Add engagement-aware prompts

7. **Modal/Dialog Headers**
   - Journal entry modal
   - Create room modal
   - Join community modal
   - Share/publish modal

8. **Toast/Notification Messages**
   - Successful sync: engagement-aware celebration
   - Failed action: empathetic error message with humor
   - New achievement unlocked: personality-driven message

9. **Setup Checklist/Banners**
   - "Profile incomplete" banner: Use engagement context to make relatable
   - "First entry" prompt: Time-aware, encouraging
   - "Join a community" CTA: Show personality, not just urgency

---

## Integration Pattern

### For Dashboard/View Components
```typescript
import { generateDynamicHumor, type UserContext } from "../../utils/dynamicHumor.ts";
import { getContextualPrompt, emptyStateMessages } from "../../utils/contextualPrompts.ts";

// In component
const userContext: Partial<UserContext> = {
  currentStreak: user?.cognitiveStreak ?? 0,
  resonanceScore: user?.resonance?.resonanceScore ?? 0,
  journalEntryCount: journalEntries.length,
  roomsJoined: rooms.length,
  threadsActive: threads.length,
  hasUsername: Boolean(user?.username?.trim()),
};

// Time period from context
const period = getTimeContext(user?.timezone).period;

// Get personality-driven message
const prompt = generateDynamicHumor(period, userContext);
const emptyMsg = getContextualPrompt("empty_journal", period, userContext);
```

### For Empty/Error UI
```typescript
import { emptyStateMessages, errorMessages } from "../../utils/contextualPrompts.ts";

// In empty state renderer
<div className="text-center py-12">
  <h3 className="text-lg font-semibold text-white">{emptyStateMessages.journal.title}</h3>
  <p className="text-gray-400 mt-2">{emptyStateMessages.journal.description}</p>
  <button>{emptyStateMessages.journal.cta}</button>
</div>
```

### For Loading States
```typescript
import { getRandomLoadingMessage } from "../../utils/contextualPrompts.ts";

// Show while loading
<div className="text-center">
  <Spinner />
  <p className="text-gray-400 mt-3">{getRandomLoadingMessage()}</p>
</div>
```

---

## AI Integration

Muse now supports Groq-powered personality prompts for the dashboard hero and other contextual greetings. This runs via `/api/personality/greeting` and falls back to deterministic humor when the model is unavailable.

For even more dynamic prompts, integrate with an LLM using this system prompt:

```
You are Muse's personality engine. Generate a single, witty greeting/prompt (1-2 sentences max) that is:
- Encouraging but not saccharine (keep it real)
- Specific to the user's engagement level and time of day
- Relevant to journaling, wisdom synthesis, and community connection
- Uses platform terminology (synthesis, resonance, threads, wisdom, signal)
- Tone: thoughtful mentor who gets the user's journey, slightly philosophical, occasionally humorous

User context:
- Streak: {streak} days
- Resonance score: {resonanceScore}
- Journal entries: {entries}
- Active rooms: {rooms}
- Time of day: {period}

Avoid:
- Generic motivational speaker phrases
- Emojis or exclamation marks
- References to other platforms
- Anything that breaks the Muse aesthetic
```

---

## Component Checklist for Implementation

- [ ] `islands/dashboard/PulseHome.tsx` ✅ DONE
- [ ] `islands/dashboard/HomeOverview.tsx` ✅ DONE
- [ ] Error pages (404, 500, etc.)
- [x] Empty state components (journal, rooms, threads, community)
- [ ] Loading indicators with messages
- [x] Setup/onboarding flow
- [ ] Success toast notifications
- [ ] Community/room component headers
- [ ] Journal entry modals
- [ ] Room creation modals
- [ ] Setup checklist banner
- [ ] Achievement/milestone notifications

---

## Testing

1. **Engagement Levels**: Create test accounts with different metrics to verify messaging varies
2. **Time Sensitivity**: Test morning/afternoon/evening prompts
3. **Empty States**: Verify messaging on fresh accounts and empty views
4. **Error States**: Test network errors, permission denied, not found states
5. **Loading**: Verify random message rotation and context relevance

---

## Maintenance

- Update `HUMOR_MESSAGES` in `dynamicHumor.ts` periodically to keep fresh
- Monitor user feedback on messaging tone
- Expand `UIContext` types as new states emerge
- Consider A/B testing different personality tones
