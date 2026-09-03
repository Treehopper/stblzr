import { browser } from '$app/environment';
import { THEMES } from '$lib/themes';

const STORAGE_KEY = 'stblzr:theme';
const DEFAULT_THEME_ID = 'daybreak';

function isThemeId(value: string): boolean {
	return THEMES.some((theme) => theme.id === value);
}

function readStored(): string {
	if (!browser) return DEFAULT_THEME_ID;
	const stored = localStorage.getItem(STORAGE_KEY);
	return stored && isThemeId(stored) ? stored : DEFAULT_THEME_ID;
}

let selectedThemeId = $state<string>(readStored());

export const themeSelection = {
	get id() {
		return selectedThemeId;
	},
	select(id: string) {
		selectedThemeId = id;
		if (browser) {
			localStorage.setItem(STORAGE_KEY, id);
		}
	}
};
