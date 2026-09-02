<script lang="ts">
	import { untrack } from 'svelte';
	import { formatAmount, getCurrencyOption, parseAmountInput } from '$lib/currency';
	import type { PortfolioPart } from '$lib/portfolio';
	import { currencySelection } from '$lib/state/currency.svelte';
	import { portfolioHoldings } from '$lib/state/holdings.svelte';
	import { partNames } from '$lib/state/part-names.svelte';

	let { part, color }: { part: PortfolioPart; color: string } = $props();

	// A fresh component instance is created per part (keyed #each), so `part` never
	// changes after mount - only the initial stored amount should seed the input.
	let value = $state(untrack(() => portfolioHoldings.amountFor(part.key)));

	// The displayed text: raw digits while focused (so typing isn't fought by grouping
	// separators moving under the cursor), grouped/formatted once the field is blurred.
	let text = $state(value ? formatAmount(value, untrack(() => currencySelection.id)) : '');
	let focused = $state(false);

	$effect(() => {
		if (!focused) {
			text = value ? formatAmount(value, currencySelection.id) : '';
		}
	});

	const currencySymbol = $derived(getCurrencyOption(currencySelection.id).symbol);

	function handleFocus() {
		focused = true;
		text = value ? String(value) : '';
	}

	function handleInput(event: Event) {
		text = (event.currentTarget as HTMLInputElement).value;
		value = parseAmountInput(text);
		portfolioHoldings.setAmount(part.key, value);
	}

	function handleBlur() {
		focused = false;
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
	<span class="swatch" style:background={color}></span>
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
		     `text` above, since that restore never fires an input/change event. -->
		<input
			type="text"
			inputmode="decimal"
			autocomplete="off"
			placeholder="0"
			aria-label="Amount for {partNames.nameFor(part)}"
			bind:value={text}
			onfocus={handleFocus}
			oninput={handleInput}
			onblur={handleBlur}
		/>
	</span>
</div>

<style>
	.row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0;
	}

	.swatch {
		flex-shrink: 0;
		width: 0.625rem;
		height: 0.625rem;
		border-radius: 999px;
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
		margin-left: auto;
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
	}
</style>
