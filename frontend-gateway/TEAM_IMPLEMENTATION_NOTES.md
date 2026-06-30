# Team Implementation Notes — Frontend Gateway

## Summary

This note captures what is actually implemented in code today, plus the remaining gaps that should be addressed before shipping the solo/community toggle and related UX areas.

## 1. Solo Mode / Privacy Persistence

What exists today:
- `frontend-gateway/signals/user.ts` now derives `soloModeSignal` from `user.privacySecurity.accountVisibility`.
- `toggleSoloMode()` updates both `userSignal.value.privacySecurity.accountVisibility` and `soloModeSignal.value`.
- `toggleSoloMode()` also calls `persistPrivacySecurity()` to write `{ preferences: { privacySecurity: { accountVisibility } } }` to `/api/user/settings`.
- `syncCurrentUserFromBackend()` loads `/api/user/settings` and merges `settings.preferences.privacySecurity` into `userSignal.value`.

Gaps / risk:
- `persistPrivacySecurity()` uses plain `fetch()`, not `safeFetch()`, so offline or transient network failures do not queue the change. If the toggle occurs while offline, the client will flip locally but the backend will never receive the update.
- The persisted state is currently only as durable as the backend call. There is no explicit success/error handling or retry logic for the solo-mode write.
- Demo sessions (`__demo__`) are still a separate path; demo mode does not persist real backend settings beyond the session cookie.

Recommendation:
- Treat the current solo mode persistence as a partial fix. It is now backend-writable for authenticated users, but the offline/write-queue path and demo persistence behavior are still gaps.
- Confirm with the team whether solo mode should be available in offline/demo sessions, and whether it must survive session reloads for authenticated users.

## 2. Demo Mode and Data Shape Drift

What exists today:
- Demo mode is a first-class path using `utils/auth.ts` and `DEMO_USER_ID = "__demo__"`.
- `frontend-gateway/utils/demo_data.ts` exports hard-coded demo fixtures: `DEMO_USER`, `DEMO_ROOMS`, `DEMO_ITEMS`, `DEMO_THREADS`, `DEMO_JOURNALS`, `DEMO_STREAM`, `DEMO_CIRCLES`, `DEMO_COLLABORATORS`.
- `signals/journal.ts`, `signals/rooms.ts`, `signals/threads.ts`, `signals/items.ts`, and other modules branch on `userSignal.value?.id === "__demo__"` and load demo fixtures.
- `routes/api/user/settings.ts` and page routes like `routes/dashboard/index.tsx` also handle `userId === "__demo__"` explicitly.

Gaps / risk:
- There is no shared runtime schema or formal contract enforcing that demo fixtures match the live signal/model shapes.
- Demo data is spread across multiple files and multiple conditional code paths, so as live models evolve, the demo fixtures can silently drift.
- Some demo branches use local payload normalization and others use server-side route fallbacks, increasing the maintenance burden.

Recommendation:
- Treat demo mode as a high-risk drift area. Either centralize the demo fixture contracts or add a schema validation layer for demo data to ensure it always matches the live signal types.
- Validate the demo path across rooms, threads, items, and journals whenever the live model changes.

## 3. `safeFetch()` Optimistic UI + 202 Pattern

What exists today:
- `frontend-gateway/utils/safeFetch.ts` returns a synthetic `202 Accepted` response when a write fails due to network offline.
- It queues failed write operations in `frontend-gateway/utils/syncQueue.ts` and replays them on reconnect.
- `registerIdSwapCallback()` exists for `journal`, `thread`, `room`, and `item` entities so temporary IDs can be swapped after a queued POST succeeds.

Gaps / risk:
- UI state can appear committed even though the backend has not yet accepted it.
- High write volume raises two issues:
  - queued operations may replay out of sync with the current client state,
  - ID-swaps may arrive after the UI has already re-rendered or after other dependent writes.
- There is no documented strategy for reconciling stale queued writes, conflicting server state, or failure modes after retries exhaust.

Recommendation:
- Document the current reconciliation strategy and explicitly call out that `safeFetch` is an eventual-consistency queue, not immediate persistence.
- Consider adding a stronger ID-swap / conflict-resolution mechanism if the user is likely to perform many offline writes before reconnecting.

## 4. Theme State and Design Token Sync

What exists today:
- `frontend-gateway/signals/ui.ts` stores theme state in `appThemeSignal`, `appAccentSignal`, `customAccentHexSignal`, and `appFontSizeSignal`.
- Theme application is performed by writing directly to `document.documentElement`:
  - `data-theme`
  - `--muse-accent-rgb`
  - font-size
  - `data-compact`
  - `data-animations`
  - `data-reduce-motion`
- Appearance preferences persist to `localStorage` under `muse-fresh-settings`.

Gaps / risk:
- This logic is tightly coupled to the current design-token names and CSS variable naming conventions.
- If the frontend/design system changes the CSS variable names, `signals/ui.ts` must be updated too.
- There is no centralized mapping between design system tokens and the theme signal updates.

Recommendation:
- Keep a single source of truth for theme token names or centralize the CSS variable mapping in one module.
- Add a quick regression test or engineering note whenever design tokens change in the CSS codebase.

## 5. Mirror Aggregation and Scaling

What exists today:
- `frontend-gateway/signals/mirror.ts` computes `mirrorSignal` entirely from client-side signals: `journalSignal`, `roomsSignal`, `threadsSignal`, and `userSignal`.
- `MirrorDashboard.tsx` calls `loadMirrorStats(currentUserId)` on mount.
- `routes/api/mirror.ts` exists, but it is a mock stats endpoint and is not used by `loadMirrorStats()`.

Gaps / risk:
- Mirror state is recomputed client-side on every load rather than being fetched from a dedicated backend aggregate.
- This is especially risky for scaling because it re-reads and reduces multiple large arrays in the browser on each render.
- The current implementation also means mirror metrics are inferred locally and may not match backend engagement analytics.

Recommendation:
- Revisit `signals/mirror.ts` and the mock `/api/mirror.ts` integration. Decide if mirror should be a backend-computed analytics endpoint rather than a pure client-side derivation.
- If a backend aggregate is desired, wire `MirrorDashboard` to the backend endpoint and migrate the logic from the client to the server.

## 6. Entanglement Naming / Team Confusion

What exists today:
- `entanglements` is used in community/connect logic for accepted social partners.
- `streak_entanglements` appears in database migrations and is a separate concept related to streak data.

Recommendation:
- Flag this naming distinction explicitly in any onboarding and code walkthrough materials.
- Prefer explicit naming in docs and/or rename one of the tables if possible to reduce accidental conflation.

## Immediate Next Steps

1. Confirm whether solo mode should be persistent by default for authenticated users and whether offline/demo toggles are expected to behave the same.
2. Add or improve persistence for `persistPrivacySecurity()` so it matches the `safeFetch` queue semantics or clearly document the one-off failure behavior.
3. Consolidate demo fixtures into a shared shape validation layer or schema contract.
4. Document the `safeFetch` 202 behavior clearly in the codebase and triage flow after reconnect.
5. Decide whether `mirrorSignal` should remain client-side or become a dedicated backend aggregate, and remove the unused mock API or integrate it.
6. Add a short note to architecture docs that `entanglements` and `streak_entanglements` are distinct.
