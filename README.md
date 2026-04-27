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

The platform architecture is established and currently supports:
- **UI/UX Personalization:** Theme toggling (Dark/Light), typography scaling, and dynamic accent colors.
- **Core Interfaces:** Simplified user dashboard, profile settings, and Demo Mode for user onboarding.
- **Interactions:** Notifications action bell and cleanly structured routing mirroring the product cycle.

## Working Rules

- Keep the cycle above as the source of truth.
- Prefer incremental improvements over broad rewrites.
- When adding a feature, ask where it belongs in the cycle.
- Rooms should support pinning, sorting, archiving, vaulting, and collaboration.
- Threads should help reveal patterns across rooms.
- Journal should remain the private contemplation layer.
- Community should connect people only after patterns exist.

## Development

Make sure Deno is installed, then start the app:

```bash
deno task start
```

This runs the Fresh app with file watching enabled.

## Notes

- The root app is the primary Fresh implementation.
- Muse2 is the reference frontend used for pattern and UX ideas.
- The README should be treated as the lightweight product brief for future work.
