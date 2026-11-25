Migration notes

- For the root TanStack/Node application, apply the core schema and all ordered SQL migrations with `npm run db:migrate`. This loads `DATABASE_URL` from the process environment or the repository-root `.env` file.
- 2026-11-25: Added `app_sessions` for Node/TanStack-backed application sessions, replacing the Fresh/Deno KV session store. Apply it against an existing database with:

psql $DATABASE_URL -v ON_ERROR_STOP=1 -f database/migrations/2026_11_25_add_app_sessions.sql

- 2026-11-25: Added idempotent password reset token fields for existing databases with `database/migrations/2026_11_25_add_password_reset_fields.sql`.
- 2026-11-25: Added room metadata fields used by the Fresh room UI/API to existing databases with `database/migrations/2026_11_25_add_room_fields.sql`.

- 2026-06-30: Added `follows` and `circle_members` tables to support server-side follow and circle membership persistence.
- Run migration using your preferred SQL tool against the project's Postgres/CockroachDB instance, for example:

psql $DATABASE_URL -f database/migrations/2026_06_30_add_follows_and_circle_members.sql

- `circle_members.circle_id` is not constrained by FK intentionally to avoid ordering issues if `circles` table is created in a later migration. If you prefer, add a FK constraint referencing `circles(id)` after ensuring `circles` exists.
