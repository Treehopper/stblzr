import { describe, expect, it } from 'vitest';
import { formatAmount, formatCurrency, formatDate, parseAmountInput } from './currency';

describe('formatCurrency', () => {
	it('formats EUR with a period thousands separator and no cents', () => {
		const result = formatCurrency(1234, 'EUR');
		expect(result).toContain('€');
		expect(result).toContain('1.234');
		expect(result).not.toContain(',');
	});

	it('formats USD with a comma thousands separator and no cents', () => {
		expect(formatCurrency(1234, 'USD')).toBe('$1,234');
	});

	it('never shows cent values, even for fractional input', () => {
		expect(formatCurrency(1234.5, 'USD')).not.toContain('.5');
		expect(formatCurrency(1234.5, 'USD')).not.toMatch(/\.\d/);
	});
});

describe('formatAmount', () => {
	it('uses the same grouping as formatCurrency, without the currency symbol', () => {
		expect(formatAmount(400511, 'EUR')).toBe('400.511');
		expect(formatAmount(400511, 'USD')).toBe('400,511');
	});
});

describe('formatDate', () => {
	const timestamp = Date.UTC(2026, 2, 15, 12);

	it('formats using the currency locale, short month, and full year', () => {
		expect(formatDate(timestamp, 'USD')).toBe('Mar 15, 2026');
	});

	it('uses a different format per locale', () => {
		expect(formatDate(timestamp, 'EUR')).toContain('2026');
		expect(formatDate(timestamp, 'EUR')).not.toBe(formatDate(timestamp, 'USD'));
	});
});

describe('parseAmountInput', () => {
	it('parses plain digit strings', () => {
		expect(parseAmountInput('400511')).toBe(400511);
	});

	it('discards grouping separators regardless of locale', () => {
		expect(parseAmountInput('400.511')).toBe(400511);
		expect(parseAmountInput('400,511')).toBe(400511);
	});

	it('returns 0 for empty or non-numeric input', () => {
		expect(parseAmountInput('')).toBe(0);
		expect(parseAmountInput('abc')).toBe(0);
	});
});
