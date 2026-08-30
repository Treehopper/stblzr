export type CurrencyId = 'EUR' | 'USD';

export interface CurrencyOption {
	id: CurrencyId;
	label: string;
	symbol: string;
	locale: string;
}

export const CURRENCY_OPTIONS: CurrencyOption[] = [
	{ id: 'EUR', label: 'Euro', symbol: '€', locale: 'de-DE' },
	{ id: 'USD', label: 'US Dollar', symbol: '$', locale: 'en-US' }
];

export function getCurrencyOption(id: CurrencyId): CurrencyOption {
	return CURRENCY_OPTIONS.find((option) => option.id === id) ?? CURRENCY_OPTIONS[0];
}

const formatters = new Map<CurrencyId, Intl.NumberFormat>();

function formatterFor(currencyId: CurrencyId): Intl.NumberFormat {
	let formatter = formatters.get(currencyId);
	if (!formatter) {
		const option = getCurrencyOption(currencyId);
		formatter = new Intl.NumberFormat(option.locale, { style: 'currency', currency: option.id });
		formatters.set(currencyId, formatter);
	}
	return formatter;
}

export function formatCurrency(amount: number, currencyId: CurrencyId): string {
	return formatterFor(currencyId).format(amount);
}
