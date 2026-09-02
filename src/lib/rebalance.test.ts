import { describe, expect, it } from 'vitest';
import { buyOnlyActions, sellAndRebuyMinimalActions } from './rebalance';
import type { PortfolioTemplate } from './portfolio';

const template: PortfolioTemplate = {
	id: '70-30',
	label: '70/30',
	description:
		'A simpler split favoring World over Emerging Markets, without a separate Europe allocation.',
	parts: [
		{ key: 'world', label: 'World', targetPct: 70 },
		{ key: 'emerging-markets', label: 'Emerging Markets', targetPct: 30 }
	]
};

describe('buyOnlyActions', () => {
	it("buys the underweight part up to the overweight part's implied total", () => {
		const actions = buyOnlyActions(template, { world: 700, 'emerging-markets': 100 });

		expect(actions).toEqual([
			{ partKey: 'emerging-markets', partLabel: 'Emerging Markets', type: 'buy', amount: 200 }
		]);
	});

	it('returns no actions for an already-balanced portfolio', () => {
		const actions = buyOnlyActions(template, { world: 700, 'emerging-markets': 300 });

		expect(actions).toEqual([]);
	});

	it('returns no actions when nothing has been entered yet', () => {
		const actions = buyOnlyActions(template, {});

		expect(actions).toEqual([]);
	});

	it('treats a missing part as zero holdings', () => {
		const actions = buyOnlyActions(template, { world: 700 });

		expect(actions).toEqual([
			{ partKey: 'emerging-markets', partLabel: 'Emerging Markets', type: 'buy', amount: 300 }
		]);
	});
});

describe('sellAndRebuyMinimalActions', () => {
	it('sells exactly the over-weight excess and buys exactly the under-weight shortfall', () => {
		const actions = sellAndRebuyMinimalActions(template, { world: 800, 'emerging-markets': 200 });

		expect(actions).toEqual([
			{ partKey: 'world', partLabel: 'World', type: 'sell', amount: 100 },
			{ partKey: 'emerging-markets', partLabel: 'Emerging Markets', type: 'buy', amount: 100 }
		]);
	});

	it('keeps the portfolio total unchanged, unlike buy-only', () => {
		const holdings = { world: 800, 'emerging-markets': 200 };
		const actions = sellAndRebuyMinimalActions(template, holdings);

		const net = actions.reduce(
			(sum, action) => sum + (action.type === 'buy' ? action.amount : -action.amount),
			0
		);
		expect(net).toBe(0);
	});

	it('returns no actions for an already-balanced portfolio', () => {
		const actions = sellAndRebuyMinimalActions(template, { world: 700, 'emerging-markets': 300 });

		expect(actions).toEqual([]);
	});

	it('returns no actions when nothing has been entered yet', () => {
		const actions = sellAndRebuyMinimalActions(template, {});

		expect(actions).toEqual([]);
	});

	it('treats a missing part as zero holdings', () => {
		const actions = sellAndRebuyMinimalActions(template, { world: 700 });

		expect(actions).toEqual([
			{ partKey: 'world', partLabel: 'World', type: 'sell', amount: 210 },
			{ partKey: 'emerging-markets', partLabel: 'Emerging Markets', type: 'buy', amount: 210 }
		]);
	});
});
