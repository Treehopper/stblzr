<script lang="ts">
	let { title }: { title: string } = $props();
</script>

<header class="app-header">
	<h1>{title}</h1>
</header>

<style>
	.app-header {
		flex-shrink: 0;
		background: #2563eb;
		padding: calc(0.875rem + env(safe-area-inset-top)) 1rem 0.875rem;
	}

	h1 {
		max-width: 28rem;
		margin: 0 auto;
		font-size: 1.375rem;
		font-weight: 700;
		color: #fff;
	}
</style>
