# Frontend Gateway Architecture

This document describes the `frontend-gateway` architecture in Muse, with a focus on functional flow and implementation details for Rooms, Threads, Journal, Streak, Mirror, Profile, Settings, Community, and Solo Mode.

## High-level architecture

The frontend is built with Deno Fresh and Preact signals.

- `frontend-gateway/routes/(app)/` contains main authenticated pages.
- `frontend-gateway/islands/` contains interactive client islands that hydrate on the browser.
- `frontend-gateway/signals/` contains shared reactive state using `@preact/signals`.
- `frontend-gateway/utils/` contains shared helpers such as `safeFetch`, sync queue helpers, contextual prompts, and auth helpers.
- `frontend-gateway/routes/(app)/_layout.tsx` defines the base layout wrapper, header/menu, and global page shell.

## Route -> Island mapping

### Core pages

- `/dashboard` → `routes/(app)/dashboard.tsx` → `PulseHome` + `CommunityPulseStripIsland`
- `/rooms` → `routes/(app)/rooms/index.tsx` → `RoomsGallery`
- `/rooms/[id]` → `routes/(app)/rooms/[id].tsx` → `RoomInside`
- `/threads` → `routes/(app)/threads/index.tsx` → `ThreadsGallery`
- `/threads/[id]` → `routes/(app)/threads/[id].tsx` → `ThreadInside`
- `/journal` → `routes/(app)/journal/index.tsx` → `JournalGallery`
- `/mirror` → `routes/(app)/mirror.tsx` → `MirrorDashboard`
- `/profile` → `routes/(app)/profile.tsx` → `ProfilePage`
- `/profile/[userId]` → public profile page
- `/settings` → `routes/(app)/settings.tsx` → `Settings`
- `/journal-community` → `routes/(app)/journal-community.tsx` → `CommunityPage`
- `/connections` → `routes/(app)/connections.tsx` → `ConnectionsHub`
- `/streaks` → `routes/(app)/streaks/index.tsx` → `StreakHub`

### Shared wrapper

- `AppLayoutWrapper` in `frontend-gateway/islands/layout/index.ts` is the main shell.
- `AppHeader`, `AppMenu`, and `SyncStatusBadge` are present for navigation, menu, and connection status.
- `DemoSessionHydrator` and `DemoModeBanner` support demo users and local demo data.

## Reactive state model

The app state is centralized in signals. Each feature has at least one signal file that exposes reactive arrays or objects.

### User state

- `frontend-gateway/signals/user.ts`
  - `userSignal` stores current user profile, aura, resonance, public settings, and privacy settings.
  - `soloModeSignal` stores whether Solo Mode is active.
  - `setupBannerDismissedSignal` records whether the setup guide has been dismissed.
  - `syncCurrentUserFromBackend()` fetches `/api/profile` and `/api/user/settings`.
  - `toggleSoloMode()` flips Solo Mode locally.
  - `updateProfile()`, `togglePublicSetting()`, `updatePrivacySecurity()`, `addLink()`, `removeLink()` update user state.

### Rooms

- `frontend-gateway/signals/rooms.ts`
  - `roomsSignal` is the live collection of rooms.
  - Demo mode loads demo rooms from `DEMO_ROOMS` and persists them to `localStorage`.
  - `syncRoomsFromBackend()` fetches `/api/rooms`.
  - `addRoom()` creates rooms via `/api/rooms` with optimistic fallback.
  - Rooms include metadata: `themeColor`, `customThemeHex`, `mood`, `category`, `semanticTags`, `resonanceMetrics`, `coverImage`, `customStyling`, `isVault`, and notification preferences.

### Items / Artifacts

- `frontend-gateway/signals/items.ts`
  - `itemsSignal` is the artifact collection per room.
  - `addItem()` posts to `/api/items`; demo mode uses local state.
  - `deleteItem()` removes artifacts and cleans thread references with `removeItemFromThread()`.
  - Items contain provenance, author attributes, attachments, and annotations.

### Threads

- `frontend-gateway/signals/threads.ts`
  - `threadsSignal` stores synthesis threads.
  - Each thread includes `mood`, `format`, `depth`, `theme`, `itemIds`, `sourceRoomIds`, `dialogueLayers`, `resonanceMetrics`, `customStyling`, `synthesis`, and privacy flags.
  - `addThread()`, `updateThread()`, `addDialogueLayer()`, and `toggleThreadPrivacy()` mutate thread state and sync backend.
  - Backend writes use `safeFetch` and optimistic updates; queued network writes can be retried later.

### Journal

- `frontend-gateway/signals/journal.ts`
  - `journalSignal` stores entries with mood, tags, linked items, public/private state, syntheses, and vault access.
  - `streakMetadataSignal` stores journal streak metadata.
  - `addEntry()`, `updateJournalEntry()`, `toggleFavoriteJournal()`, `togglePinJournal()`, `toggleArchiveJournal()`, `deleteJournalEntry()` manage journal lifecycle.
  - New entries update the streak engine with `/api/user/streaks` for momentum capture.
  - Entries are normalized for demo mode and persisted locally.

### Streaks

- `frontend-gateway/signals/streaks.ts`
  - `globalStreakSignal` stores global streak summary data.
  - `streaksSignal` stores personal streak pairs and history.
  - `momentumFeedSignal` stores feed items for streak-related momentum.
  - `loadGlobalStreak()` fetches `/api/user/streaks` and uses fallback demo values.
  - `extendStreak()`, `startStreak()`, `removeStreak()`, `pruneBrokenStreaks()` update streak state.
  - `setSparkPermissions()` updates permissions shared with the community.

### Mirror

- `frontend-gateway/signals/mirror.ts`
  - `mirrorSignal` stores engagement stats, activity, follower counts, and follower history.
  - `loadMirrorStats()` calculates mirror metrics from `journalSignal`, `roomsSignal`, `threadsSignal`, and `userSignal`.
  - This is a client-side aggregation and does not currently represent a dedicated backend mirror/analytics endpoint.
  - Because it is inferred from local signal state, it can drift from actual backend engagement metrics and should be treated as an inferred activity glance.
  - Mirror stats include views, likes, comments, collaborations, follows, circle joins, and recent activity entries.

### Connections / Community

- `frontend-gateway/signals/connections.ts`
  - `circlesSignal`, `collaborationSparkSignal`, `collaboratorsSignal`, `communityRoomsSignal`, `perspectivesSignal` provide community graph data.
  - `activeThemesSignal` stores trending themes for shared intelligence.
  - `syncStatusSignal` tracks network health of the collaboration engine.

### UI theme state

- `frontend-gateway/signals/ui.ts`
  - `appThemeSignal`, `appAccentSignal`, `appFontSizeSignal`, `customAccentHexSignal` control application theming.
  - `notificationsSignal` is the app notification queue.
  - `initializeTheme()`, `setTheme()`, `toggleTheme()` update the DOM theme, accent, and font size.
  - Appearance changes persist in `localStorage` under `muse-fresh-settings`.
- The app also bootstraps theme state in `frontend-gateway/routes/_app.tsx` before hydration, so the SSR shell and browser theme behavior are coupled.

1. User visits `/rooms`.
2. `RoomsGallery` renders `roomsSignal.value`.
3. User creates a room via `CreateRoomModal`; `addRoom()` posts to `/api/rooms` and updates `roomsSignal`.
4. User opens `/rooms/[id]`.
5. `RoomInside` renders the room and its artifacts from `itemsSignal.value` filtered by `roomId`.
6. User captures an artifact using `ArtifactExtractor`; it calls `addItem()`.
7. Artifacts flow into synthesis threads via `addThread()` or directly into visualization components.
8. Room state includes mood, theme, custom styling, semantic tags, resonance metrics, and vault settings.

### Thread flow

1. User visits `/threads`.
2. `ThreadsGallery` renders `threadsSignal.value`, supports search, mood filters, visibility filters, and empty-state prompts.
3. Thread creation is done through `CreateThreadModal` or inline actions.
4. New thread data includes source rooms, artifact item ids, and synthesis metadata.
5. `ThreadInside` renders thread details, `dialogueLayers`, and supports private/public toggles.
6. Deleting an item removes references inside threads via `removeItemFromThread()`.
7. Thread updates flow through `updateThread()` and backend sync via `safeFetch`.

### Journal flow

1. User visits `/journal`.
2. `JournalGallery` renders `journalSignal.value` and accepts server-provided `initialEntries`.
3. Users can filter by mood, visibility, type, favorites, and search text.
4. `addEntry()` creates journal content and updates streak metadata.
5. Journal changes persist to backend with `safeFetch` and queue fallback.
6. Public journal entries appear in community and mirror contexts.

### Streak and momentum flow

1. User visits `/streaks`.
2. `StreakHub` renders `globalStreakSignal.value` and `momentumFeedSignal.value`.
3. Streaks are extended with content actions and capture momentum through `/api/user/streaks`.
4. Streak permissions control which details are visible in shared feeds.
5. `StreakHub` also exposes prompt-driven synthesis and partner spark interactions.

### Mirror flow

1. User visits `/mirror`.
2. `MirrorDashboard` calls `loadMirrorStats(currentUserId)` and `loadGlobalStreak()`.
3. Mirror aggregates `journalSignal`, `roomsSignal`, `threadsSignal`, and `userSignal`.
4. Metrics are shown as charts, heatmap, top themes, and engagement KPIs.
5. Mirror is the analytics mirror of activity, linking reflection, resonance, and momentum.

### Profile flow

1. User visits `/profile`.
2. `ProfilePage` hydrates by syncing backend via `syncCurrentUserFromBackend()`.
3. Profile aggregates counts from `roomsSignal`, `itemsSignal`, `threadsSignal`, and `journalSignal`.
4. Achievements are computed from the active state.
5. Profile includes public meta, bio, avatar, social links, and logout behavior.

### Settings flow

1. User visits `/settings`.
2. `Settings` loads saved preferences from `localStorage` and backend.
3. Appearance: theme, accent, font size, compact mode, animations, motion reduction.
4. Notifications: email, push, in-app, replies, likes, follows, achievements, weekly digest.
5. Privacy & data: profile visibility, search indexing, two-factor, export format.
6. Profile settings can update user info, links, and public settings.
7. Local persistence is stored under `muse-fresh-settings`.

### Community and connections flow

1. `/journal-community` renders `CommunityPage`.
2. `ConnectionsHub` loads `/api/community/stream`, `/api/community/circles`, `/api/community/collaborators`, and `/api/community/collaborations`.
3. Community signals include circles, collaboration sparks, collaborators, and wisdom perspectives.
4. Solo Mode is exposed through `soloModeSignal`; when active it changes how community feeds are rendered and how collaborative features are surfaced.
5. `ConnectionsHub` also surfaces joined circles, active tabs, collaboration invitations, and theme pulse data.

### Solo Mode

- Controlled by `soloModeSignal` in `signals/user.ts`.
- Toggled by `toggleSoloMode()`.
- Influences UI patterns in `ConnectionsHub`, `ProfilePage`, and other islands where mode-specific content appears.
- Solo Mode state is purely client-side and is not persisted across page reloads or sessions.
- This means Solo Mode is effectively a temporary UI mode, not a durable user preference.

### Demo mode

- Demo mode is a first-class path backed by `frontend-gateway/routes/api/auth/demo.ts`.
- The demo session is persisted with the `muse_demo_session` cookie and identifies users as `__demo__`.
- When `userSignal.value?.id === "__demo__"`, signals such as `threadsSignal`, `roomsSignal`, `itemsSignal`, `journalSignal`, and `mirrorSignal` load demo data and often persist it to `localStorage`.
- Demo data is intentionally separate from live backend data and is sourced from `frontend-gateway/utils/demo_data.ts`.
- Demo mode is persistent across page navigations, but the dataset remains client-side and is not synchronized with a backend demo store.

## UX and theme semantics

### Room themes and moods

Rooms include: `RoomTheme`, `RoomMood`, `RoomCategory`, `RoomSize`, `customThemeHex`, and `customStyling`.

Mood options defined in `signals/rooms.ts` include:
- focus
- zen
- chaos
- energetic
- melancholy
- dreamy
- noir
- warm
- electric
- minimal
- cosmic
- storm

These appear in room cards, detail pages, and ambient gradients.

### App theming

UI theme signals drive the whole app:
- `appThemeSignal`: dark / dim / tint / light
- `appAccentSignal`: cyan / blue / purple / pink / green / yellow / red / white
- `appFontSizeSignal`: small / medium / large
- `customAccentHexSignal`: custom accent color on top of theme

The theme system writes CSS variables to the document root and restores values from `localStorage`.
- The DOM theme state is also bootstrapped on initial hydration in `frontend-gateway/routes/_app.tsx`.
- This coupling means design-token changes to CSS variables or accent maps must be kept in sync with both signal logic and the SSR bootstrap script.

## Offline / sync resilience

### `safeFetch`

- Wrapped in `frontend-gateway/utils/safeFetch.ts`
- Writes (`POST`, `PUT`, `DELETE`, `PATCH`) are queued when network requests fail.
- Returns a synthetic `202 Accepted` response so optimistic UI stays responsive.
- Uses `pushToQueue()` and `registerIdSwapCallback()`.
- Current id swap callbacks are registered in signal files for `journal`, `thread`, `item`, and `room`.
- This means temporary optimistic IDs are resolved only if the queued operation later succeeds and the backend returns a real entity ID.
- The UI can diverge from backend state until the queue flush completes, so reconciliation strategy should be explicit for temp-id swapping and failed writes.

### LocalStorage persistence

- Demo mode stores signals in localStorage for rooms, threads, items, journal, and streak metadata.
- Theme and settings persist in `muse-fresh-settings`.
- Setup banner dismissal is stored per user.

## Data lineage and feature linkage

### Room → Artifact → Thread → Mirror

- Rooms collect artifacts and content.
- Artifacts are created inside rooms and can be used as source items for threads.
- Threads are synthesis units built from room artifacts and may include dialogue.
- Mirror aggregates room, thread, and journal activity to produce analytics.

### Journal → Streak → Mirror

- Journal entries capture personal reflection.
- New entries update streak metadata and momentum.
- Streaks are surfaced in the mirror and shared community flow.

### Community / Connections → Themes

- The connections layer tracks shared themes, circles, collaborators, and alignment relationships.
- Active themes are surfaced in `MirrorDashboard`, community charts, and trend cards.
- Community data is fetched from backend APIs and combined with local signals.

## Backend integration points

- `/api/rooms` → rooms sync and creation
- `/api/threads` → thread creation and updates
- `/api/journal` → journal entry create/update/delete
- `/api/items` → artifact creation and delete
- `/api/user/streaks` → streak loading and momentum capture
- `/api/profile` + `/api/user/settings` → profile hydration
- `/api/community/*` → community stream, circles, collaborators, collaborations
- `/api/rooms`, `/api/threads`, `/api/items` sync functions for authenticated users

## Notes and best-viewed behavior

- The frontend is deliberately signal-driven: pages render from shared state, not from local component state alone.
- Routes are lightweight; most business logic lives in islands and signal files.
- Demo mode is a first-class path; it keeps an app-running experience even without backend auth.
- The app uses optimistic local updates with fallback queueing for network failure.
- The design favors rich exploratory workflows: collection, synthesis, community sharing, and reflection.

## Recommended reference files

- `frontend-gateway/signals/rooms.ts`
- `frontend-gateway/signals/threads.ts`
- `frontend-gateway/signals/journal.ts`
- `frontend-gateway/signals/streaks.ts`
- `frontend-gateway/signals/mirror.ts`
- `frontend-gateway/signals/user.ts`
- `frontend-gateway/signals/ui.ts`
- `frontend-gateway/islands/rooms/RoomInside.tsx`
- `frontend-gateway/islands/threads/ThreadsGallery.tsx`
- `frontend-gateway/islands/journal/JournalGallery.tsx`
- `frontend-gateway/islands/mirror/MirrorDashboard.tsx`
- `frontend-gateway/islands/settings/Settings.tsx`
- `frontend-gateway/islands/connections/ConnectionsHub.tsx`
- `frontend-gateway/utils/safeFetch.ts`
