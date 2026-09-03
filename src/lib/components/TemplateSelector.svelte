<script lang="ts">
	import AppScreen from '$lib/components/AppScreen.svelte';
	import { CURRENCY_OPTIONS } from '$lib/currency';
	import { PORTFOLIO_TEMPLATES } from '$lib/portfolio';
	import { currencySelection } from '$lib/state/currency.svelte';
	import { templateSelection } from '$lib/state/portfolio-template.svelte';
	import { themeSelection } from '$lib/state/theme.svelte';
	import { getTheme } from '$lib/themes';

	const partColors = $derived(getTheme(themeSelection.id).partColors);
</script>

<AppScreen title="Choose your portfolio template">
	<div class="selector">
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

		<h2 class="templates-heading">Choose template</h2>
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
						<span class="description">
							<svg
								class="info-icon"
								viewBox="0 0 20 20"
								width="14"
								height="14"
								aria-hidden="true"
								focusable="false"
							>
								<circle
									cx="10"
									cy="10"
									r="9"
									fill="none"
									stroke="currentColor"
									stroke-width="1.5"
								/>
								<circle cx="10" cy="6" r="1.15" fill="currentColor" />
								<rect x="9.1" y="8.75" width="1.8" height="6" rx="0.9" fill="currentColor" />
							</svg>
							{template.description}
						</span>
						<span class="bar" role="presentation">
							{#each template.parts as part, i (part.key)}
								<span
									class="segment"
									style:width="{part.targetPct}%"
									style:background={partColors[i % partColors.length]}
								></span>
							{/each}
						</span>
					</button>
				</li>
			{/each}
		</ul>
	</div>
</AppScreen>

<style>
	.selector {
		max-width: 28rem;
		margin: 0 auto;
		padding: 1.5rem 1rem;
		color: var(--text);
	}

	.intro {
		margin: 0 0 1.5rem;
		color: var(--text-muted);
	}

	.templates-heading {
		font-size: 1rem;
		font-weight: 600;
		margin: 0 0 0.75rem;
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
		background: var(--surface);
		border: 2px solid var(--border);
		border-radius: 0.75rem;
		padding: 0.5rem;
		cursor: pointer;
		font: inherit;
		color: inherit;
		box-shadow: 0 1px 2px rgb(15 23 42 / 8%);
	}

	.currency-option.selected {
		border-color: var(--accent);
		background: var(--surface-alt);
		box-shadow: 0 1px 3px rgb(37 99 235 / 25%);
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
		background: var(--surface);
		border: 2px solid var(--border);
		border-radius: 0.75rem;
		padding: 1rem;
		cursor: pointer;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		font: inherit;
		color: inherit;
		box-shadow: 0 1px 2px rgb(15 23 42 / 8%);
	}

	.template.selected {
		border-color: var(--accent);
		background: var(--surface-alt);
		box-shadow: 0 1px 3px rgb(37 99 235 / 25%);
	}

	.label {
		font-size: 1.125rem;
		font-weight: 600;
	}

	.description {
		display: flex;
		align-items: flex-start;
		gap: 0.375rem;
		font-size: 0.875rem;
		color: var(--text-muted);
	}

	.info-icon {
		flex-shrink: 0;
		color: var(--border-strong);
	}

	.bar {
		display: flex;
		height: 0.625rem;
		border-radius: 999px;
		overflow: hidden;
		background: var(--surface-alt);
	}

	.segment {
		height: 100%;
	}
</style>
