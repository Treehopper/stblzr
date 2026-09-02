import { describe, expect, it } from 'vitest';
import type { PortfolioPart } from '../portfolio';
import { partNames } from './part-names.svelte';

describe('partNames', () => {
	it('falls back to the part label when no custom name is set', () => {
		const part: PortfolioPart = { key: 'a', label: 'World', targetPct: 50 };
		expect(partNames.nameFor(part)).toBe('World');
	});

	it('returns the custom name after it is set', () => {
		const part: PortfolioPart = { key: 'b', label: 'World', targetPct: 50 };
		partNames.setName('b', 'My Growth Bucket');
		expect(partNames.nameFor(part)).toBe('My Growth Bucket');
	});

	it('falls back to the label again when the custom name is cleared', () => {
		const part: PortfolioPart = { key: 'c', label: 'Europe', targetPct: 20 };
		partNames.setName('c', 'Temp');
		partNames.setName('c', '   ');
		expect(partNames.nameFor(part)).toBe('Europe');
	});

	it('trims whitespace from custom names', () => {
		const part: PortfolioPart = { key: 'd', label: 'World', targetPct: 50 };
		partNames.setName('d', '  Padded  ');
		expect(partNames.nameFor(part)).toBe('Padded');
	});
});
