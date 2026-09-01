<script lang="ts">
	import AppHeader from '$lib/components/AppHeader.svelte';
	import type { Snippet } from 'svelte';

	let { title, children }: { title: string; children: Snippet } = $props();
</script>

<div class="screen">
	<AppHeader {title} />
	<div class="scroll-area">
		{@render children()}
	</div>
</div>

<style>
	.screen {
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
