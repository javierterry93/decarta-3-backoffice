import { useMenuStore } from '../store/menuStore.ts';
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
		if (!name.trim()) return { id: categories[0]?.id ?? '' };
		const existing = categories.find(
			(c) => c.name.toLowerCase() === name.toLowerCase(),
		);
		if (existing) return { id: existing.id };
		return { id: store().addCategory(name.trim()) };
	},

	listImages: async () => store().images,
	getImage: async (id) => {
		const image = store().images.find((i) => i.id === id);
		if (!image) throw new Error(`Imagen no encontrada: ${id}`);
		return image;
	},
	createImage: async (input) => {
		const id = store().addImage(input);
		return store().images.find((i) => i.id === id)!;
	},
	deleteImage: async (id) => {
		store().deleteImage(id);
	},

	getSettings: async () => store().settings,
	updateSettings: async (input) => {
		store().updateSettings(input);
		return store().settings;
	},
};
