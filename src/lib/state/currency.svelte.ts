import { browser } from '$app/environment';
import { CURRENCY_OPTIONS, type CurrencyId } from '$lib/currency';

const STORAGE_KEY = 'stblzr:currency';
const DEFAULT_CURRENCY: CurrencyId = 'EUR';

function isCurrencyId(value: string): value is CurrencyId {
	return CURRENCY_OPTIONS.some((option) => option.id === value);
}

function readStored(): CurrencyId {
	if (!browser) return DEFAULT_CURRENCY;
	const stored = localStorage.getItem(STORAGE_KEY);
	return stored && isCurrencyId(stored) ? stored : DEFAULT_CURRENCY;
}

let selectedCurrency = $state<CurrencyId>(readStored());

export const currencySelection = {
	get id() {
		return selectedCurrency;
	},
	select(id: CurrencyId) {
		selectedCurrency = id;
		if (browser) {
			localStorage.setItem(STORAGE_KEY, id);
		}
	}
};
