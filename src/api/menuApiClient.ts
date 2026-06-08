import type {
	BusinessSettings,
	Category,
	MenuImage,
	Product,
} from '../types/index.ts';
import type {
	BusinessSettingsUpdateInput,
	CategoryCreateInput,
	CategoryReorderInput,
	CategoryResolveInput,
	CategoryUpdateInput,
	EntityIdResponse,
	ImageCreateInput,
	MenuSnapshot,
	ProductBulkDeleteInput,
	ProductCreateInput,
	ProductImportItem,
	ProductImportResponse,
	ProductReorderInput,
	ProductUpdateInput,
} from './types.ts';

export interface MenuApiClient {
	getMenu(): Promise<MenuSnapshot>;

	createProduct(input: ProductCreateInput): Promise<EntityIdResponse>;
	updateProduct(id: string, input: ProductUpdateInput): Promise<Product>;
	deleteProduct(id: string): Promise<void>;
	deleteProducts(input: ProductBulkDeleteInput): Promise<void>;
	duplicateProduct(id: string): Promise<EntityIdResponse>;
	reorderProducts(input: ProductReorderInput): Promise<void>;
	importProducts(items: ProductImportItem[]): Promise<ProductImportResponse>;

	createCategory(input: CategoryCreateInput): Promise<EntityIdResponse>;
	updateCategory(id: string, input: CategoryUpdateInput): Promise<Category>;
	deleteCategory(id: string): Promise<void>;
	reorderCategories(input: CategoryReorderInput): Promise<void>;
	resolveCategoryId(input: CategoryResolveInput): Promise<EntityIdResponse>;

	createImage(input: ImageCreateInput): Promise<MenuImage>;
	deleteImage(id: string): Promise<void>;

	updateSettings(input: BusinessSettingsUpdateInput): Promise<BusinessSettings>;
	resetMenu(): Promise<void>;
}
