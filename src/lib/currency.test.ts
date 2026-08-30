import { describe, expect, it } from 'vitest';
import { formatCurrency } from './currency';

describe('formatCurrency', () => {
	it('formats EUR with a period thousands separator and comma decimal', () => {
		const result = formatCurrency(1234.5, 'EUR');
		expect(result).toContain('€');
		expect(result).toContain('1.234,50');
	});

	it('formats USD with a comma thousands separator and period decimal', () => {
		expect(formatCurrency(1234.5, 'USD')).toBe('$1,234.50');
	});
});
