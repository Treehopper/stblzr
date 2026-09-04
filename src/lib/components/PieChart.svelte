<script lang="ts">
	import { computeAnnularSlices, pointOnCircle } from '$lib/pie';
	import type { PortfolioPart } from '$lib/portfolio';
	import { themeSelection } from '$lib/state/theme.svelte';
	import { viewportSize } from '$lib/state/viewport.svelte';
	import { getTheme } from '$lib/themes';

	let {
		parts,
		holdings = {}
	}: {
		parts: PortfolioPart[];
		holdings?: Record<string, number>;
	} = $props();

	const partColors = $derived(getTheme(themeSelection.id).partColors);

	// The viewBox is wider than the ring itself so the target-percentage labels have
	// room to sit outside it without being clipped. Target percentages only ever take
	// one of four values (20/30/50/70, the two templates' parts) so there's one exact
	// worst case, not a hypothetical one: the 50/30/20 template's 50% slice always
	// lands its midpoint exactly on the 3 o'clock line, where its label is anchored
	// purely to one side rather than centered. Sized to that exact measured width (via
	// SVG getBBox), not a rounder guess - anything beyond it is wasted margin.
	//
	// Vertically, the worst case isn't a current template's label but a hypothetical
	// one landing exactly on the 12/6 o'clock line: text-anchor is 'middle' there (see
	// sliceLabels below), so the label's width no longer matters and its height does -
	// centered on its point via dominant-baseline="middle", which (measured, not
	// assumed symmetric - font metrics put more of a digit's height above the baseline
	// than below) reaches 6.52 units above and 4.19 below. Sized to fit that exactly,
	// same as the horizontal case, so a future template with a part landing there still
	// wouldn't clip - not because either current template's labels need this room.
	const VIEWBOX_WIDTH = 161;
	const VIEWBOX_HEIGHT = 129;
	const CENTER_X = 80.5;
	const CENTER_Y = 65.7;
	const ACTUAL_RADIUS = 40;
	const TARGET_INNER_RADIUS = 42;
	const TARGET_OUTER_RADIUS = 52;
	const LABEL_LINE_RADIUS = TARGET_OUTER_RADIUS + 4;
	const LABEL_TEXT_RADIUS = TARGET_OUTER_RADIUS + 7;
	// The actual disc's own labels sit inside its slices (rather than pointing
	// outward like the target ring's) so they don't collide with the target labels.
	const ACTUAL_LABEL_RADIUS = ACTUAL_RADIUS * 0.6;

	const targetSlices = $derived(
		computeAnnularSlices(
			parts.map((part) => ({ key: part.key, pct: part.targetPct })),
			{
				cx: CENTER_X,
				cy: CENTER_Y,
				innerRadius: TARGET_INNER_RADIUS,
				outerRadius: TARGET_OUTER_RADIUS
			}
		)
	);

	// A short marker line plus label pointing at each target slice, so its percentage
	// can be read directly off the chart.
	const sliceLabels = $derived(
		targetSlices.map((slice, i) => {
			const lineStart = pointOnCircle(CENTER_X, CENTER_Y, TARGET_OUTER_RADIUS, slice.midAngleDeg);
			const lineEnd = pointOnCircle(CENTER_X, CENTER_Y, LABEL_LINE_RADIUS, slice.midAngleDeg);
			const textPoint = pointOnCircle(CENTER_X, CENTER_Y, LABEL_TEXT_RADIUS, slice.midAngleDeg);
			const anchor =
				textPoint.x > CENTER_X + 1 ? 'start' : textPoint.x < CENTER_X - 1 ? 'end' : 'middle';
			return { key: slice.key, lineStart, lineEnd, textPoint, anchor, pct: parts[i].targetPct };
		})
	);

	const total = $derived(parts.reduce((sum, part) => sum + (holdings[part.key] ?? 0), 0));

	const actualParts = $derived(
		parts.map((part) => ({
			key: part.key,
			pct: total > 0 ? ((holdings[part.key] ?? 0) / total) * 100 : 0
		}))
	);

	// The actual-holdings disc only reflects what's been entered - hidden until there's
	// at least some money in the portfolio, since 0/0 has no meaningful proportions.
	const actualSlices = $derived(
		total > 0
			? computeAnnularSlices(actualParts, {
					cx: CENTER_X,
					cy: CENTER_Y,
					innerRadius: 0,
					outerRadius: ACTUAL_RADIUS
				})
			: []
	);

	// Measured (via SVG getBBox against the real, styled element - a synthetic one
	// doesn't pick up Svelte's scoped CSS class, so it silently renders at the
	// browser's default font size instead of this 7px one) rendered size of a label at
	// this font: ~4.8 SVG units per character (plus a little padding) wide, and a
	// constant ~8 tall regardless of the digits in it.
	function labelSize(pct: number) {
		const text = `${pct.toFixed(1)}%`;
		return { width: text.length * 4.8 + 1, height: 8 };
	}

	function labelBox(pct: number, point: { x: number; y: number }) {
		const { width, height } = labelSize(pct);
		return {
			left: point.x - width / 2,
			right: point.x + width / 2,
			top: point.y - height / 2,
			bottom: point.y + height / 2
		};
	}

	function boxesOverlap(
		a: { left: number; right: number; top: number; bottom: number },
		b: { left: number; right: number; top: number; bottom: number }
	) {
		return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
	}

	// Labels for the actual-holdings slices sit directly inside each slice instead of
	// pointing outward, since the target ring already occupies the space around the
	// outside of the chart. A label is only hidden when it would actually collide with
	// a *neighboring* slice's label (checked pairwise around the ring, not each
	// label's own slice width) - a single small slice between two large ones has
	// nothing to collide with and keeps its label; two small slices next to each other
	// don't.
	const actualSliceLabels = $derived.by(() => {
		const candidates = actualSlices.map((slice, i) => {
			const textPoint = pointOnCircle(CENTER_X, CENTER_Y, ACTUAL_LABEL_RADIUS, slice.midAngleDeg);
			const pct = actualParts[i]?.pct ?? 0;
			return { key: slice.key, textPoint, pct, box: labelBox(pct, textPoint) };
		});

		const hidden: Record<string, true> = {};
		for (let i = 0; i < candidates.length; i++) {
			const a = candidates[i];
			const b = candidates[(i + 1) % candidates.length];
			if (a.key === b.key || hidden[a.key] || hidden[b.key]) continue;
			if (boxesOverlap(a.box, b.box)) {
				hidden[a.pct <= b.pct ? a.key : b.key] = true;
			}
		}

		return candidates.filter((label) => !hidden[label.key]);
	});

	// Vertical space gets tight when the on-screen keyboard opens on a phone. Drop to
	// horizontal bars once there's too little height for the pie chart. Driven by the
	// live visual-viewport height (not a `@media (max-height)` query) since Safari never
	// shrinks the CSS viewport for the keyboard.
	const barsOnly = $derived(viewportSize.height <= 480);
</script>

<div class="chart" style:display={barsOnly ? 'none' : undefined}>
	<svg
		viewBox="0 0 {VIEWBOX_WIDTH} {VIEWBOX_HEIGHT}"
		class="pie"
		role="img"
		aria-label="Portfolio allocation"
	>
		<circle class="track" cx={CENTER_X} cy={CENTER_Y} r={TARGET_OUTER_RADIUS} />
		{#each targetSlices as slice, i (slice.key)}
			<path d={slice.path} fill={partColors[i % partColors.length]} />
		{/each}
		{#each actualSlices as slice, i (slice.key)}
			<path
				d={slice.path}
				fill={partColors[i % partColors.length]}
				stroke="var(--bg)"
				stroke-width="1"
			/>
		{/each}
		{#each sliceLabels as label (label.key)}
			<line
				x1={label.lineStart.x}
				y1={label.lineStart.y}
				x2={label.lineEnd.x}
				y2={label.lineEnd.y}
				class="label-line"
			/>
			<text
				x={label.textPoint.x}
				y={label.textPoint.y}
				text-anchor={label.anchor}
				dominant-baseline="middle"
				class="label-text">{label.pct}%</text
			>
		{/each}
		{#each actualSliceLabels as label (label.key)}
			<text
				x={label.textPoint.x}
				y={label.textPoint.y}
				text-anchor="middle"
				dominant-baseline="middle"
				class="label-text actual-label-text">{label.pct.toFixed(1)}%</text
			>
		{/each}
	</svg>
	{#if total <= 0}
		<p class="empty-hint">Enter your holdings below</p>
	{/if}
</div>

<div
	class="bars"
	style:display={barsOnly ? 'flex' : undefined}
	role="img"
	aria-label="Portfolio allocation"
>
	<span class="bar target-bar" role="presentation">
		{#each parts as part, i (part.key)}
			<span
				class="segment"
				style:width="{part.targetPct}%"
				style:background={partColors[i % partColors.length]}
			></span>
		{/each}
	</span>
	{#if total > 0}
		<span class="bar actual-bar" role="presentation">
			{#each actualParts as part, i (part.key)}
				<span
					class="segment"
					style:width="{part.pct}%"
					style:background={partColors[i % partColors.length]}
				></span>
			{/each}
		</span>
	{:else}
		<p class="bar-empty">Enter your holdings below</p>
	{/if}
</div>

<style>
	.chart {
		position: relative;
		width: 100%;
		aspect-ratio: 161 / 129;
		margin: 0;
	}

	.pie {
		width: 100%;
		height: 100%;
		display: block;
	}

	.track {
		fill: var(--surface-alt);
	}

	.label-line {
		stroke: var(--border-strong);
		stroke-width: 1;
	}

	.label-text {
		font-size: 9px;
		font-weight: 600;
		fill: var(--text);
	}

	.actual-label-text {
		font-size: 7px;
		fill: #fff;
	}

	.empty-hint {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		max-width: 6.5rem;
		margin: 0 auto;
		text-align: center;
		font-size: 0.8125rem;
		color: var(--text-muted);
		pointer-events: none;
	}

	.bars {
		display: none;
		flex-direction: column;
		gap: 0.625rem;
		max-width: 20rem;
		margin: 1rem auto;
	}

	.bar {
		display: flex;
		height: 0.625rem;
		border-radius: 999px;
		overflow: hidden;
		background: var(--surface-alt);
	}

	.actual-bar {
		height: 1.5rem;
	}

	.segment {
		height: 100%;
	}

	.bar-empty {
		margin: 0;
		font-size: 0.75rem;
		color: var(--text-muted);
	}
</style>
