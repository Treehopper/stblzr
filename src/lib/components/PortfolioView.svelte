<script lang="ts">
	import AppScreen from '$lib/components/AppScreen.svelte';
	import HoldingsRow from '$lib/components/HoldingsRow.svelte';
	import PieChart from '$lib/components/PieChart.svelte';
	import { formatCurrency } from '$lib/currency';
	import { getTemplate } from '$lib/portfolio';
	import { buyOnlyActions, sellAndRebuyMinimalActions } from '$lib/rebalance';
	import { currencySelection } from '$lib/state/currency.svelte';
	import { portfolioHoldings } from '$lib/state/holdings.svelte';
	import { partNames } from '$lib/state/part-names.svelte';
	import { templateSelection } from '$lib/state/portfolio-template.svelte';

	const template = $derived(templateSelection.id ? getTemplate(templateSelection.id) : undefined);
	// Rebalance actions carry the template's default part label; resolve the
	// user's custom name (if any) by part key instead of trusting it verbatim.
	const partLabelByKey = $derived(
		new Map(template?.parts.map((part) => [part.key, partNames.nameFor(part)]) ?? [])
	);
	const buyActions = $derived(template ? buyOnlyActions(template, portfolioHoldings.all) : []);
	// Sells listed above buys within the sell-and-rebuy plan.
	const sellAndRebuyActions = $derived(
		template
			? [...sellAndRebuyMinimalActions(template, portfolioHoldings.all)].sort((a, b) =>
					a.type === b.type ? 0 : a.type === 'sell' ? -1 : 1
				)
			: []
	);

	let selectedOption = $state<'buy' | 'sellRebuy'>('buy');
	const activeActions = $derived(selectedOption === 'buy' ? buyActions : sellAndRebuyActions);
	const activePlanLabel = $derived(
		selectedOption === 'buy'
			? 'Already balanced — nothing to buy.'
			: 'Already balanced — nothing to sell or buy.'
	);

	// Bumped after applying a plan so the (locally-buffered) HoldingsRow inputs remount
	// and pick up the new stored amounts instead of showing stale, pre-apply values.
	let holdingsVersion = $state(0);

	function applyPlan(actions: { partKey: string; type: 'buy' | 'sell'; amount: number }[]) {
		for (const action of actions) {
			const current = portfolioHoldings.amountFor(action.partKey);
			portfolioHoldings.setAmount(
				action.partKey,
				action.type === 'buy' ? current + action.amount : current - action.amount
			);
		}
		holdingsVersion += 1;
	}
</script>

<AppScreen title="Your portfolio" subtitle={template?.label}>
	<div class="portfolio">
		{#if template}
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

				<div class="option-tabs" role="group" aria-label="Rebalancing option">
					<button
						type="button"
						class="tab"
						class:active={selectedOption === 'buy'}
						aria-pressed={selectedOption === 'buy'}
						onclick={() => (selectedOption = 'buy')}
					>
						Buy only
					</button>
					<button
						type="button"
						class="tab"
						class:active={selectedOption === 'sellRebuy'}
						aria-pressed={selectedOption === 'sellRebuy'}
						onclick={() => (selectedOption = 'sellRebuy')}
					>
						Sell and rebuy (minimal)
					</button>
				</div>

				{#if selectedOption === 'sellRebuy'}
					<p class="warning">⚠️ Selling may trigger taxes and other costs.</p>
				{/if}

				{#if activeActions.length > 0}
					<ul class="actions">
						{#each activeActions as action (action.partKey)}
							<li>
								<span class="action-label"
									>{action.type === 'buy' ? 'Buy' : 'Sell'}
									{partLabelByKey.get(action.partKey) ?? action.partLabel}</span
								>
								<span class="action-amount"
									>{formatCurrency(action.amount, currencySelection.id)}</span
								>
							</li>
						{/each}
					</ul>
					<button type="button" class="apply" onclick={() => applyPlan(activeActions)}>
						Apply
					</button>
				{:else}
					<p class="balanced">{activePlanLabel}</p>
				{/if}
			</section>
		{/if}
	</div>
</AppScreen>

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

	h2 {
		font-size: 1rem;
		margin: 1.5rem 0 0.5rem;
	}

	.warning {
		margin: 0.75rem 0 0.5rem;
		font-size: 0.8125rem;
		color: #b45309;
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

	.option-tabs {
		display: flex;
		gap: 0.5rem;
	}

	.tab {
		flex: 1;
		background: #e2e8f0;
		color: #334155;
	}

	.tab.active {
		background: #0f172a;
		color: #f8fafc;
	}

	.actions {
		list-style: none;
		margin: 0.75rem 0 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.actions li {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 0.75rem;
	}

	.action-label {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.action-amount {
		flex-shrink: 0;
		text-align: right;
		font-variant-numeric: tabular-nums;
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
