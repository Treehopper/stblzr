<script lang="ts">
	import AppHeader from '$lib/components/AppHeader.svelte';
	import { viewportSize } from '$lib/state/viewport.svelte';
	import type { Snippet } from 'svelte';

	let { title, subtitle, children }: { title: string; subtitle?: string; children: Snippet } =
		$props();
</script>

<div class="screen" style:top="{viewportSize.offsetTop}px" style:height="{viewportSize.height}px">
	<AppHeader {title} {subtitle} />
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
	}

	.scroll-area {
		flex: 1;
		overflow-y: auto;
		-webkit-mask-image: linear-gradient(to bottom, transparent, black 1.5rem);
		mask-image: linear-gradient(to bottom, transparent, black 1.5rem);
	}
</style>
