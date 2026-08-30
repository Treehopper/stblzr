<script lang="ts">
	import HoldingsRow from '$lib/components/HoldingsRow.svelte';
	import PieChart from '$lib/components/PieChart.svelte';
	import { getTemplate } from '$lib/portfolio';
	import { buyOnlyActions } from '$lib/rebalance';
	import { portfolioHoldings } from '$lib/state/holdings.svelte';
	import { templateSelection } from '$lib/state/portfolio-template.svelte';

	const template = $derived(templateSelection.id ? getTemplate(templateSelection.id) : undefined);
	const buyActions = $derived(template ? buyOnlyActions(template, portfolioHoldings.all) : []);

	let showBuyPlan = $state(false);
	// Bumped after applying a plan so the (locally-buffered) HoldingsRow inputs remount
	// and pick up the new stored amounts instead of showing stale, pre-apply values.
	let holdingsVersion = $state(0);

	function applyBuyPlan() {
		for (const action of buyActions) {
			portfolioHoldings.setAmount(
				action.partKey,
				portfolioHoldings.amountFor(action.partKey) + action.amount
			);
		}
		holdingsVersion += 1;
		showBuyPlan = false;
	}
</script>

<div class="portfolio">
	<h1>Your portfolio</h1>

	{#if template}
		<p class="template-label">{template.label}</p>

		<PieChart parts={template.parts} holdings={portfolioHoldings.all} />

		<section>
			<h2>Current holdings</h2>
			{#key holdingsVersion}
				{#each template.parts as part (part.key)}
					<HoldingsRow {part} />
				{/each}
			{/key}
		</section>

		<section>
			<h2>Rebalance</h2>
			<button type="button" onclick={() => (showBuyPlan = true)}>Buy only</button>

			{#if showBuyPlan}
				{#if buyActions.length > 0}
					<ul class="actions">
						{#each buyActions as action (action.partKey)}
							<li>Buy {action.amount.toFixed(2)} of {action.partLabel}</li>
						{/each}
					</ul>
					<button type="button" class="apply" onclick={applyBuyPlan}>Apply</button>
				{:else}
					<p class="balanced">Already balanced — nothing to buy.</p>
				{/if}
			{/if}
		</section>
	{/if}
</div>

<style>
	.portfolio {
		max-width: 28rem;
		margin: 0 auto;
		padding: 1.5rem 1rem;
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
		color: #0f172a;
	}

	h1 {
		font-size: 1.375rem;
		margin: 0 0 0.25rem;
	}

	h2 {
		font-size: 1rem;
		margin: 1.5rem 0 0.5rem;
	}

	.template-label {
		margin: 0;
		color: #475569;
	}

	button {
		background: #0f172a;
		color: #f8fafc;
		border: none;
		border-radius: 0.5rem;
		padding: 0.5rem 1rem;
		font: inherit;
		cursor: pointer;
	}

	.actions {
		list-style: none;
		margin: 0.75rem 0 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.apply {
		margin-top: 0.75rem;
		background: #16a34a;
	}

	.balanced {
		margin: 0.75rem 0 0;
		color: #475569;
	}
</style>
