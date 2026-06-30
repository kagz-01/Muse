Migration notes

- 2026-06-30: Added `follows` and `circle_members` tables to support server-side follow and circle membership persistence.
- Run migration using your preferred SQL tool against the project's Postgres/CockroachDB instance, for example:

psql $DATABASE_URL -f database/migrations/2026_06_30_add_follows_and_circle_members.sql

- `circle_members.circle_id` is not constrained by FK intentionally to avoid ordering issues if `circles` table is created in a later migration. If you prefer, add a FK constraint referencing `circles(id)` after ensuring `circles` exists.
