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
		formatter = new Intl.NumberFormat(option.locale, {
			style: 'currency',
			currency: option.id,
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		});
		formatters.set(currencyId, formatter);
	}
	return formatter;
}

export function formatCurrency(amount: number, currencyId: CurrencyId): string {
	return formatterFor(currencyId).format(amount);
}

const decimalFormatters = new Map<CurrencyId, Intl.NumberFormat>();

function decimalFormatterFor(currencyId: CurrencyId): Intl.NumberFormat {
	let formatter = decimalFormatters.get(currencyId);
	if (!formatter) {
		const option = getCurrencyOption(currencyId);
		formatter = new Intl.NumberFormat(option.locale, { maximumFractionDigits: 0 });
		decimalFormatters.set(currencyId, formatter);
	}
	return formatter;
}

// Same locale/grouping as formatCurrency, without the currency symbol - used for the
// holdings inputs, which show the symbol separately as a fixed prefix.
export function formatAmount(amount: number, currencyId: CurrencyId): string {
	return decimalFormatterFor(currencyId).format(amount);
}

// Amounts are always whole currency units (see formatCurrency), so any non-digit
// character - grouping dot, grouping comma, stray whitespace - can simply be discarded
// rather than parsed per-locale.
export function parseAmountInput(raw: string): number {
	const digits = raw.replace(/[^0-9]/g, '');
	return digits ? parseInt(digits, 10) : 0;
}

export function formatDate(timestamp: number, currencyId: CurrencyId): string {
	const option = getCurrencyOption(currencyId);
	return new Intl.DateTimeFormat(option.locale, {
		day: 'numeric',
		month: 'short',
		year: 'numeric'
	}).format(timestamp);
}
