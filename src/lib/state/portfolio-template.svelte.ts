import { browser } from '$app/environment';
import { getTemplate } from '$lib/portfolio';

const STORAGE_KEY = 'stblzr:selected-template';

function readStored(): string | null {
	if (!browser) return null;
	const stored = localStorage.getItem(STORAGE_KEY);
	return stored && getTemplate(stored) ? stored : null;
}

let selectedTemplateId = $state<string | null>(readStored());

export const templateSelection = {
	get id() {
		return selectedTemplateId;
	},
	select(id: string) {
		selectedTemplateId = id;
		if (browser) {
			localStorage.setItem(STORAGE_KEY, id);
		}
	}
};
