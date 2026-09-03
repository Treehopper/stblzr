<script lang="ts">
	import ThemeMenu from '$lib/components/ThemeMenu.svelte';

	let { title }: { title: string } = $props();

	let menuOpen = $state(false);
</script>

<header class="app-header">
	<div class="row">
		<button
			type="button"
			class="menu-button"
			aria-label="Open menu"
			aria-haspopup="true"
			aria-expanded={menuOpen}
			onclick={() => (menuOpen = true)}
		>
			<svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" focusable="false">
				<rect x="2" y="4.5" width="16" height="1.6" rx="0.8" fill="currentColor" />
				<rect x="2" y="9.2" width="16" height="1.6" rx="0.8" fill="currentColor" />
				<rect x="2" y="13.9" width="16" height="1.6" rx="0.8" fill="currentColor" />
			</svg>
		</button>
		<h1>{title}</h1>
		<span class="spacer" aria-hidden="true"></span>
	</div>
</header>

<ThemeMenu bind:open={menuOpen} />

<style>
	.app-header {
		flex-shrink: 0;
		background: linear-gradient(180deg, var(--accent-light), var(--accent-dark));
		box-shadow:
			inset 0 -1px 0 rgb(255 255 255 / 12%),
			0 2px 6px rgb(15 23 42 / 20%);
		padding: calc(0.875rem + env(safe-area-inset-top)) 1rem 0.875rem;
	}

	.row {
		max-width: 28rem;
		margin: 0 auto;
		display: grid;
		grid-template-columns: 2rem 1fr 2rem;
		align-items: center;
		gap: 0.75rem;
	}

	h1 {
		margin: 0;
		font-size: 1.375rem;
		font-weight: 700;
		color: var(--header-text, #fff);
		text-align: center;
	}

	.spacer {
		width: 2rem;
	}

	.menu-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		padding: 0;
		background: none;
		border: none;
		border-radius: 0.375rem;
		color: var(--header-text, #fff);
		cursor: pointer;
	}

	.menu-button:hover {
		background: rgb(255 255 255 / 15%);
	}
</style>
