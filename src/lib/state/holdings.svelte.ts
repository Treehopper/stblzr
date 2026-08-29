import { browser } from '$app/environment';

const STORAGE_KEY = 'stblzr:holdings';

function readStored(): Record<string, number> {
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

let holdings = $state<Record<string, number>>(readStored());

export const portfolioHoldings = {
	get all() {
		return holdings;
	},
	amountFor(partKey: string): number {
		return holdings[partKey] ?? 0;
	},
	setAmount(partKey: string, amount: number) {
		holdings = { ...holdings, [partKey]: amount };
		if (browser) {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(holdings));
		}
	}
};
