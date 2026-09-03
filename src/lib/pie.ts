export interface AnnularSlice {
	key: string;
	path: string;
	midAngleDeg: number;
}

export interface AnnularOptions {
	cx?: number;
	cy?: number;
	innerRadius: number;
	outerRadius: number;
}

export function pointOnCircle(cx: number, cy: number, radius: number, angleDeg: number) {
	const angleRad = ((angleDeg - 90) * Math.PI) / 180;
	return { x: cx + radius * Math.cos(angleRad), y: cy + radius * Math.sin(angleRad) };
}

// Each circle is drawn as two half-circle arcs, since a single SVG arc command
// can't have coincident start/end points. The inner circle winds the opposite
// way so the default nonzero fill rule punches it out as a hole.
function fullCirclePath(cx: number, cy: number, innerRadius: number, outerRadius: number) {
	const outer = [
		`M ${cx - outerRadius} ${cy}`,
		`A ${outerRadius} ${outerRadius} 0 1 1 ${cx + outerRadius} ${cy}`,
		`A ${outerRadius} ${outerRadius} 0 1 1 ${cx - outerRadius} ${cy}`,
		'Z'
	].join(' ');

	if (innerRadius <= 0) return outer;

	const inner = [
		`M ${cx - innerRadius} ${cy}`,
		`A ${innerRadius} ${innerRadius} 0 1 0 ${cx + innerRadius} ${cy}`,
		`A ${innerRadius} ${innerRadius} 0 1 0 ${cx - innerRadius} ${cy}`,
		'Z'
	].join(' ');

	return `${outer} ${inner}`;
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

		let path: string;
		if (sweep >= 359.999) {
			// A single arc can't span a full 360° circle - its start and end points
			// coincide, which produces a degenerate (invisible) path. Draw the full
			// circle (or annulus) as two half-circle arcs instead.
			path = fullCirclePath(cx, cy, innerRadius, outerRadius);
		} else {
			const outerStart = pointOnCircle(cx, cy, outerRadius, start);
			const outerEnd = pointOnCircle(cx, cy, outerRadius, end);

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
		}

		slices.push({ key: part.key, path, midAngleDeg: (start + end) / 2 });
		angle = end;
	}

	return slices;
}
