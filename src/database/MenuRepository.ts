import type {
	BusinessSettings,
	Category,
	MenuImage,
	Product,
} from '../types/index.ts';

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
		| 'updatedAt'
	>
>;

export type CategoryUpdatePatch = Partial<
	Pick<Category, 'name' | 'order' | 'visible'>
>;

export type BusinessSettingsUpdatePatch = Partial<BusinessSettings> & {
	lastModified?: string;
};

export interface MenuRepository {
	requireBusinessId(): Promise<string>;

	listProducts(): Promise<Product[]>;
	getProduct(id: string): Promise<Product>;
	insertProduct(product: Product): Promise<void>;
	updateProduct(id: string, patch: ProductUpdatePatch): Promise<Product>;
	deleteProducts(ids: string[]): Promise<void>;
	reorderProducts(categoryId: string, orderedIds: string[]): Promise<void>;
	importProducts(products: Product[]): Promise<string>;

	listCategories(): Promise<Category[]>;
	insertCategory(category: Category): Promise<void>;
	updateCategory(id: string, patch: CategoryUpdatePatch): Promise<Category>;
	deleteCategory(id: string): Promise<void>;
	reorderCategories(orderedIds: string[]): Promise<void>;

	listImages(): Promise<MenuImage[]>;
	uploadImageFiles(
		id: string,
		fullBlob: Blob,
		thumbBlob: Blob,
	): Promise<{ url: string; thumbnailUrl: string }>;
	insertImage(image: MenuImage): Promise<MenuImage>;
	removeImageFiles(ids: string[]): Promise<void>;
	deleteMenuImage(id: string): Promise<void>;

	getSettings(): Promise<BusinessSettings>;
	fetchLastModified(businessId: string): Promise<string>;
	updateBusinessSettings(
		businessId: string,
		patch: BusinessSettingsUpdatePatch,
	): Promise<BusinessSettings>;
	touchLastModified(businessId: string): Promise<string>;
	resetMenu(): Promise<void>;
}
