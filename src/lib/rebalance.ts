import type { PortfolioTemplate } from './portfolio';

export interface RebalanceAction {
	partKey: string;
	partLabel: string;
	type: 'buy' | 'sell';
	amount: number;
}

// Below this drift, the portfolio is "close enough" - showing a plan for a fraction of
// a percent of drift generates noise trades rather than a real rebalance.
export const REBALANCE_TOLERANCE_PCT = 5;

/**
 * Largest gap, in percentage points, between any part's actual share of the portfolio
 * and its target share. Used to decide whether the portfolio is close enough to target
 * that no action needs to be shown at all, even if the exact-match math would produce
 * (tiny) trades. Returns 0 when nothing has been entered yet.
 */
export function maxDeviationPct(
	template: PortfolioTemplate,
	holdings: Record<string, number>
): number {
	const total = template.parts.reduce((sum, part) => sum + (holdings[part.key] ?? 0), 0);
	if (total <= 0) return 0;

	return Math.max(
		...template.parts.map((part) => {
			const currentPct = ((holdings[part.key] ?? 0) / total) * 100;
			return Math.abs(currentPct - part.targetPct);
		})
	);
}

// Amounts are never shown with cents, so any calculated buy/sell amount is
// rounded up to the next whole currency unit - rounding down would leave the
// portfolio slightly off target after applying the plan. `value` is first
// rounded to cent precision to absorb floating-point noise (e.g. 199.99999999997)
// before the ceiling is applied, so noise never pushes a whole number up by one.
function roundUpToWholeCurrency(value: number): number {
	return Math.ceil(Math.round(value * 100) / 100);
}

/**
 * Buy-only rebalancing: find the smallest total portfolio value reachable purely
 * by adding money (never selling) such that every part is at or under its target
 * share of that total. That total is `max(current_i / targetFraction_i)` - the
 * currently most overweight part needs no purchase, and pins the total.
 */
export function buyOnlyActions(
	template: PortfolioTemplate,
	holdings: Record<string, number>
): RebalanceAction[] {
	const target = Math.max(
		0,
		...template.parts.map((part) => {
			const current = holdings[part.key] ?? 0;
			return current / (part.targetPct / 100);
		})
	);

	return template.parts
		.map((part) => {
			const current = holdings[part.key] ?? 0;
			const targetAmount = (part.targetPct / 100) * target;
			return {
				partKey: part.key,
				partLabel: part.label,
				type: 'buy' as const,
				amount: Math.max(0, roundUpToWholeCurrency(targetAmount - current))
			};
		})
		.filter((action) => action.amount > 0);
}

/**
 * Sell-and-rebuy minimal rebalancing: hit the target allocation exactly, without
 * adding any new money, by moving value from over-weight parts into under-weight
 * ones. The portfolio total stays fixed at the current sum of holdings, so each
 * part's target amount is `total * targetPct`. Selling exactly the over-weight
 * excess (and buying exactly the under-weight shortfall) is the smallest possible
 * set of trades that reaches target - any smaller sell would leave some part off
 * target.
 */
export function sellAndRebuyMinimalActions(
	template: PortfolioTemplate,
	holdings: Record<string, number>
): RebalanceAction[] {
	const total = template.parts.reduce((sum, part) => sum + (holdings[part.key] ?? 0), 0);

	return template.parts
		.map((part) => {
			const current = holdings[part.key] ?? 0;
			const targetAmount = (part.targetPct / 100) * total;
			const diff = targetAmount - current;
			return {
				partKey: part.key,
				partLabel: part.label,
				type: diff >= 0 ? ('buy' as const) : ('sell' as const),
				amount: roundUpToWholeCurrency(Math.abs(diff))
			};
		})
		.filter((action) => action.amount > 0);
}
