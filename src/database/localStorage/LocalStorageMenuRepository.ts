import {
	findCategoryByName,
	formatCategoryName,
} from '../../utils/categoryImport.ts';
import {
	clearAllLocalImageStorage,
	persistImageBlobs,
	removeImageBlobs,
} from '../../services/imageStorage/imageResolver.ts';
import { useMenuStore } from './menuStore.ts';
import { generateId } from '../../utils/format.ts';
import type {
	BusinessSettingsUpdateInput,
	CategoryCreateInput,
	CategoryReorderInput,
	CategoryResolveInput,
	CategoryUpdateInput,
	ImageCreateInput,
	ProductBulkDeleteInput,
	ProductCreateInput,
	ProductImportItem,
	ProductReorderInput,
	ProductUpdateInput,
} from '../../api/types.ts';
import type { MenuRepository } from '../MenuRepository.ts';

const store = () => useMenuStore.getState();

export class LocalStorageMenuRepository implements MenuRepository {
	getMenu() {
		const state = store();
		return Promise.resolve({
			products: state.products,
			categories: state.categories,
			images: state.images,
			settings: state.settings,
			lastModified: state.lastModified,
		});
	}

	listProducts() {
		return Promise.resolve(store().products);
	}

	async getProduct(id: string) {
		const product = store().products.find((p) => p.id === id);
		if (!product) throw new Error(`Producto no encontrado: ${id}`);
		return product;
	}

	createProduct(input: ProductCreateInput) {
		return Promise.resolve({ id: store().addProduct(input) });
	}

	async updateProduct(id: string, input: ProductUpdateInput) {
		store().updateProduct(id, input);
		return store().products.find((p) => p.id === id)!;
	}

	deleteProduct(id: string) {
		store().deleteProduct(id);
		return Promise.resolve();
	}

	deleteProducts({ ids }: ProductBulkDeleteInput) {
		for (const id of ids) {
			store().deleteProduct(id);
		}
		return Promise.resolve();
	}

	duplicateProduct(id: string) {
		return Promise.resolve({ id: store().duplicateProduct(id) });
	}

	reorderProducts(input: ProductReorderInput) {
		store().reorderProducts(input.categoryId, input.orderedIds);
		return Promise.resolve();
	}

	importProducts(items: ProductImportItem[]) {
		store().importProducts(items);
		return Promise.resolve({
			importedCount: items.length,
			lastModified: store().lastModified,
		});
	}

	listCategories() {
		return Promise.resolve(store().categories);
	}

	async getCategory(id: string) {
		const category = store().categories.find((c) => c.id === id);
		if (!category) throw new Error(`Categoría no encontrada: ${id}`);
		return category;
	}

	createCategory(input: CategoryCreateInput) {
		return Promise.resolve({ id: store().addCategory(input.name) });
	}

	async updateCategory(id: string, input: CategoryUpdateInput) {
		store().updateCategory(id, input);
		return store().categories.find((c) => c.id === id)!;
	}

	deleteCategory(id: string) {
		store().deleteCategory(id);
		return Promise.resolve();
	}

	reorderCategories(input: CategoryReorderInput) {
		store().reorderCategories(input.orderedIds);
		return Promise.resolve();
	}

	async resolveCategoryId(input: CategoryResolveInput) {
		const categories = store().categories;
		const formatted = formatCategoryName(input.name ?? '');
		if (!formatted) return { id: categories[0]?.id ?? '' };

		const existing = findCategoryByName(categories, formatted);
		if (existing) return { id: existing.id };

		return this.createCategory({ name: formatted });
	}

	listImages() {
		return Promise.resolve(store().images);
	}

	async getImage(id: string) {
		const image = store().images.find((i) => i.id === id);
		if (!image) throw new Error(`Imagen no encontrada: ${id}`);
		return image;
	}

	async createImage(input: ImageCreateInput) {
		const id = generateId();
		if (input.fullBlob && input.thumbBlob) {
			await persistImageBlobs(id, input.fullBlob, input.thumbBlob);
		}
		store().addImage({ id, name: input.name });
		const created = store().images.find((i) => i.id === id)!;
		return {
			...created,
			url: input.url,
			thumbnailUrl: input.thumbnailUrl,
		};
	}

	async deleteImage(id: string) {
		await removeImageBlobs(id);
		store().deleteImage(id);
	}

	getSettings() {
		return Promise.resolve(store().settings);
	}

	updateSettings(input: BusinessSettingsUpdateInput) {
		store().updateSettings(input);
		return Promise.resolve(store().settings);
	}

	async resetMenu() {
		await clearAllLocalImageStorage();
		store().resetMenu();
	}
}
