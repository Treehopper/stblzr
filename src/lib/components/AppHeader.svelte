<script lang="ts">
	let { title, subtitle }: { title: string; subtitle?: string } = $props();
</script>

<header class="app-header">
	<div class="row">
		<h1>{title}</h1>
		{#if subtitle}
			<span class="subtitle">{subtitle}</span>
		{/if}
	</div>
</header>

<style>
	.app-header {
		flex-shrink: 0;
		background: linear-gradient(180deg, var(--accent-light), var(--accent-dark));
		box-shadow:
			inset 0 -1px 0 rgb(255 255 255 / 12%),
			0 2px 6px rgb(15 23 42 / 20%);
		padding: calc(0.875rem + env(safe-area-inset-top)) 1rem 0.875rem;
	}

	.row {
		max-width: 28rem;
		margin: 0 auto;
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.75rem;
	}

	h1 {
		margin: 0;
		font-size: 1.375rem;
		font-weight: 700;
		color: #fff;
	}

	.subtitle {
		flex-shrink: 0;
		font-size: 0.8125rem;
		font-weight: 600;
		color: rgb(255 255 255 / 85%);
	}
</style>
