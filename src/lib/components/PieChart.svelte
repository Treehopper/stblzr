<script lang="ts">
	import { PART_COLORS } from '$lib/colors';
	import { computeAnnularSlices } from '$lib/pie';
	import type { PortfolioPart } from '$lib/portfolio';

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

	// The actual-holdings disc only reflects what's been entered - hidden until there's
	// at least some money in the portfolio, since 0/0 has no meaningful proportions.
	const actualSlices = $derived(
		total > 0
			? computeAnnularSlices(
					parts.map((part) => ({
						key: part.key,
						pct: ((holdings[part.key] ?? 0) / total) * 100
					})),
					{
						cx: CENTER,
						cy: CENTER,
						innerRadius: 0,
						outerRadius: ACTUAL_RADIUS
					}
				)
			: []
	);
</script>

<div class="chart">
	<svg viewBox="0 0 112 112" class="pie" role="img" aria-label="Portfolio allocation">
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

<style>
	.chart {
		position: relative;
		width: 100%;
		max-width: 14rem;
		margin: 1rem auto;
	}

	.pie {
		width: 100%;
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
</style>
