<script lang="ts">
	import { THEMES } from '$lib/themes';
	import { themeSelection } from '$lib/state/theme.svelte';

	let { open = $bindable(false) }: { open?: boolean } = $props();

	const lightThemes = THEMES.filter((theme) => theme.mode === 'light');
	const darkThemes = THEMES.filter((theme) => theme.mode === 'dark');

	function close() {
		open = false;
	}

	function select(id: string) {
		themeSelection.select(id);
		close();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') close();
	}
</script>

{#if open}
	<button type="button" class="backdrop" aria-label="Close menu" onclick={close}></button>
	<nav class="drawer" aria-label="Menu" onkeydown={handleKeydown}>
		<div class="drawer-header">
			<h2>Color scheme</h2>
			<button type="button" class="close-button" aria-label="Close menu" onclick={close}>
				<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" focusable="false">
					<line x1="4" y1="4" x2="16" y2="16" stroke="currentColor" stroke-width="1.75" />
					<line x1="16" y1="4" x2="4" y2="16" stroke="currentColor" stroke-width="1.75" />
				</svg>
			</button>
		</div>
		<div class="scroll">
			<h3>Light</h3>
			<ul>
				{#each lightThemes as theme (theme.id)}
					{@const isSelected = themeSelection.id === theme.id}
					<li>
						<button
							type="button"
							class="theme-option"
							class:selected={isSelected}
							aria-pressed={isSelected}
							onclick={() => select(theme.id)}
						>
							<span class="swatches" style:background={theme.bg}>
								<span class="swatch" style:background={theme.accent}></span>
								<span class="swatch" style:background={theme.surfaceAlt}></span>
							</span>
							{theme.name}
						</button>
					</li>
				{/each}
			</ul>
			<h3>Dark</h3>
			<ul>
				{#each darkThemes as theme (theme.id)}
					{@const isSelected = themeSelection.id === theme.id}
					<li>
						<button
							type="button"
							class="theme-option"
							class:selected={isSelected}
							aria-pressed={isSelected}
							onclick={() => select(theme.id)}
						>
							<span class="swatches" style:background={theme.bg}>
								<span class="swatch" style:background={theme.accent}></span>
								<span class="swatch" style:background={theme.surfaceAlt}></span>
							</span>
							{theme.name}
						</button>
					</li>
				{/each}
			</ul>
		</div>
	</nav>
{/if}

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		border: none;
		padding: 0;
		background: rgb(15 23 42 / 45%);
		z-index: 20;
	}

	.drawer {
		position: fixed;
		top: 0;
		left: 0;
		bottom: 0;
		width: min(18rem, 85vw);
		background: var(--surface);
		color: var(--text);
		box-shadow: 2px 0 12px rgb(15 23 42 / 25%);
		z-index: 21;
		display: flex;
		flex-direction: column;
		padding-top: env(safe-area-inset-top);
	}

	.drawer-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1rem 0.75rem;
		border-bottom: 1px solid var(--border);
	}

	.drawer-header h2 {
		margin: 0;
		font-size: 1rem;
	}

	.close-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.75rem;
		height: 1.75rem;
		padding: 0;
		background: none;
		border: none;
		border-radius: 0.375rem;
		color: var(--text-muted);
		cursor: pointer;
	}

	.close-button:hover {
		background: var(--surface-alt);
	}

	.scroll {
		overflow-y: auto;
		padding: 0.5rem 1rem 1.5rem;
	}

	h3 {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--text-muted);
		margin: 1rem 0 0.5rem;
	}

	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.theme-option {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 0.625rem;
		text-align: left;
		background: none;
		border: 2px solid transparent;
		border-radius: 0.5rem;
		padding: 0.5rem 0.5rem;
		font: inherit;
		color: inherit;
		cursor: pointer;
	}

	.theme-option:hover {
		background: var(--surface-alt);
	}

	.theme-option.selected {
		border-color: var(--accent);
		background: var(--surface-alt);
	}

	.swatches {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		gap: 0.1875rem;
		width: 1.75rem;
		height: 1.75rem;
		border-radius: 999px;
		border: 1px solid var(--border);
		padding: 0.25rem;
		box-sizing: border-box;
	}

	.swatch {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 999px;
		flex-shrink: 0;
	}
</style>
