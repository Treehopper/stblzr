<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { themeSelection } from '$lib/state/theme.svelte';
	import { getTheme } from '$lib/themes';

	let { children } = $props();

	const theme = $derived(getTheme(themeSelection.id));
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<!-- iOS paints the safe-area/overscroll regions using <html>'s own background rather
	     than any descendant element's, so a gap there would otherwise show through as a
	     stray bar. AppScreen.svelte's shell tries to extend into the bottom safe area (via
	     env(safe-area-inset-bottom)) in PWA/standalone mode, but that depends on
	     visualViewport reporting accurately, which isn't reliable on every device - any
	     shortfall shows up as a gap at the very bottom of the screen (the shell is always
	     flush against the top), not below the header, so this backstop is painted with the
	     page's own background rather than the header's accent color: a bottom gap should
	     blend into the content behind it, not stand out as a differently-colored bar.
	     Rendered here (rather than via an $effect) so it's applied as part of the initial
	     render, avoiding a flash of the wrong color. -->
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- theme.bg is a hardcoded hex value from src/lib/themes.ts, not user input -->
	{@html `<style>html { background: ${theme.bg} }</style>`}
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
