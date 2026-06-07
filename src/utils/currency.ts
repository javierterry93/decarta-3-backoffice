import { isSearchActive, normalizeSearchText } from './searchText.ts';

const euroCurrencyFormatter = new Intl.NumberFormat('es-ES', {
	style: 'currency',
	currency: 'EUR',
});

const euroInputFormatter = new Intl.NumberFormat('es-ES', {
	minimumFractionDigits: 0,
	maximumFractionDigits: 2,
});

export function formatEuroPrice(value: number): string {
	return euroCurrencyFormatter.format(value);
}

export function formatEuroPriceInput(value: number): string {
	if (!Number.isFinite(value) || value <= 0) return '';
	return euroInputFormatter.format(value);
}

export function parseEuroPriceString(value: string): number {
	const cleaned = value.trim().replace(/€/g, '').replace(/\s/g, '');
	if (!cleaned) return 0;

	const lastComma = cleaned.lastIndexOf(',');
	const lastDot = cleaned.lastIndexOf('.');
	let normalized: string;

	if (lastComma > lastDot) {
		normalized = cleaned.replace(/\./g, '').replace(',', '.');
	} else if (lastDot > lastComma) {
		normalized = cleaned.replace(/,/g, '');
	} else if (lastComma >= 0) {
		normalized = cleaned.replace(',', '.');
	} else {
		normalized = cleaned;
	}

	const parsed = parseFloat(normalized);
	return Number.isFinite(parsed) ? parsed : 0;
}

function normalizePriceSearchText(value: string): string {
	return normalizeSearchText(value)
		.replace(/€/g, '')
		.replace(/\s/g, '')
		.replace(',', '.');
}

function getPriceSearchTexts(price: number): string[] {
	if (!Number.isFinite(price)) return [];

	const fixed = price.toFixed(2);
	const fixedEs = fixed.replace('.', ',');

	return [
		String(price),
		fixed,
		fixedEs,
		formatEuroPriceInput(price),
		formatEuroPrice(price),
	];
}

export function matchesPriceSearchQuery(price: number, query: string): boolean {
	if (!isSearchActive(query)) return true;

	const normalizedQuery = normalizePriceSearchText(query);

	return getPriceSearchTexts(price).some((text) =>
		normalizePriceSearchText(text).includes(normalizedQuery),
	);
}
