import {
	findCategoryByName,
	formatCategoryName,
} from '../utils/categoryImport.ts';
import {
	clearAllLocalImageStorage,
	persistImageBlobs,
	removeImageBlobs,
} from '../services/imageStorage/imageResolver.ts';
import { useMenuStore } from '../store/menuStore.ts';
import { generateId } from '../utils/format.ts';
import type { MenuApiClient } from './menuApiClient.ts';

const store = () => useMenuStore.getState();

export const localMenuApiClient: MenuApiClient = {
	getMenu: async () => {
		const state = store();
		return {
			products: state.products,
			categories: state.categories,
			images: state.images,
			settings: state.settings,
			lastModified: state.lastModified,
		};
	},

	listProducts: async () => store().products,
	getProduct: async (id) => {
		const product = store().products.find((p) => p.id === id);
		if (!product) throw new Error(`Producto no encontrado: ${id}`);
		return product;
	},
	createProduct: async (input) => ({ id: store().addProduct(input) }),
	updateProduct: async (id, input) => {
		store().updateProduct(id, input);
		return store().products.find((p) => p.id === id)!;
	},
	deleteProduct: async (id) => {
		store().deleteProduct(id);
	},
	duplicateProduct: async (id) => ({ id: store().duplicateProduct(id) }),
	reorderProducts: async ({ categoryId, orderedIds }) => {
		store().reorderProducts(categoryId, orderedIds);
	},
	importProducts: async (items) => {
		store().importProducts(items);
		return {
			importedCount: items.length,
			lastModified: store().lastModified,
		};
	},

	listCategories: async () => store().categories,
	getCategory: async (id) => {
		const category = store().categories.find((c) => c.id === id);
		if (!category) throw new Error(`Categoría no encontrada: ${id}`);
		return category;
	},
	createCategory: async (input) => ({ id: store().addCategory(input.name) }),
	updateCategory: async (id, input) => {
		store().updateCategory(id, input);
		return store().categories.find((c) => c.id === id)!;
	},
	deleteCategory: async (id) => {
		store().deleteCategory(id);
	},
	reorderCategories: async ({ orderedIds }) => {
		store().reorderCategories(orderedIds);
	},
	resolveCategoryId: async ({ name = '' }) => {
		const categories = store().categories;
		const formatted = formatCategoryName(name);
		if (!formatted) return { id: categories[0]?.id ?? '' };
		const existing = findCategoryByName(categories, formatted);
		if (existing) return { id: existing.id };
		return { id: store().addCategory(formatted) };
	},

	listImages: async () => store().images,
	getImage: async (id) => {
		const image = store().images.find((i) => i.id === id);
		if (!image) throw new Error(`Imagen no encontrada: ${id}`);
		return image;
	},
	createImage: async (input) => {
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
	},
	deleteImage: async (id) => {
		await removeImageBlobs(id);
		store().deleteImage(id);
	},

	getSettings: async () => store().settings,
	updateSettings: async (input) => {
		store().updateSettings(input);
		return store().settings;
	},

	resetMenu: async () => {
		await clearAllLocalImageStorage();
		store().resetMenu();
	},
};
