# TanStack Full Migration

## Goal

Move every Fresh page, API, signal-backed product flow, database operation, and service integration into the root TanStack Start application, then verify parity and remove `fresh/`.

## Tasks

- [x] Inventory every Fresh route and API against TanStack, with a parity checklist.
- [x] Add shared TanStack server modules for journal, items, threads, streaks, profile/settings, community, artifacts, synthesis, and exports.
- [x] Add all missing TanStack product pages and dynamic compatibility routes.
- [x] Add all missing TanStack server API handlers with authentication, authorization, demo behavior, validation, and PostgreSQL persistence.
- [x] Wire AI engine, uploads, extraction, health, and account flows into the TanStack runtime.
- [ ] Add focused route, server, and build tests covering migrated flows.
- [x] Verify every Fresh route/API has a TanStack equivalent and run the full build/test/HTTP parity suite.
- [x] Remove `fresh/` and `Deno Fresh` runtime files only after parity verification passes.
- [x] Update deployment, README, Docker, environment and package configuration for the final TanStack-only tree.

## Done When

- Every Fresh product page and API listed in this plan is reachable in TanStack.
- No route depends on `fresh/` code or Deno imports.
- Build and tests pass.
- HTTP route/API parity checks pass.
- `fresh/` is removed.
- README, Docker, scripts and package configuration describe TanStack only.
