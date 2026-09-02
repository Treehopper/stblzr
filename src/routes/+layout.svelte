<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

<style>
	:global(:root) {
		/* Single accent used across header, active controls, and primary buttons - the
		   pie chart's part colors are a separate, deliberately distinct categorical
		   palette (see colors.ts) since they encode data, not brand chrome. */
		--accent: #2563eb;
	}

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
		/* Without this, elements outside the two screen components (which each set their
		   own font-family) fall back to the browser's default serif font instead of
		   matching the rest of the sans-serif UI. */
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
	}
</style>
