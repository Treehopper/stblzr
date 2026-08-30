<script lang="ts">
	import { untrack } from 'svelte';
	import { getCurrencyOption } from '$lib/currency';
	import type { PortfolioPart } from '$lib/portfolio';
	import { currencySelection } from '$lib/state/currency.svelte';
	import { portfolioHoldings } from '$lib/state/holdings.svelte';

	let { part }: { part: PortfolioPart } = $props();

	// A fresh component instance is created per part (keyed #each), so `part` never
	// changes after mount - only the initial stored amount should seed the input.
	let value = $state(untrack(() => portfolioHoldings.amountFor(part.key)) || undefined);

	const currencySymbol = $derived(getCurrencyOption(currencySelection.id).symbol);

	function handleInput() {
		portfolioHoldings.setAmount(part.key, Number.isFinite(value) ? (value as number) : 0);
	}
</script>

<label class="row">
	<span class="name">{part.label}</span>
	<span class="input-group">
		<span class="currency-symbol">{currencySymbol}</span>
		<input
			type="number"
			inputmode="decimal"
			min="0"
			step="0.01"
			bind:value
			oninput={handleInput}
		/>
	</span>
</label>

<style>
	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 0.5rem 0;
	}

	.name {
		color: #0f172a;
	}

	.input-group {
		position: relative;
		display: inline-flex;
		align-items: center;
	}

	.currency-symbol {
		position: absolute;
		left: 0.5rem;
		color: #64748b;
		pointer-events: none;
	}

	input {
		width: 8rem;
		padding: 0.375rem 0.5rem 0.375rem 1.5rem;
		border: 1px solid #cbd5e1;
		border-radius: 0.5rem;
		font: inherit;
		text-align: right;
	}
</style>
