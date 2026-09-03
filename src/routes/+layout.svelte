<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { themeSelection } from '$lib/state/theme.svelte';
	import { getTheme } from '$lib/themes';

	let { children } = $props();

	const theme = $derived(getTheme(themeSelection.id));

	// In standalone/PWA mode, iOS paints the safe-area and overscroll regions using
	// <html>'s own background rather than any descendant element's - without this, a
	// gap there (e.g. below the fixed-height app shell) shows through as a stray white
	// bar instead of the theme's background.
	$effect(() => {
		document.documentElement.style.background = theme.bg;
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div
	class="theme-root"
	style:color-scheme={theme.mode}
	style:--accent={theme.accent}
	style:--accent-light={theme.accentLight}
	style:--accent-dark={theme.accentDark}
	style:--bg={theme.bg}
	style:--surface={theme.surface}
	style:--surface-alt={theme.surfaceAlt}
	style:--text={theme.text}
	style:--text-muted={theme.textMuted}
	style:--border={theme.border}
	style:--border-strong={theme.borderStrong}
	style:--header-text={theme.headerText}
	style:--warning={theme.warning}
>
	{@render children()}
</div>

<style>
	:global(html, body) {
		margin: 0;
		height: 100%;
		overflow: hidden;
		overscroll-behavior: none;
	}

	.theme-root {
		height: 100%;
		background: var(--bg);
		color: var(--text);
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
