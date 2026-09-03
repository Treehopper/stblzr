<script lang="ts">
	import { PART_COLORS } from '$lib/colors';
	import { computeAnnularSlices, pointOnCircle } from '$lib/pie';
	import type { PortfolioPart } from '$lib/portfolio';
	import { partNames } from '$lib/state/part-names.svelte';
	import { viewportSize } from '$lib/state/viewport.svelte';

	let {
		parts,
		holdings = {}
	}: {
		parts: PortfolioPart[];
		holdings?: Record<string, number>;
	} = $props();

	// The viewBox is wider than the ring itself so the target-percentage labels have
	// room to sit outside it without being clipped. `.chart`'s max-width is scaled up
	// by the same factor, so the ring's on-screen size is unchanged - only the margin
	// available for labels grows.
	const VIEWBOX = 168;
	const CENTER = 84;
	const ACTUAL_RADIUS = 40;
	const TARGET_INNER_RADIUS = 42;
	const TARGET_OUTER_RADIUS = 52;
	const LABEL_LINE_RADIUS = TARGET_OUTER_RADIUS + 6;
	const LABEL_TEXT_RADIUS = TARGET_OUTER_RADIUS + 10;
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
	// can be read directly off the chart instead of only from the legend below.
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
			<path d={slice.path} fill={PART_COLORS[i % PART_COLORS.length]} />
		{/each}
		{#each actualSlices as slice, i (slice.key)}
			<path d={slice.path} fill={PART_COLORS[i % PART_COLORS.length]} stroke="#fff" stroke-width="1" />
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

{#if !barsOnly}
	<ul class="legend">
		{#each parts as part, i (part.key)}
			<li>
				<span class="swatch" style:background={PART_COLORS[i % PART_COLORS.length]}></span>
				<span class="legend-name">{partNames.nameFor(part)}</span>
			</li>
		{/each}
	</ul>
{/if}

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
				style:background={PART_COLORS[i % PART_COLORS.length]}
			></span>
		{/each}
	</span>
	{#if total > 0}
		<span class="bar actual-bar" role="presentation">
			{#each actualParts as part, i (part.key)}
				<span
					class="segment"
					style:width="{part.pct}%"
					style:background={PART_COLORS[i % PART_COLORS.length]}
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
		max-width: 21rem;
		aspect-ratio: 1;
		margin: 1rem auto;
	}

	.pie {
		width: 100%;
		height: 100%;
		display: block;
	}

	.track {
		fill: #e2e8f0;
	}

	.label-line {
		stroke: #94a3b8;
		stroke-width: 1;
	}

	.label-text {
		font-size: 9px;
		font-weight: 600;
		fill: #0f172a;
	}

	.actual-label-text {
		font-size: 7px;
		fill: #fff;
	}

	.legend {
		list-style: none;
		margin: 0 auto 1rem;
		padding: 0;
		max-width: 20rem;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.5rem 1rem;
	}

	.legend li {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.8125rem;
	}

	.swatch {
		flex-shrink: 0;
		width: 0.625rem;
		height: 0.625rem;
		border-radius: 999px;
	}

	.legend-name {
		white-space: nowrap;
		color: #0f172a;
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
		color: #64748b;
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
		background: #e2e8f0;
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
		color: #64748b;
	}
</style>
