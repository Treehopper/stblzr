<script lang="ts">
	import { PART_COLORS } from '$lib/colors';
	import { computeAnnularSlices } from '$lib/pie';
	import type { PortfolioPart } from '$lib/portfolio';
	import { viewportSize } from '$lib/state/viewport.svelte';

	let {
		parts,
		holdings = {}
	}: {
		parts: PortfolioPart[];
		holdings?: Record<string, number>;
	} = $props();

	const CENTER = 56;
	const ACTUAL_RADIUS = 40;
	const TARGET_INNER_RADIUS = 44;
	const TARGET_OUTER_RADIUS = 52;

	const targetSlices = $derived(
		computeAnnularSlices(
			parts.map((part) => ({ key: part.key, pct: part.targetPct })),
			{ cx: CENTER, cy: CENTER, innerRadius: TARGET_INNER_RADIUS, outerRadius: TARGET_OUTER_RADIUS }
		)
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

	// Vertical space gets tight when the on-screen keyboard opens on a phone. Squash the
	// circle into an ellipse first to save height, then drop to horizontal bars once an
	// ellipse would end up too flat to read. Driven by the live visual-viewport height
	// (not a `@media (max-height)` query) since Safari never shrinks the CSS viewport
	// for the keyboard.
	const squashed = $derived(viewportSize.height <= 700);
	const barsOnly = $derived(viewportSize.height <= 480);
</script>

<div class="chart" class:squashed style:display={barsOnly ? 'none' : undefined}>
	<svg
		viewBox="0 0 112 112"
		preserveAspectRatio="none"
		class="pie"
		role="img"
		aria-label="Portfolio allocation"
	>
		{#each targetSlices as slice, i (slice.key)}
			<path d={slice.path} fill={PART_COLORS[i % PART_COLORS.length]} />
		{/each}
		{#each actualSlices as slice, i (slice.key)}
			<path d={slice.path} fill={PART_COLORS[i % PART_COLORS.length]} />
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
		max-width: 14rem;
		aspect-ratio: 1;
		margin: 1rem auto;
	}

	.pie {
		width: 100%;
		height: 100%;
		display: block;
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

	.chart.squashed {
		aspect-ratio: 2.6 / 1;
	}
</style>
