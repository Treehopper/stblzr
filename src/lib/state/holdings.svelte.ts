import { browser } from '$app/environment';

const STORAGE_KEY = 'stblzr:holdings';

interface StoredHoldings {
	amounts: Record<string, number>;
	lastUpdatedAt: number | null;
}

function readStored(): StoredHoldings {
	if (!browser) return { amounts: {}, lastUpdatedAt: null };
	const raw = localStorage.getItem(STORAGE_KEY);
	if (!raw) return { amounts: {}, lastUpdatedAt: null };
	try {
		const parsed = JSON.parse(raw);
		if (parsed && typeof parsed === 'object') {
			if ('amounts' in parsed && parsed.amounts && typeof parsed.amounts === 'object') {
				return {
					amounts: parsed.amounts,
					lastUpdatedAt: typeof parsed.lastUpdatedAt === 'number' ? parsed.lastUpdatedAt : null
				};
			}
			// Pre-existing data from before "last updated" tracking was added: a flat
			// partKey -> amount map, with no timestamp to report.
			return { amounts: parsed, lastUpdatedAt: null };
		}
	} catch {
		// malformed data from an older version or manual tampering - fall back to empty
	}
	return { amounts: {}, lastUpdatedAt: null };
}

const stored = readStored();
let holdings = $state<Record<string, number>>(stored.amounts);
let lastUpdatedAt = $state<number | null>(stored.lastUpdatedAt);

export const portfolioHoldings = {
	get all() {
		return holdings;
	},
	get lastUpdatedAt() {
		return lastUpdatedAt;
	},
	amountFor(partKey: string): number {
		return holdings[partKey] ?? 0;
	},
	setAmount(partKey: string, amount: number) {
		holdings = { ...holdings, [partKey]: amount };
		lastUpdatedAt = Date.now();
		if (browser) {
			localStorage.setItem(STORAGE_KEY, JSON.stringify({ amounts: holdings, lastUpdatedAt }));
		}
	}
};
