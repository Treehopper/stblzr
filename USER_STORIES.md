# User Stories

This document tracks stblzr's requirements as user stories. It is the source of truth for intended behavior and should evolve alongside the app — add stories before or alongside the code that implements them, and update status as work lands.

Status legend: `[ ]` not started · `[~]` in progress · `[x]` done

## Onboarding

- [ ] **US-1**: As a first-time user, I can choose a portfolio template (50/30/20 or 70/30) so the app knows my target allocation.
- [ ] **US-2**: As a user, my chosen template is saved persistently (offline-capable, survives app restarts) so I don't have to re-select it every visit.
- [ ] **US-3**: As a returning user with a saved template, I skip onboarding and go straight to my portfolio view.

## Target allocation view

- [ ] **US-4**: As a user, I see a pie chart of my target allocation (e.g. 50/30/20 across the three portfolio parts) so I understand what I'm aiming for.

## Current holdings input

- [ ] **US-5**: As a user, I can enter the current currency amount I hold in each ETF/stock of my portfolio.
- [ ] **US-6**: As a user, my entered holdings are saved persistently so I don't have to re-enter them every visit.
- [ ] **US-7**: As a user, once I've entered my holdings, I see an overlay on the pie chart with colored indicators showing which parts of my portfolio are over-weight and which are under-weight relative to target.

## Rebalancing

- [ ] **US-8**: As a user, I can see a "buy-only" rebalancing option: how much additional currency to put into each under-weight part, without selling anything.
- [ ] **US-9**: As a user, I can see a "sell-and-rebuy minimal" rebalancing option: the smallest set of sells and buys needed to hit my target allocation exactly.

## Backlog / not yet scoped

- Editing/removing individual ETF/stock line items within a portfolio.
- Changing portfolio template after onboarding (and what happens to existing holdings data).
- Support for portfolio templates beyond 50/30/20 and 70/30 (e.g. custom allocations).
- Historical tracking of rebalancing actions over time.
