# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```sh
npm run dev          # start dev server
npm run build        # production build (static adapter, output to build/)
npm run preview      # preview the production build
npm run check        # svelte-kit sync + svelte-check (type checking)
npm run check:watch  # same, in watch mode
npm run lint         # prettier --check . && eslint .
npm run format       # prettier --write .
npm run test         # vitest --run (single run)
npm run test:unit    # vitest (watch mode)
npm run test:coverage # vitest --run --coverage
```

Single test file: `npx vitest run path/to/file.test.ts` (or `path/to/Component.svelte.test.ts` for component tests). Filter by name: `npx vitest run -t "test name"`.

## Stack and project setup

- **SvelteKit + TypeScript**, scaffolded via `sv create` (Svelte 5, runes mode forced project-wide — see `runes` option in `vite.config.ts`).
- No `svelte.config.js`: the SvelteKit plugin (including the adapter) is configured directly inside `vite.config.ts`.
- **`@sveltejs/adapter-static`** with `fallback: 'index.html'`, and `export const ssr = false` in `src/routes/+layout.ts` — the app is a pure client-side SPA (no server, no SSR). All state lives in the browser.
- **`@vite-pwa/sveltekit`** (wraps `vite-plugin-pwa`) provides the PWA manifest and service worker (`registerType: 'autoUpdate'`), configured in `vite.config.ts`. Manifest fields (name, theme colors, icons) live there, not in a separate `manifest.json`.
- `eslint` + `prettier` (with `prettier-plugin-svelte`) for linting/formatting; `vitest` for unit/component tests, split into browser vs. node test projects in `vite.config.ts`.
- No CSS framework and no state-management library are set up — keep additions minimal per the "simplicity" goal below.

## What stblzr is

stblzr is a simple ETF portfolio rebalancer for savings plans. A user maintains a small set of ETF/stock positions following a target allocation template (e.g. 50/30/20), enters their current holdings, and the app tells them the minimal set of buy/sell actions needed to bring the portfolio back to target.

Primary use case: mobile browsers — Safari on iOS and Chrome on Android. Favor simplicity and small bundle size over feature breadth; this informed the plain-SPA/no-framework setup above.

## Core product flow

1. **Onboarding**: user picks a portfolio template. Only two are supported for now:
   - 50/30/20
   - 70/30

   The chosen template is saved persistently (this is the only onboarding step).

2. **Target view**: a pie chart shows the target allocation for the selected template.
3. **Current holdings input**: the user enters the current currency amount held in each ETF/stock of the portfolio. The pie chart gets an overlay of colored indicators showing which slices are over- and under-weight relative to target.
4. **Rebalancing output**: the app presents two rebalancing options:
   - **Buy-only**: purchase additional shares (no sells) to move toward target.
   - **Sell-and-rebuy minimal**: sell and rebuy the smallest amount necessary to hit target allocation exactly.

## Requirements tracking

Requirements are documented and evolved as a list of user stories in [USER_STORIES.md](./USER_STORIES.md) rather than as a static spec. When adding features, check that file for the relevant story (add one if missing) and keep its status markers in sync with what's actually implemented.
