import type { Category } from '../types/index.ts';
import type { ProductEditDraft } from './ProductEditLayout.tsx';

export function emptyProductDraft(categories: Category[]): ProductEditDraft {
	const defaultCategory =
		[...categories].sort((a, b) => a.order - b.order)[0]?.id ?? '';
	return {
		name: '',
		categoryId: defaultCategory,
		price: 0,
		shortDescription: '',
		visible: true,
		imageId: null,
	};
}

export function productToDraft(product: {
	name: string;
	categoryId: string;
	price: number;
	shortDescription: string;
	visible: boolean;
	imageId: string | null;
}): ProductEditDraft {
	return {
		name: product.name ?? '',
		categoryId: product.categoryId ?? '',
		price: product.price ?? 0,
		shortDescription: product.shortDescription ?? '',
		visible: product.visible ?? true,
		imageId: product.imageId ?? null,
	};
}

export type { ProductEditDraft };
