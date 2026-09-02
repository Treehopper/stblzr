<script lang="ts">
	import { untrack } from 'svelte';
	import { getCurrencyOption } from '$lib/currency';
	import type { PortfolioPart } from '$lib/portfolio';
	import { currencySelection } from '$lib/state/currency.svelte';
	import { portfolioHoldings } from '$lib/state/holdings.svelte';
	import { partNames } from '$lib/state/part-names.svelte';

	let { part }: { part: PortfolioPart } = $props();

	// A fresh component instance is created per part (keyed #each), so `part` never
	// changes after mount - only the initial stored amount should seed the input.
	let value = $state(untrack(() => portfolioHoldings.amountFor(part.key)) || undefined);

	const currencySymbol = $derived(getCurrencyOption(currencySelection.id).symbol);

	function handleInput() {
		portfolioHoldings.setAmount(part.key, Number.isFinite(value) ? (value as number) : 0);
	}

	let editingName = $state(false);
	let nameDraft = $state('');

	function startEditingName() {
		nameDraft = partNames.nameFor(part);
		editingName = true;
	}

	function commitNameEdit() {
		// Guards against a stray blur firing after Escape already cancelled the edit.
		if (!editingName) return;
		partNames.setName(part.key, nameDraft);
		editingName = false;
	}

	function handleNameKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			commitNameEdit();
		} else if (event.key === 'Escape') {
			editingName = false;
		}
	}
</script>

<div class="row">
	{#if editingName}
		<input
			class="name-input"
			type="text"
			autocomplete="off"
			aria-label="Name for {part.label}"
			bind:value={nameDraft}
			onblur={commitNameEdit}
			onkeydown={handleNameKeydown}
			autofocus
		/>
	{:else}
		<button type="button" class="name" onclick={startEditingName}>
			{partNames.nameFor(part)}
		</button>
	{/if}
	<span class="input-group">
		<span class="currency-symbol">{currencySymbol}</span>
		<!-- Without this, some browsers restore this field's value from before a page reload
		     directly on the DOM node, silently out of sync with the (correctly reloaded)
		     `value` above, since that restore never fires an input/change event. -->
		<input
			type="number"
			inputmode="decimal"
			min="0"
			step="0.01"
			autocomplete="off"
			bind:value
			oninput={handleInput}
		/>
	</span>
</div>

<style>
	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 0.5rem 0;
	}

	.name {
		background: none;
		border: none;
		border-bottom: 1px dashed transparent;
		padding: 0;
		font: inherit;
		color: #0f172a;
		text-align: left;
		cursor: pointer;
	}

	.name:hover,
	.name:focus-visible {
		border-bottom-color: #94a3b8;
	}

	.name-input {
		flex: 1;
		min-width: 0;
		font: inherit;
		color: #0f172a;
		border: 1px solid #cbd5e1;
		border-radius: 0.375rem;
		padding: 0.125rem 0.375rem;
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

	.input-group input {
		width: 8rem;
		padding: 0.375rem 0.5rem 0.375rem 1.5rem;
		border: 1px solid #cbd5e1;
		border-radius: 0.5rem;
		font: inherit;
		text-align: right;
		font-variant-numeric: tabular-nums;
		appearance: textfield;
		-webkit-appearance: textfield;
		-moz-appearance: textfield;
	}

	.input-group input::-webkit-outer-spin-button,
	.input-group input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
</style>
