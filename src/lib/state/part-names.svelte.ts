import { browser } from '$app/environment';
import type { PortfolioPart } from '$lib/portfolio';

const STORAGE_KEY = 'stblzr:part-names';

function readStored(): Record<string, string> {
	if (!browser) return {};
	const raw = localStorage.getItem(STORAGE_KEY);
	if (!raw) return {};
	try {
		const parsed = JSON.parse(raw);
		if (parsed && typeof parsed === 'object') return parsed;
	} catch {
		// malformed data from an older version or manual tampering - fall back to empty
	}
	return {};
}

let customNames = $state<Record<string, string>>(readStored());

export const partNames = {
	nameFor(part: PortfolioPart): string {
		return customNames[part.key]?.trim() || part.label;
	},
	// An empty (or whitespace-only) name clears the override, reverting to the
	// template's default label rather than persisting a blank name.
	setName(partKey: string, name: string) {
		const trimmed = name.trim();
		const next = { ...customNames };
		if (trimmed) {
			next[partKey] = trimmed;
		} else {
			delete next[partKey];
		}
		customNames = next;
		if (browser) {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(customNames));
		}
	}
};
