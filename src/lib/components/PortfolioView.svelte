<script lang="ts">
	import { getTemplate } from '$lib/portfolio';
	import { templateSelection } from '$lib/state/portfolio-template.svelte';

	const template = $derived(templateSelection.id ? getTemplate(templateSelection.id) : undefined);
</script>

<div class="portfolio">
	<h1>Your portfolio</h1>
	{#if template}
		<p class="template-label">{template.label}</p>
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

	.template-label {
		margin: 0;
		color: #475569;
	}
</style>
