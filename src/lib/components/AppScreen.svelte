<script lang="ts">
	import AppHeader from '$lib/components/AppHeader.svelte';
	import { viewportSize } from '$lib/state/viewport.svelte';
	import type { Snippet } from 'svelte';

	let { title, children }: { title: string; children: Snippet } = $props();
</script>

<!-- At rest, .screen's bottom edge is anchored via `inset: 0` below, not a percentage
     height - a percentage height falls short of the true bottom edge by the safe-area
     amount on iOS even under viewport-fit=cover (this cost two earlier attempts:
     `height: 100%` seemed like it should behave like <body>'s `inset: 0`, but only
     edge-anchoring actually reaches past the inset). While the keyboard is open, the
     inline top/height below (which CSS lets override the anchored top/bottom edges)
     takes over, matching the live visual viewport instead. -->

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
		inset: 0;
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
