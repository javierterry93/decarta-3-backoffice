import type { Category } from '../types/index.ts';

export const PENDING_CATEGORY_PREFIX = '__pending__:';

export function normalizeCategoryName(name: string): string {
	return name
		.normalize('NFD')
		.replace(/\p{M}/gu, '')
		.trim()
		.replace(/\s+/g, ' ')
		.toLocaleLowerCase('es');
}

export function formatCategoryName(name: string): string {
	return name.trim().replace(/\s+/g, ' ');
}

export function findCategoryByName(
	categories: Category[],
	name: string,
): Category | undefined {
	const normalized = normalizeCategoryName(name);
	if (!normalized) return undefined;
	return categories.find(
		(category) => normalizeCategoryName(category.name) === normalized,
	);
}

export function createCategoryImportResolver(categories: Category[]) {
	const pendingByKey = new Map<string, string>();

	return (name: string): string => {
		const formatted = formatCategoryName(name);
		if (!formatted) return categories[0]?.id ?? '';

		const existing = findCategoryByName(categories, formatted);
		if (existing) return existing.id;

		const key = normalizeCategoryName(formatted);
		const cached = pendingByKey.get(key);
		if (cached) return cached;

		const pendingId = `${PENDING_CATEGORY_PREFIX}${formatted}`;
		pendingByKey.set(key, pendingId);
		return pendingId;
	};
}

export async function resolveImportedProductCategories<
	T extends { categoryId: string },
>(
	items: T[],
	resolveCategoryId: (name: string) => Promise<{ id: string }>,
): Promise<T[]> {
	const pendingNames = new Map<string, string>();

	for (const item of items) {
		if (!item.categoryId.startsWith(PENDING_CATEGORY_PREFIX)) continue;
		const name = item.categoryId.slice(PENDING_CATEGORY_PREFIX.length);
		const key = normalizeCategoryName(name);
		if (!key || pendingNames.has(key)) continue;
		pendingNames.set(key, formatCategoryName(name));
	}

	const idByKey = new Map<string, string>();
	for (const [key, name] of pendingNames) {
		const { id } = await resolveCategoryId(name);
		idByKey.set(key, id);
	}

	return items.map((item) => {
		if (!item.categoryId.startsWith(PENDING_CATEGORY_PREFIX)) return item;
		const name = item.categoryId.slice(PENDING_CATEGORY_PREFIX.length);
		const key = normalizeCategoryName(name);
		const categoryId = idByKey.get(key);
		return categoryId ? { ...item, categoryId } : item;
	});
}
