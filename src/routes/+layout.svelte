<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

<style>
	:global(html, body) {
		margin: 0;
		height: 100%;
		overflow: hidden;
		overscroll-behavior: none;
	}

	/* iOS Safari scrolls the *document* to reveal a focused input even when it can't be
	   scrolled by touch (overflow: hidden isn't enough to stop it) - fixing body in place
	   removes the scrollable box entirely, which is the only reliable way to stop that
	   native scroll-into-view jump. */
	:global(body) {
		position: fixed;
		inset: 0;
		width: 100%;
	}
</style>
