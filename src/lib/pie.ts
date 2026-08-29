export interface AnnularSlice {
	key: string;
	path: string;
}

export interface AnnularOptions {
	cx?: number;
	cy?: number;
	innerRadius: number;
	outerRadius: number;
}

function pointOnCircle(cx: number, cy: number, radius: number, angleDeg: number) {
	const angleRad = ((angleDeg - 90) * Math.PI) / 180;
	return { x: cx + radius * Math.cos(angleRad), y: cy + radius * Math.sin(angleRad) };
}

/**
 * Computes SVG path data for a set of parts as slices of an annulus (or, when
 * innerRadius is 0, a solid pie). Used to draw both the target-allocation pie
 * and the actual-holdings ring at different radii on the same chart.
 */
export function computeAnnularSlices(
	parts: { key: string; pct: number }[],
	options: AnnularOptions
): AnnularSlice[] {
	const { cx = 50, cy = 50, innerRadius, outerRadius } = options;

	let angle = 0;
	const slices: AnnularSlice[] = [];

	for (const part of parts) {
		const sweep = (part.pct / 100) * 360;
		const start = angle;
		const end = angle + sweep;
		const largeArc = sweep > 180 ? 1 : 0;

		const outerStart = pointOnCircle(cx, cy, outerRadius, start);
		const outerEnd = pointOnCircle(cx, cy, outerRadius, end);

		let path: string;
		if (innerRadius <= 0) {
			path = `M ${cx} ${cy} L ${outerStart.x} ${outerStart.y} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y} Z`;
		} else {
			const innerEnd = pointOnCircle(cx, cy, innerRadius, end);
			const innerStart = pointOnCircle(cx, cy, innerRadius, start);
			path = [
				`M ${outerStart.x} ${outerStart.y}`,
				`A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
				`L ${innerEnd.x} ${innerEnd.y}`,
				`A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
				'Z'
			].join(' ');
		}

		slices.push({ key: part.key, path });
		angle = end;
	}

	return slices;
}
