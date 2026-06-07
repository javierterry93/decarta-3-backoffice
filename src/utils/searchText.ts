export function normalizeSearchText(value: string): string {
	return value
		.normalize('NFD')
		.replace(/\p{M}/gu, '')
		.trim()
		.replace(/\s+/g, ' ')
		.toLocaleLowerCase('es');
}

export function isSearchActive(query: string): boolean {
	return normalizeSearchText(query).length > 0;
}

export function matchesSearchQuery(text: string, query: string): boolean {
	const normalizedQuery = normalizeSearchText(query);
	if (!normalizedQuery) return true;
	return normalizeSearchText(text).includes(normalizedQuery);
}
