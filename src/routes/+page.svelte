<script lang="ts">
	import PortfolioView from '$lib/components/PortfolioView.svelte';
	import TemplateSelector from '$lib/components/TemplateSelector.svelte';
	import { templateSelection } from '$lib/state/portfolio-template.svelte';
</script>

{#if templateSelection.id}
	<PortfolioView />
{:else}
	<TemplateSelector />
{/if}
