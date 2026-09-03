<script lang="ts">
	import AppHeader from '$lib/components/AppHeader.svelte';
	import { viewportSize } from '$lib/state/viewport.svelte';
	import type { Snippet } from 'svelte';

	let { title, children }: { title: string; children: Snippet } = $props();
</script>

<!-- visualViewport.height (what viewportSize.height tracks) excludes the bottom safe
     area even in standalone/PWA mode with viewport-fit=cover, unlike the 100dvh CSS
     fallback below - without adding it back, the shell falls short of the real bottom
     edge, leaving a gap iOS fills with <html>'s own background instead of ours. -->
<div
	class="screen"
	style:top="{viewportSize.offsetTop}px"
	style:height="calc({viewportSize.height}px + env(safe-area-inset-bottom))"
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
		height: 100dvh;
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
