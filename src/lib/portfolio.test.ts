import { describe, expect, it } from 'vitest';
import { getTemplate, PORTFOLIO_TEMPLATES } from './portfolio';

describe('PORTFOLIO_TEMPLATES', () => {
	it('has target percentages that sum to 100 for every template', () => {
		for (const template of PORTFOLIO_TEMPLATES) {
			const total = template.parts.reduce((sum, part) => sum + part.targetPct, 0);
			expect(total).toBe(100);
		}
	});

	it('has unique ids', () => {
		const ids = PORTFOLIO_TEMPLATES.map((template) => template.id);
		expect(new Set(ids).size).toBe(ids.length);
	});
});

describe('getTemplate', () => {
	it('returns the matching template', () => {
		expect(getTemplate('70-30')?.label).toBe('70/30');
	});

	it('returns undefined for an unknown id', () => {
		expect(getTemplate('unknown')).toBeUndefined();
	});
});
