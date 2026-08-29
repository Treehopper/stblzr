import type { PortfolioTemplate } from './portfolio';

export interface RebalanceAction {
	partKey: string;
	partLabel: string;
	type: 'buy' | 'sell';
	amount: number;
}

function roundCurrency(value: number): number {
	return Math.round(value * 100) / 100;
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
				amount: Math.max(0, roundCurrency(targetAmount - current))
			};
		})
		.filter((action) => action.amount > 0);
}
