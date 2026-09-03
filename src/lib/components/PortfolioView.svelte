<script lang="ts">
	import AppScreen from '$lib/components/AppScreen.svelte';
	import HoldingsRow from '$lib/components/HoldingsRow.svelte';
	import PieChart from '$lib/components/PieChart.svelte';
	import { PART_COLORS } from '$lib/colors';
	import { formatCurrency, formatDate } from '$lib/currency';
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
	// Same color a part gets in the pie chart, so the holdings and rebalance
	// rows below visually link back to their chart slice.
	const colorByKey = $derived(
		new Map(template?.parts.map((part, i) => [part.key, PART_COLORS[i % PART_COLORS.length]]) ?? [])
	);

	const totalHoldings = $derived(
		template
			? template.parts.reduce((sum, part) => sum + portfolioHoldings.amountFor(part.key), 0)
			: 0
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
	const showActions = $derived(activeActions.length > 0);
	const activePlanLabel = $derived(
		selectedOption === 'buy'
			? 'Already balanced — nothing to buy.'
			: 'Already balanced — nothing to sell or buy.'
	);
	const totalActionAmount = $derived(
		activeActions.filter((action) => action.type === 'buy').reduce((sum, a) => sum + a.amount, 0)
	);
	const applyButtonLabel = $derived(
		selectedOption === 'buy' ? 'Record as bought' : 'Record as sold & bought'
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
						<HoldingsRow {part} color={colorByKey.get(part.key) ?? PART_COLORS[0]} />
					{/each}
				{/key}
				<div class="total-row">
					<span>Total</span>
					<span>{formatCurrency(totalHoldings, currencySelection.id)}</span>
				</div>
				{#if portfolioHoldings.lastUpdatedAt}
					<p class="last-updated">
						Last updated {formatDate(portfolioHoldings.lastUpdatedAt, currencySelection.id)}
					</p>
				{/if}
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
						Buy & sell
					</button>
				</div>

				{#if selectedOption === 'sellRebuy'}
					<p class="warning">⚠️ Selling may trigger taxes and other costs.</p>
				{/if}

				{#if showActions}
					<ul class="actions">
						{#each activeActions as action (action.partKey)}
							<li>
								<span class="action-label">
									<span
										class="swatch"
										style:background={colorByKey.get(action.partKey) ?? PART_COLORS[0]}
									></span>
									{action.type === 'buy' ? 'Buy' : 'Sell'}
									{partLabelByKey.get(action.partKey) ?? action.partLabel}
								</span>
								<span class="action-amount"
									>{formatCurrency(action.amount, currencySelection.id)}</span
								>
							</li>
						{/each}
					</ul>
					<div class="total-row">
						<span>Total to {selectedOption === 'buy' ? 'invest' : 'move'}</span>
						<span>{formatCurrency(totalActionAmount, currencySelection.id)}</span>
					</div>
					<button type="button" class="apply" onclick={() => applyPlan(activeActions)}>
						{applyButtonLabel}
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
		background: var(--accent);
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
		background: var(--accent);
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
		display: inline-flex;
		align-items: baseline;
		gap: 0.375rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.swatch {
		flex-shrink: 0;
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 999px;
		align-self: center;
	}

	.action-amount {
		flex-shrink: 0;
		text-align: right;
		font-variant-numeric: tabular-nums;
	}

	.total-row {
		display: flex;
		justify-content: space-between;
		margin-top: 0.5rem;
		padding-top: 0.5rem;
		border-top: 1px solid #e2e8f0;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
	}

	.last-updated {
		margin: 0.375rem 0 0;
		font-size: 0.75rem;
		color: #64748b;
	}

	.apply {
		display: block;
		width: 100%;
		margin-top: 0.75rem;
	}

	.balanced {
		margin: 0.75rem 0 0;
		color: #475569;
	}
</style>
