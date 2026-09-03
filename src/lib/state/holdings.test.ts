import { describe, expect, it } from 'vitest';
import { portfolioHoldings } from './holdings.svelte';

describe('portfolioHoldings', () => {
	it('defaults unset parts to 0', () => {
		expect(portfolioHoldings.amountFor('unset-part')).toBe(0);
	});

	it('reflects a set amount via both amountFor and all', () => {
		portfolioHoldings.setAmount('a', 1000);
		expect(portfolioHoldings.amountFor('a')).toBe(1000);
		expect(portfolioHoldings.all.a).toBe(1000);
	});

	it('keeps other parts untouched when setting one amount', () => {
		portfolioHoldings.setAmount('a', 1000);
		portfolioHoldings.setAmount('b', 2000);
		expect(portfolioHoldings.amountFor('a')).toBe(1000);
		expect(portfolioHoldings.amountFor('b')).toBe(2000);
	});

	it('records the time of the most recent setAmount call', () => {
		const before = Date.now();
		portfolioHoldings.setAmount('a', 1000);
		const after = Date.now();
		expect(portfolioHoldings.lastUpdatedAt).not.toBeNull();
		expect(portfolioHoldings.lastUpdatedAt as number).toBeGreaterThanOrEqual(before);
		expect(portfolioHoldings.lastUpdatedAt as number).toBeLessThanOrEqual(after);
	});
});
