<script lang="ts">
	import AppHeader from '$lib/components/AppHeader.svelte';
	import { viewportSize } from '$lib/state/viewport.svelte';
	import type { Snippet } from 'svelte';

	let { title, children }: { title: string; children: Snippet } = $props();
</script>

<!-- Whether visualViewport.height includes the bottom safe area at rest is inconsistent
     across devices, so the shell used to always add env(safe-area-inset-bottom) back on
     top of it - which overshot on devices where it was already included, leaving a
     same-color-as-the-page but visibly separate band at the bottom whenever the keyboard
     was closed. Only overriding position/height while the keyboard is actually open
     sidesteps that: at rest, the plain CSS below (mirroring how <body> itself is sized)
     is trusted on its own, with no safe-area math needed. -->
<div
	class="screen"
	style:top={viewportSize.keyboardOpen ? `${viewportSize.offsetTop}px` : undefined}
	style:height={viewportSize.keyboardOpen ? `${viewportSize.height}px` : undefined}
>
	<AppHeader {title} />
	<div class="scroll-area">
		{@render children()}
	</div>
</div>

<style>
	.screen {
		position: fixed;
		left: 0;
		right: 0;
		top: 0;
		height: 100%;
		display: flex;
		flex-direction: column;
		/* The very first keyboard-open can also collapse Safari's own address/tab bar,
		   which resizes the layout viewport at the same time our JS is reacting to the
		   visual-viewport pan - two animations racing each other looks like a jump no
		   matter how quickly the JS catches up. Transitioning these two properties turns
		   any such catch-up into a slide instead of a snap. */
		transition:
			top 0.2s ease-out,
			height 0.2s ease-out;
	}

	.scroll-area {
		flex: 1;
		overflow-y: auto;
		/* iOS also scrolls the nearest scrollable ancestor of a focused field to reveal
		   it - this container - abruptly and independently of the outer .screen
		   repositioning above. Without this it still snaps even once that's smoothed. */
		scroll-behavior: smooth;
		-webkit-mask-image: linear-gradient(to bottom, transparent, black 1.5rem);
		mask-image: linear-gradient(to bottom, transparent, black 1.5rem);
	}
</style>
