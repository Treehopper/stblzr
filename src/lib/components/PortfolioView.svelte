<script lang="ts">
	import AppScreen from '$lib/components/AppScreen.svelte';
	import HoldingsRow from '$lib/components/HoldingsRow.svelte';
	import PieChart from '$lib/components/PieChart.svelte';
	import { formatCurrency, formatDate } from '$lib/currency';
	import { getTemplate } from '$lib/portfolio';
	import { buyOnlyActions, sellAndRebuyMinimalActions } from '$lib/rebalance';
	import { currencySelection } from '$lib/state/currency.svelte';
	import { portfolioHoldings } from '$lib/state/holdings.svelte';
	import { partNames } from '$lib/state/part-names.svelte';
	import { templateSelection } from '$lib/state/portfolio-template.svelte';
	import { themeSelection } from '$lib/state/theme.svelte';
	import { getTheme } from '$lib/themes';

	const partColors = $derived(getTheme(themeSelection.id).partColors);
	const template = $derived(templateSelection.id ? getTemplate(templateSelection.id) : undefined);
	// Rebalance actions carry the template's default part label; resolve the
	// user's custom name (if any) by part key instead of trusting it verbatim.
	const partLabelByKey = $derived(
		new Map(template?.parts.map((part) => [part.key, partNames.nameFor(part)]) ?? [])
	);
	// Same color a part gets in the pie chart, so the holdings and rebalance
	// rows below visually link back to their chart slice.
	const colorByKey = $derived(
		new Map(template?.parts.map((part, i) => [part.key, partColors[i % partColors.length]]) ?? [])
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

	// Briefly identifies the action whose amount was just copied, so the icon
	// can show a checkmark for a moment as feedback. Cleared after a short delay.
	// Keyed by plan + part key, since the same part key appears in both the
	// "buy only" and "sell and rebuy" plans with different amounts.
	let copiedActionKey = $state<string | null>(null);
	const actionKey = (action: { partKey: string }) => `${selectedOption}:${action.partKey}`;

	async function copyAmount(action: { partKey: string; amount: number }) {
		await navigator.clipboard.writeText(String(action.amount));
		const key = actionKey(action);
		copiedActionKey = key;
		setTimeout(() => {
			if (copiedActionKey === key) copiedActionKey = null;
		}, 1500);
	}
</script>

<AppScreen title="Your portfolio">
	<div class="portfolio">
		{#if template}
			<PieChart parts={template.parts} holdings={portfolioHoldings.all} />

			<section>
				<h2 class="holdings-heading">Current holdings</h2>
				{#key holdingsVersion}
					{#each template.parts as part (part.key)}
						<HoldingsRow {part} color={colorByKey.get(part.key) ?? partColors[0]} />
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
										style:background={colorByKey.get(action.partKey) ?? partColors[0]}
									></span>
									{action.type === 'buy' ? 'Buy' : 'Sell'}
									{partLabelByKey.get(action.partKey) ?? action.partLabel}
								</span>
								<span class="action-amount-group">
									<span class="action-amount"
										>{formatCurrency(action.amount, currencySelection.id)}</span
									>
									<button
										type="button"
										class="copy-button"
										aria-label="Copy {action.amount} to clipboard"
										onclick={() => copyAmount(action)}
									>
										{#if copiedActionKey === actionKey(action)}
											<svg
												viewBox="0 0 20 20"
												width="14"
												height="14"
												aria-hidden="true"
												focusable="false"
											>
												<path
													d="M4 10.5l4 4 8-9"
													fill="none"
													stroke="currentColor"
													stroke-width="1.75"
													stroke-linecap="round"
													stroke-linejoin="round"
												/>
											</svg>
										{:else}
											<svg
												viewBox="0 0 20 20"
												width="14"
												height="14"
												aria-hidden="true"
												focusable="false"
											>
												<rect
													x="7"
													y="3"
													width="9"
													height="12"
													rx="1.25"
													fill="none"
													stroke="currentColor"
													stroke-width="1.5"
												/>
												<rect
													x="4"
													y="6"
													width="9"
													height="12"
													rx="1.25"
													fill="var(--surface)"
													stroke="currentColor"
													stroke-width="1.5"
												/>
											</svg>
										{/if}
									</button>
								</span>
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
		padding: 0.75rem 1rem 1.5rem;
		color: var(--text);
	}

	h2 {
		font-size: 1rem;
		margin: 1.5rem 0 0.5rem;
	}

	/* The chart above already provides its own bottom margin as breathing room, so this
	   heading doesn't need its usual top margin stacked on top of that too. */
	.holdings-heading {
		margin-top: 0;
	}

	.warning {
		margin: 0.75rem 0 0.5rem;
		font-size: 0.8125rem;
		color: var(--warning);
	}

	button {
		background: linear-gradient(180deg, var(--accent-light), var(--accent-dark));
		color: var(--header-text, #f8fafc);
		border: none;
		border-radius: 0.5rem;
		padding: 0.5rem 1rem;
		font: inherit;
		cursor: pointer;
		box-shadow:
			inset 0 1px 0 rgb(255 255 255 / 20%),
			0 1px 2px rgb(15 23 42 / 25%);
		transition:
			filter 0.15s ease,
			box-shadow 0.15s ease,
			transform 0.05s ease;
	}

	button:hover {
		filter: brightness(1.05);
	}

	button:active {
		filter: brightness(0.95);
		box-shadow: inset 0 1px 2px rgb(15 23 42 / 25%);
		transform: translateY(1px);
	}

	.option-tabs {
		display: flex;
		gap: 0.5rem;
	}

	.tab {
		flex: 1;
		background: var(--surface-alt);
		color: var(--text-muted);
		box-shadow:
			inset 0 1px 2px rgb(15 23 42 / 8%),
			0 1px 0 rgb(255 255 255 / 60%);
	}

	.tab.active {
		background: linear-gradient(180deg, var(--accent-light), var(--accent-dark));
		color: var(--header-text, #f8fafc);
		box-shadow:
			inset 0 1px 0 rgb(255 255 255 / 20%),
			0 1px 2px rgb(15 23 42 / 25%);
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

	.action-amount-group {
		flex-shrink: 0;
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
	}

	.action-amount {
		text-align: right;
		font-variant-numeric: tabular-nums;
	}

	.copy-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.25rem;
		height: 1.25rem;
		padding: 0;
		background: none;
		border: none;
		border-radius: 0.25rem;
		color: var(--text-muted);
		cursor: pointer;
		box-shadow: none;
	}

	.copy-button:hover {
		background: var(--surface-alt);
		filter: none;
	}

	.copy-button:active {
		box-shadow: none;
		transform: none;
	}

	.total-row {
		display: flex;
		justify-content: space-between;
		margin-top: 0.5rem;
		padding-top: 0.5rem;
		border-top: 1px solid var(--border);
		font-weight: 600;
		font-variant-numeric: tabular-nums;
	}

	.last-updated {
		margin: 0.375rem 0 0;
		font-size: 0.75rem;
		color: var(--text-muted);
	}

	.apply {
		display: block;
		width: 100%;
		margin-top: 0.75rem;
	}

	.balanced {
		margin: 0.75rem 0 0;
		color: var(--text-muted);
	}
</style>
