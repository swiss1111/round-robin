# Gabi–Dávid ping-pong bajnokság

Round-robin ping-pong bajnokság kísérleti React alkalmazás: játékosnevek megadása, determinisztikus meccssorsolás, meccsenkénti győztes rögzítés, élő ranglista, dobogós eredményhirdetés. Az állapot **localStorage**-ban van (`gabi-david-rr-v2` kulcs).

## Előfeltételek

- [Node.js](https://nodejs.org/) (LTS ajánlott)

## Parancsok

```bash
npm install
npm run dev
```

Fejlesztői szerver alapértelmezés szerint `http://localhost:5173`.

```bash
npm run build
```

TypeScript ellenőrzés + production bundle a `dist/` mappába.

```bash
npm run test
```

Egyszeri Vitest futás (domain + storage unit tesztek).

```bash
npm run test:watch
```

Vitest figyelő mód.

```bash
npm run test:e2e
```

Playwright E2E tesztek (dev server automatikus indítással).

## Dokumentáció

- [Követelmények és viselkedés](docs/REQUIREMENTS.md)
- [Architektúra és adatfolyam](docs/ARCHITECTURE.md)
- [Útmutató AI / fejlesztői ügynököknek](AGENTS.md)

## Útvonalak

| Útvonal     | Tartalom          |
| ----------- | ----------------- |
| `/`         | Névbekérő (setup) |
| `/jatek`    | Mérkőzés nézet    |
| `/eredmeny` | Dobogó / eredmény |

## Tech stack

Vite, React 19, TypeScript, React Router, Framer Motion, Vitest, Testing Library.
