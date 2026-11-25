# TanStack Full Migration

Migration is still in progress. The authoritative Fresh implementation is retained at `fresh/`; matching file counts or a successful build do not establish behavioral parity. Keep each item below open until it has been checked against the Fresh implementation and verified in TanStack.

## Goal

Move every Fresh page, API, signal-backed product flow, database operation, and service integration into the root TanStack Start application, then verify parity and remove `fresh/`.

## Tasks

- [ ] Inventory every Fresh page, API route, and route alias against TanStack, with a behavior-level parity checklist.
- [ ] Port and verify shared server modules for journal, items, threads, streaks, profile/settings, community, artifacts, synthesis, and exports.
- [ ] Port and verify every product page, including dynamic routes, layouts, and compatibility aliases.
- [ ] Port and verify every API handler, including authentication, authorization, demo behavior, validation, and persistence.
- [ ] Wire and verify AI engine, uploads, extraction, health, and account flows in the TanStack runtime.
- [ ] Add focused route, server, and build tests covering migrated flows.
- [ ] Verify every Fresh page/API has an equivalent and run build, tests, and HTTP behavior checks.
- [ ] Remove `fresh/` and Deno Fresh runtime files only after parity verification passes.
- [ ] Verify deployment, README, Docker, environment, and package configuration for the final TanStack-only tree.

## Current path-level audit

The current generated route-tree comparison has no Fresh-only URL paths. The canonical TanStack `/rooms/$id` workspace covers room artifacts, threads, upload, synthesis, and journal capture; the legacy `/dashboard/rooms/$id` URL redirects to it, and the previous room editor remains available at `/rooms/$id/edit`. Non-demo database and AI-service behavior still needs integration verification. TanStack `/api/artifacts` was added to support the workspace and has no Fresh route counterpart. The unused TanStack-only `/api/social` duplicate was removed; `/api/followers/follow` remains the canonical follow endpoint. The Fresh `/api/user/social` response and item-access behavior has been ported and covered by API tests, but PostgreSQL integration remains unverified. TanStack's `/streaks` page is still a minimal page; the Fresh `StreakHub` UI has not yet been migrated.

Matching URL paths do not establish parity for HTTP methods, authorization, persistence, error handling, or page behavior.

## Done When

- Every Fresh product page and API listed in this plan is reachable in TanStack.
- No route depends on `fresh/` code or Deno imports.
- Build and tests pass.
- HTTP route/API parity checks pass.
- `fresh/` is removed.
- README, Docker, scripts and package configuration describe TanStack only.
