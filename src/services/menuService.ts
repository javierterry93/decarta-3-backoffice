import { useMenuStore } from '../store/menuStore.ts';
import type {
	BusinessSettings,
	Category,
	MenuImage,
	Product,
} from '../types/index.ts';

const store = () => useMenuStore.getState();

export const menuService = {
	getProducts: (): Product[] => store().products,
	getCategories: (): Category[] => store().categories,
	getImages: (): MenuImage[] => store().images,
	getSettings: (): BusinessSettings => store().settings,
	getLastModified: (): string => store().lastModified,

	addProduct: (partial?: Partial<Product>): string =>
		store().addProduct(partial),
	updateProduct: (id: string, data: Partial<Product>): void =>
		store().updateProduct(id, data),
	duplicateProduct: (id: string): string => store().duplicateProduct(id),
	deleteProduct: (id: string): void => store().deleteProduct(id),

	reorderProducts: (categoryId: string, orderedIds: string[]): void =>
		store().reorderProducts(categoryId, orderedIds),

	addCategory: (name?: string): string => store().addCategory(name),
	updateCategory: (id: string, data: Partial<Category>): void =>
		store().updateCategory(id, data),
	deleteCategory: (id: string): void => store().deleteCategory(id),
	reorderCategories: (orderedIds: string[]): void =>
		store().reorderCategories(orderedIds),
	resolveCategoryId: (name: string): string => {
		const categories = store().categories;
		if (!name.trim()) return categories[0]?.id ?? '';
		const existing = categories.find(
			(c) => c.name.toLowerCase() === name.toLowerCase(),
		);
		if (existing) return existing.id;
		return store().addCategory(name.trim());
	},

	addImage: (image: Omit<MenuImage, 'id' | 'createdAt'>): string =>
		store().addImage(image),
	getImageById: (id: string): MenuImage | undefined =>
		store().images.find((i) => i.id === id),
	deleteImage: (id: string): void => store().deleteImage(id),

	updateSettings: (data: Partial<BusinessSettings>): void =>
		store().updateSettings(data),

	importProducts: (
		items: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'order'>[],
	): void => store().importProducts(items),
};
