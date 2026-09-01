import { defineConfig } from 'vitest/config';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

// Set by the GitHub Pages deploy workflow, since the app is served from a project
// subpath (.../stblzr/) rather than a domain root. Empty locally and in CI, so
// `npm run dev` / a plain `npm run build` are unaffected.
const base = (process.env.BASE_PATH ?? '') as '' | `/${string}`;

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter({ fallback: 'index.html' }),
			paths: { base }
		}),
		SvelteKitPWA({
			registerType: 'autoUpdate',
			manifest: {
				name: 'stblzr',
				short_name: 'stblzr',
				description: 'ETF portfolio rebalancer for savings plans',
				theme_color: '#2563eb',
				background_color: '#0f172a',
				display: 'standalone',
				start_url: `${base}/`,
				scope: `${base}/`,
				icons: [
					{ src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
					{ src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
					{
						src: 'icon-512-maskable.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable'
					}
				]
			}
		})
	],
	test: {
		expect: { requireAssertions: true },
		coverage: {
			provider: 'v8',
			reporter: ['text', 'lcov']
		},
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
