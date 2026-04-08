# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Contains **StudyFlare** — a "One-Tap Study Group" matching app for students to instantly connect with nearby study partners.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/studyflare)
- **API framework**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/studyflare run dev` — run StudyFlare frontend locally

## App Structure

### StudyFlare Frontend (artifacts/studyflare)
- `/login` — Login/signup with name + email
- `/onboarding` — Interest selection after first login
- `/home` — Main screen with "TAP TO STUDY" hero button, subject filter, group size sort
- `/matching` — Animated radar screen showing nearby study partners
- `/session/:id` — Active study session with Pomodoro timer
- `/feedback/:sessionId` — Post-session star rating and feedback
- `/groups` — Browse/create/join study groups
- `/profile` — User profile, stats, and settings
- `/future` — Upcoming features (AI Study Assistant, etc.)

### API Server (artifacts/api-server)
- `POST /api/users/login` — Login/register
- `GET /api/users/profile` — Get profile
- `PATCH /api/users/profile` — Update profile
- `POST /api/matching/broadcast` — Broadcast availability + find matches
- `GET /api/matching/nearby` — Get nearby active students
- `GET /api/sessions` — List sessions
- `POST /api/sessions` — Create session
- `GET /api/sessions/:id` — Get session
- `PATCH /api/sessions/:id` — Update session status
- `POST /api/sessions/:id/feedback` — Submit rating feedback
- `GET /api/groups` — List groups
- `POST /api/groups` — Create group
- `POST /api/groups/:id/join` — Join group
- `GET /api/stats/summary` — User stats

### Database Tables
- `users` — User profiles, stats, interests, skills
- `broadcasts` — Active study availability broadcasts
- `study_sessions` — Study session records
- `session_feedback` — Post-session ratings
- `study_groups` — Group study rooms
- `group_members` — Group membership records

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
