# Agents instructions

This repository is a small React (Vite + TypeScript) app for a **deterministic single round-robin** ping-pong style tournament. Read [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md) and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) before changing behavior.

## Rules

1. **Domain logic stays in `src/domain/`** — no React hooks or `localStorage` there. Schedule changes belong in `roundRobin.ts`; ranking in `standings.ts`.
2. **No random match ordering** unless product requirements explicitly change. Schedules are derived from the **player list order** from setup.
3. **Persistence** lives in `src/storage/tournamentStorage.ts`. If you change the JSON shape, bump `STATE_VERSION` / storage key strategy and document migration in `docs/ARCHITECTURE.md`.
4. **UI copy is Hungarian** for user-facing strings, per requirements (header title, buttons, labels).
5. When changing round-robin or standings rules, **update `docs/`** and **add or adjust Vitest tests** in `src/domain/` (and storage tests if persistence changes).
6. Prefer **small, focused diffs**. Do not refactor unrelated modules or add heavy dependencies without a clear need.
7. Run **`npm run test`** and **`npm run build`** before considering work complete.

## Commands

- `npm run dev` — dev server
- `npm run test` / `npm run test:watch` — Vitest
- `npm run build` — `tsc` + production bundle

## File map (high level)

- `src/context/TournamentContext.tsx` — app state + save to `localStorage` + navigation side effects for Start / Finish / Reset
- `src/components/*` — pages and layout
- `src/domain/*` — pure logic + `*.test.ts`
- `src/storage/*` — `loadTournamentState` / `saveTournamentState` + tests

If something is ambiguous, align with **REQUIREMENTS.md** and ask the user before inventing new product rules.
