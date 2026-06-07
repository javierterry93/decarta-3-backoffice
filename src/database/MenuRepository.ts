import type {
	BusinessSettingsUpdateInput,
	CategoryCreateInput,
	CategoryReorderInput,
	CategoryResolveInput,
	CategoryUpdateInput,
	EntityIdResponse,
	ImageCreateInput,
	MenuSnapshot,
	ProductCreateInput,
	ProductImportItem,
	ProductImportResponse,
	ProductReorderInput,
	ProductUpdateInput,
} from '../api/types.ts';
import type {
	BusinessSettings,
	Category,
	MenuImage,
	Product,
} from '../types/index.ts';

export interface MenuRepository {
	getMenu(): Promise<MenuSnapshot>;

	listProducts(): Promise<Product[]>;
	getProduct(id: string): Promise<Product>;
	createProduct(input: ProductCreateInput): Promise<EntityIdResponse>;
	updateProduct(id: string, input: ProductUpdateInput): Promise<Product>;
	deleteProduct(id: string): Promise<void>;
	duplicateProduct(id: string): Promise<EntityIdResponse>;
	reorderProducts(input: ProductReorderInput): Promise<void>;
	importProducts(items: ProductImportItem[]): Promise<ProductImportResponse>;

	listCategories(): Promise<Category[]>;
	getCategory(id: string): Promise<Category>;
	createCategory(input: CategoryCreateInput): Promise<EntityIdResponse>;
	updateCategory(id: string, input: CategoryUpdateInput): Promise<Category>;
	deleteCategory(id: string): Promise<void>;
	reorderCategories(input: CategoryReorderInput): Promise<void>;
	resolveCategoryId(input: CategoryResolveInput): Promise<EntityIdResponse>;

	listImages(): Promise<MenuImage[]>;
	getImage(id: string): Promise<MenuImage>;
	createImage(input: ImageCreateInput): Promise<MenuImage>;
	deleteImage(id: string): Promise<void>;

	getSettings(): Promise<BusinessSettings>;
	updateSettings(input: BusinessSettingsUpdateInput): Promise<BusinessSettings>;
	resetMenu(): Promise<void>;
}
