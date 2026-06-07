import type { Product } from '../types/index.ts';

export type ProductIssue = 'missing-name' | 'invalid-price';

export function isProductNameValid(name: string | undefined): boolean {
	return Boolean(name?.trim());
}

export function isProductPriceValid(price: number | undefined): boolean {
	return typeof price === 'number' && Number.isFinite(price) && price > 0;
}

export function getProductIssues(product: Product): ProductIssue[] {
	const issues: ProductIssue[] = [];
	if (!isProductNameValid(product.name)) issues.push('missing-name');
	if (!isProductPriceValid(product.price)) issues.push('invalid-price');
	return issues;
}

export function hasProductIssues(product: Product): boolean {
	return getProductIssues(product).length > 0;
}

export function isProductDraftValid(draft: {
	name: string;
	categoryId?: string;
	price: number;
}): boolean {
	return (
		Boolean(draft.categoryId?.length) &&
		isProductNameValid(draft.name) &&
		isProductPriceValid(draft.price)
	);
}

export const productIssueLabels: Record<ProductIssue, string> = {
	'missing-name': 'Sin nombre',
	'invalid-price': 'Precio obligatorio',
};
