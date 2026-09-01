<script lang="ts">
	import { PART_COLORS } from '$lib/colors';
	import { CURRENCY_OPTIONS } from '$lib/currency';
	import { PORTFOLIO_TEMPLATES } from '$lib/portfolio';
	import { currencySelection } from '$lib/state/currency.svelte';
	import { templateSelection } from '$lib/state/portfolio-template.svelte';
</script>

<div class="selector">
	<h1>Choose your portfolio template</h1>
	<p class="intro">Pick the target allocation you want to rebalance towards.</p>

	<div class="currency-picker">
		<span class="currency-label" id="currency-label">Currency</span>
		<div class="currency-options" role="group" aria-labelledby="currency-label">
			{#each CURRENCY_OPTIONS as option (option.id)}
				{@const isSelected = currencySelection.id === option.id}
				<button
					type="button"
					class="currency-option"
					class:selected={isSelected}
					aria-pressed={isSelected}
					onclick={() => currencySelection.select(option.id)}
				>
					{option.symbol}
					{option.label}
				</button>
			{/each}
		</div>
	</div>

	<ul class="templates">
		{#each PORTFOLIO_TEMPLATES as template (template.id)}
			{@const isSelected = templateSelection.id === template.id}
			<li>
				<button
					type="button"
					class="template"
					class:selected={isSelected}
					aria-pressed={isSelected}
					onclick={() => templateSelection.select(template.id)}
				>
					<span class="label">{template.label}</span>
					<span class="bar" role="presentation">
						{#each template.parts as part, i (part.key)}
							<span
								class="segment"
								style:width="{part.targetPct}%"
								style:background={PART_COLORS[i % PART_COLORS.length]}
							></span>
						{/each}
					</span>
				</button>
			</li>
		{/each}
	</ul>
</div>

<style>
	.selector {
		max-width: 28rem;
		margin: 0 auto;
		padding: calc(1.5rem + env(safe-area-inset-top)) 1rem 1.5rem;
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

	.intro {
		margin: 0 0 1.5rem;
		color: #475569;
	}

	.currency-picker {
		margin: 0 0 1.5rem;
	}

	.currency-label {
		display: block;
		font-size: 0.875rem;
		font-weight: 600;
		margin: 0 0 0.5rem;
	}

	.currency-options {
		display: flex;
		gap: 0.5rem;
	}

	.currency-option {
		flex: 1;
		text-align: center;
		background: #f8fafc;
		border: 2px solid #e2e8f0;
		border-radius: 0.75rem;
		padding: 0.5rem;
		cursor: pointer;
		font: inherit;
		color: inherit;
	}

	.currency-option.selected {
		border-color: #0f172a;
		background: #f1f5f9;
	}

	.templates {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.template {
		width: 100%;
		text-align: left;
		background: #f8fafc;
		border: 2px solid #e2e8f0;
		border-radius: 0.75rem;
		padding: 1rem;
		cursor: pointer;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		font: inherit;
		color: inherit;
	}

	.template.selected {
		border-color: #0f172a;
		background: #f1f5f9;
	}

	.label {
		font-size: 1.125rem;
		font-weight: 600;
	}

	.bar {
		display: flex;
		height: 0.625rem;
		border-radius: 999px;
		overflow: hidden;
		background: #e2e8f0;
	}

	.segment {
		height: 100%;
	}
</style>
