# stblzr

A simple ETF portfolio rebalancer for savings plans. Pick a target allocation template (50/30/20 or 70/30), enter your current holdings, and get the minimal set of buy/sell actions needed to rebalance. Built as a Svelte + TypeScript PWA, aimed at mobile browsers (Safari on iOS, Chrome on Android).

See [CLAUDE.md](./CLAUDE.md) for architecture notes and [USER_STORIES.md](./USER_STORIES.md) for the requirements/backlog.

## Developing

Install dependencies with `npm install`, then start a dev server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of the app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

## Checks

```sh
npm run check   # svelte-check (types)
npm run lint    # prettier --check + eslint
npm run format  # prettier --write
npm run test    # vitest (single run)
```
