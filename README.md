# Muse Collective 3.0

**Muse** is a knowledge workspace built to transform captured signals into personal and collective intelligence. The application runs on TanStack Start and Node.js, with a Python AI engine, PostgreSQL, and a modular blockchain/security service.

## What’s in this repository

- repository root — TanStack Start + React application
- `fresh/` — original Deno Fresh implementation, retained as migration reference
- `ai-engine/` — Python AI and NLP engine, analysis pipeline, scraper modules
- `blockchain-security/` — Rust smart-contract and blockchain security tooling
- `database/` — SQL schema and database initialization scripts

## Core product flows

Muse centers on an integrated flow across Rooms, Threads, Journal, Streaks, Mirror, Profile, Settings, and Community.

1. **Rooms**
   - Capture artifacts and source material in themed knowledge rooms.
   - Rooms are the entry point for organizing raw signals and collecting context.

2. **Threads**
   - Connect artifacts and journal reflections into synthesis threads.
   - Threads become living documents that preserve the relationships between ideas.

3. **Journal**
   - Record private reflections, synthesis notes, and daily entries.
   - Journal entries feed streak tracking and mirror analytics.

4. **Streaks & Momentum**
   - Track ongoing writing, capture momentum, and surface streak-based progress.
   - Streaks are part of the personal growth loop and influence mirror analytics.

5. **Mirror**
   - Reflect user engagement, resonance, activity history, and profile metrics.
   - The Mirror dashboard aggregates Rooms, Threads, Journal, and community signals.

6. **Profile & Settings**
   - Manage your public profile, privacy settings, appearance, and notifications.
   - Solo Mode can be toggled to shift the experience toward personal reflection.

7. **Community**
   - Connect with circles, collaborators, and shared themes.
   - Community features are surfaced through `ConnectionsHub` and the collective activity stream.

## Key features implemented

- Root-level TanStack routes, Node server handlers, authentication, sessions, and PostgreSQL helpers
- Muse landing experience and theme preferences ported to React
- Initial authenticated dashboard and PostgreSQL-backed room list/create/detail/update/delete APIs
- Remaining Fresh behavior is being ported incrementally; preserve `fresh/` until route, API, and service parity is verified

## Architecture overview

### Frontend

The application entry point is the root-level TanStack Start project and runs on Node.js.

- `src/routes/`, `src/server/`, and `src/components/` contain the root TanStack application
- `fresh/` contains the original Fresh pages, API handlers, islands, signals, and Deno configuration; it is a migration reference, not the active application runtime
- Port each behavior into TanStack and verify database and service wiring before removing the Fresh reference
- `ai-engine/`, `database/`, and `blockchain-security/` remain service/data boundaries; the TanStack application must be wired to them and preserve their existing behavior

### AI engine

The `ai-engine/` folder contains the NLP and synthesis engine architecture used for analysis, scraper routing, and data enrichment. It includes:

- `main.py` — entry point and API server behavior
- `synthesizer.py` — synthesis orchestration
- `pipeline.py` / pipeline logic for multi-stage document analysis
- `database.py` — local metadata storage
- `scrapers/` — content scrapers for web, social, documents, and YouTube

### Blockchain/security

The `blockchain-security/` workspace contains Rust tooling and contract projects for blockchain proof and security experimentation.

## Current system status

- TanStack is the active application runtime; migration is in progress
- Landing, authentication, dashboard, and room flows are present in the TanStack app
- Remaining workflows and integrations must be verified against `fresh/` before the reference is removed

## Tech stack

- Current application runtime: TanStack Start, React, Node.js
- UI: vanilla CSS with Tailwind-style utility classes
- AI engine: Python 3 with custom NLP and scraper modules
- Blockchain tooling: Rust + Cargo
- Data: SQL schema in `database/schema.sql`

## Getting started

### Frontend

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env` and set `DATABASE_URL` before using database-backed features. Room synthesis also requires `DATABASE_URL` and `OPENAI_API_KEY` on the AI Engine service.

Open `http://localhost:3000`.

### AI engine

```bash
cd ai-engine
python main.py
```

> If your environment uses a virtual environment, activate it before starting the Python service.

## Developer quickstart

### Muse application quickstart

```bash
npm install
npm run dev
```

The TanStack app is the active target. Its landing, authentication, dashboard, and room slices are migrated; work on the remaining product flows and API parity is ongoing. The original implementation remains in `fresh/` as a reference.

### AI engine quickstart

```bash
cd ai-engine
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python main.py
```

### Docker quickstart

```bash
docker compose up --build muse-app
```

### Database quickstart

The database schema is in `database/schema.sql` and targets PostgreSQL / CockroachDB.

```bash
psql your_database_name < database/schema.sql
```

If you need a local Postgres instance, use Docker or your preferred local setup.

## Important reference docs

- `ai-engine/NLP_ENGINE_ARCHITECTURE.md`
- `ai-engine/SCRAPERS_ARCHITECTURE.md`

## Notes

This repository is built as a connected knowledge workflow with a strong focus on reactive frontend state, adaptive personalization, and pattern-driven intelligence. The current README reflects the implemented system flow and the actual structure of the repository.
