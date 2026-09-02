import { describe, expect, it } from 'vitest';
import { formatCurrency } from './currency';

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
