import type { Product } from '../types/index.ts';

export type ProductUpdatePatch = Partial<
	Pick<
		Product,
		| 'name'
		| 'categoryId'
		| 'order'
		| 'price'
		| 'shortDescription'
		| 'visible'
		| 'imageId'
	>
>;

export interface ProductRepository {
	listProducts(): Promise<Product[]>;
	getProduct(id: string): Promise<Product>;
	insertProduct(
		product: Omit<Product, 'createdAt' | 'updatedAt'>,
	): Promise<void>;
	updateProduct(id: string, patch: ProductUpdatePatch): Promise<Product>;
	deleteProducts(ids: string[]): Promise<void>;
	reorderProducts(categoryId: string, orderedIds: string[]): Promise<void>;
	importProducts(
		products: Omit<Product, 'createdAt' | 'updatedAt'>[],
	): Promise<void>;
}
