# Muse

Muse is a Fresh app for turning what people consume into something they can understand, organize, reflect on, and create from.

## Product Cycle

The app follows a single cycle:

1. Consume
2. Collect
3. Contemplate
4. Create
5. Community

This is the product rule. Features should support this loop, not bypass it.

## How The App Maps To The Cycle

- Home is the overview of the system and the user’s current state.
- Rooms are where consumed content gets collected and organized.
- Threads synthesize rooms into patterns.
- Journal is the contemplation layer.
- Create is where the user turns reflection into output.
- Community/Connections is for pattern-based connection with like-minded people.

## Current Navigation Order

The navigation is being shaped around the workflow, not just page names:

- Home
- Create
- Rooms
- Threads
- Journal
- Community/Connections
- Quick Actions
- Settings

## Current Features & Status

Muse has evolved into a fully scalable Web3-enabled Knowledge Platform. The monorepo architecture currently supports:
- **`frontend-gateway/` (Deno Fresh):** The core UI offering theme toggling (Dark/Light), typography scaling, dynamic accent colors, and a Solana Web3 Wallet connector (`Phantom`).
- **`ai-engine/` (Python/FastAPI):** Prepared for real-time LangChain analysis, semantic search, and personalized journal insights.
- **`blockchain-security/` (Rust/Anchor):** Handles AES-256-GCM data encryption, Arweave decentralized storage integration, and native Solana Smart Contracts for Immutable Logging (Proof of Thought), $MUSE token rewards, Soulbound Reputation Tokens, and Token-Gated Rooms.

## Working Rules

- Keep the cycle above as the source of truth.
- Prefer incremental improvements over broad rewrites.
- When adding a feature, ask where it belongs in the cycle.
- Rooms should support pinning, sorting, archiving, vaulting, and collaboration.
- Threads should help reveal patterns across rooms.
- Journal should remain the private contemplation layer.
- Community should connect people only after patterns exist.

## Development (Monorepo)

Muse is built as a microservices architecture orchestrated via Docker.

### Running the Full Stack
To run the Deno Frontend, Python AI Engine, and Rust Blockchain Security API simultaneously, run the following from the root directory:
```bash
docker compose up --build
```

### Running just the Frontend UI
If you only need to work on UI styling or React components:
```bash
cd frontend-gateway
deno task start
```
This runs the Fresh app on port 8000 with file watching enabled.

## Notes

- The root app is the primary Fresh implementation.
- Muse2 is the reference frontend used for pattern and UX ideas.
- The README should be treated as the lightweight product brief for future work.
