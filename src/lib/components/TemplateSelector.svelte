<script lang="ts">
	import { PORTFOLIO_TEMPLATES } from '$lib/portfolio';
	import { templateSelection } from '$lib/state/portfolio-template.svelte';

	const partColors = ['#38bdf8', '#a78bfa', '#fb923c'];
</script>

<div class="selector">
	<h1>Choose your portfolio template</h1>
	<p class="intro">Pick the target allocation you want to rebalance towards.</p>

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
								style:background={partColors[i % partColors.length]}
							></span>
						{/each}
					</span>
					<span class="parts">
						{#each template.parts as part (part.key)}
							<span class="part">{part.label} {part.targetPct}%</span>
						{/each}
					</span>
				</button>
			</li>
		{/each}
	</ul>

	{#if templateSelection.id}
		<p class="confirmation">
			Selected: <strong
				>{PORTFOLIO_TEMPLATES.find((t) => t.id === templateSelection.id)?.label}</strong
			>
		</p>
	{/if}
</div>

<style>
	.selector {
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

	.intro {
		margin: 0 0 1.5rem;
		color: #475569;
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

	.parts {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem 0.75rem;
		font-size: 0.875rem;
		color: #475569;
	}

	.confirmation {
		margin-top: 1.5rem;
		font-size: 0.9375rem;
	}
</style>
