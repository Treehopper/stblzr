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
	// room to sit outside it without being clipped - kept as tight as the widest
	// label ("70%") allows, so the ring isn't surrounded by excess empty margin.
	// `.chart`'s max-width is scaled by the same factor, so the ring's on-screen
	// size stays put regardless of how much of that margin the labels need.
	const VIEWBOX = 156;
	const CENTER = 78;
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
			{ cx: CENTER, cy: CENTER, innerRadius: TARGET_INNER_RADIUS, outerRadius: TARGET_OUTER_RADIUS }
		)
	);

	// A short marker line plus label pointing at each target slice, so its percentage
	// can be read directly off the chart.
	const sliceLabels = $derived(
		targetSlices.map((slice, i) => {
			const lineStart = pointOnCircle(CENTER, CENTER, TARGET_OUTER_RADIUS, slice.midAngleDeg);
			const lineEnd = pointOnCircle(CENTER, CENTER, LABEL_LINE_RADIUS, slice.midAngleDeg);
			const textPoint = pointOnCircle(CENTER, CENTER, LABEL_TEXT_RADIUS, slice.midAngleDeg);
			const anchor =
				textPoint.x > CENTER + 1 ? 'start' : textPoint.x < CENTER - 1 ? 'end' : 'middle';
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
					cx: CENTER,
					cy: CENTER,
					innerRadius: 0,
					outerRadius: ACTUAL_RADIUS
				})
			: []
	);

	// Labels for the actual-holdings slices sit directly inside each slice instead of
	// pointing outward, since the target ring already occupies the space around the
	// outside of the chart.
	const actualSliceLabels = $derived(
		actualSlices.map((slice, i) => {
			const textPoint = pointOnCircle(CENTER, CENTER, ACTUAL_LABEL_RADIUS, slice.midAngleDeg);
			return { key: slice.key, textPoint, pct: actualParts[i]?.pct ?? 0 };
		})
	);

	// Vertical space gets tight when the on-screen keyboard opens on a phone. Drop to
	// horizontal bars once there's too little height for the pie chart. Driven by the
	// live visual-viewport height (not a `@media (max-height)` query) since Safari never
	// shrinks the CSS viewport for the keyboard.
	const barsOnly = $derived(viewportSize.height <= 480);
</script>

<div class="chart" style:display={barsOnly ? 'none' : undefined}>
	<svg viewBox="0 0 {VIEWBOX} {VIEWBOX}" class="pie" role="img" aria-label="Portfolio allocation">
		<circle class="track" cx={CENTER} cy={CENTER} r={TARGET_OUTER_RADIUS} />
		{#each targetSlices as slice, i (slice.key)}
			<path d={slice.path} fill={partColors[i % partColors.length]} />
		{/each}
		{#each actualSlices as slice, i (slice.key)}
			<path
				d={slice.path}
				fill={partColors[i % partColors.length]}
				stroke="#fff"
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
		max-width: 19.5rem;
		aspect-ratio: 1;
		margin: 1rem auto;
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
