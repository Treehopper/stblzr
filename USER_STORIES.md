# User Stories

This document tracks stblzr's requirements as user stories. It is the source of truth for intended behavior and should evolve alongside the app — add stories before or alongside the code that implements them, and update status as work lands.

Status legend: `[ ]` not started · `[~]` in progress · `[x]` done

## Onboarding

- [x] **US-1**: As a first-time user, I can choose a portfolio template (50/30/20 or 70/30) so the app knows my target allocation.
- [x] **US-2**: As a user, my chosen template is saved persistently (offline-capable, survives app restarts) so I don't have to re-select it every visit.
- [x] **US-3**: As a returning user with a saved template, I skip onboarding and go straight to my portfolio view.
- [x] **US-13**: As a user, I can give each part of my split a name of my own choosing, saved persistently, so I still recognize what each allocation represents even after not checking my portfolio for a long time.
- [x] **US-14**: As a user, I can choose my currency (Euro or US Dollar) on the onboarding screen, saved persistently, with Euro as the default, so my amounts are shown in the currency I actually use.
- [x] **US-16**: As a user, I see a short description of each portfolio template on the selection screen explaining its rationale (e.g. why 50/30/20 splits allocations the way it does), so I can pick the template that matches my investing philosophy.

## Target allocation view

- [x] **US-4**: As a user, I see a pie chart of my target allocation (e.g. 50/30/20 across the three portfolio parts) so I understand what I'm aiming for.
- [x] **US-18**: As a user, the pie chart has a legend below it, with a color swatch and name for each part, and those same swatch colors appear next to the matching rows in "Current holdings" and "Rebalance", so I can tell which slice is which without guessing.
- [x] **US-22**: As a user, I see each part's percentage directly on the chart - the target ring's share via a marker line pointing at its slice, and the actual-holdings disc's share as a label inside its own slice - so I don't need to cross-reference a legend to read either number.

## Current holdings input

- [x] **US-5**: As a user, I can enter the current currency amount I hold in each ETF/stock of my portfolio.
- [x] **US-15**: As a user, all currency amounts I see are shown with the correct currency symbol and locale-appropriate separators (e.g. `1.234 €` for Euro, `$1,234` for US Dollar) based on my chosen currency, and never with cent values - including what I've typed into the holdings inputs themselves, once I move on from a field.
- [x] **US-6**: As a user, my entered holdings are saved persistently so I don't have to re-enter them every visit.
- [x] **US-7**: As a user, once I've entered my holdings, I see an overlay on the pie chart with colored indicators showing which parts of my portfolio are over-weight and which are under-weight relative to target.
- [x] **US-19**: As a user, I see the total of my current holdings and the date I last updated them, so I don't have to add up the individual rows myself.

## Rebalancing

- [x] **US-8**: As a user, I can see a "buy-only" rebalancing option: how much additional currency to put into each under-weight part, without selling anything.
- [x] **US-9**: As a user, I can see a "sell-and-rebuy minimal" rebalancing option: the smallest set of sells and buys needed to hit my target allocation exactly.
- [x] **US-10**: As a user, for each rebalancing option (buy-only or sell-and-rebuy minimal), I get a detailed list of actions to take, each with the ETF/stock and the currency amount to buy or sell.
- [x] **US-11**: As a user, I see a small warning indicator next to the "sell-and-rebuy minimal" option noting that selling may trigger taxes, so I'm not caught off guard before choosing it.
- [x] **US-12**: As a user, after confirming the rebalancing option I picked, the pie chart updates to reflect the new balanced state and shows the new per-part amounts, and these updated holdings are saved persistently so they're there next time I open the app.
- [x] **US-16**: As a user, I pick one rebalancing option at a time via side-by-side buttons and act on it with a single Apply button, rather than seeing both options with their own Apply buttons at once; within the sell-and-rebuy plan, sells are listed above buys.
- [x] **US-17**: As a user, buy and sell amounts in a rebalancing plan are always whole currency units - if the exact target math would need cents, the amount is rounded up so applying the plan never leaves me short of target.
- [x] **US-20**: As a user, I see a total row under a rebalancing plan's line items (total to invest for buy-only, total to move for buy-and-sell), so I don't have to add up the individual actions myself.

## Backlog / not yet scoped

- Editing/removing individual ETF/stock line items within a portfolio.
- Changing portfolio template after onboarding (and what happens to existing holdings data).
- Support for portfolio templates beyond 50/30/20 and 70/30 (e.g. custom allocations).
- Historical tracking of rebalancing actions over time.
