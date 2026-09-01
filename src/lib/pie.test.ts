import { describe, expect, it } from 'vitest';
import { computeAnnularSlices } from './pie';

describe('computeAnnularSlices', () => {
	it('returns one slice per part, in order', () => {
		const slices = computeAnnularSlices(
			[
				{ key: 'a', pct: 50 },
				{ key: 'b', pct: 30 },
				{ key: 'c', pct: 20 }
			],
			{ innerRadius: 0, outerRadius: 48 }
		);

		expect(slices.map((s) => s.key)).toEqual(['a', 'b', 'c']);
	});

	it('produces a solid wedge starting at the center when innerRadius is 0', () => {
		const [slice] = computeAnnularSlices([{ key: 'a', pct: 70 }], {
			cx: 56,
			cy: 56,
			innerRadius: 0,
			outerRadius: 48
		});

		expect(slice.path.startsWith('M 56 56')).toBe(true);
		expect(slice.path.trim().endsWith('Z')).toBe(true);
	});

	it('produces a ring segment that does not touch the center when innerRadius > 0', () => {
		const [slice] = computeAnnularSlices([{ key: 'a', pct: 70 }], {
			cx: 56,
			cy: 56,
			innerRadius: 40,
			outerRadius: 48
		});

		expect(slice.path).not.toContain('56 56');
		expect(slice.path.trim().endsWith('Z')).toBe(true);
	});

	it('draws a full disc, not a degenerate path, when a part is 100%', () => {
		const [slice] = computeAnnularSlices([{ key: 'a', pct: 100 }], {
			cx: 56,
			cy: 56,
			innerRadius: 0,
			outerRadius: 48
		});

		expect(slice.path.startsWith('M 8 56')).toBe(true);
		expect(slice.path.match(/A /g)).toHaveLength(2);
	});

	it('draws a full ring, not a degenerate path, when a part is 100%', () => {
		const [slice] = computeAnnularSlices([{ key: 'a', pct: 100 }], {
			cx: 56,
			cy: 56,
			innerRadius: 40,
			outerRadius: 48
		});

		expect(slice.path.match(/A /g)).toHaveLength(4);
	});
});
