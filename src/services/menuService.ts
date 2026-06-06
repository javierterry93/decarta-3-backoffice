import { getMenuApiClient } from '../api/getMenuApiClient.ts';
import type {
	BusinessSettingsUpdateInput,
	CategoryUpdateInput,
	ImageCreateInput,
	ProductCreateInput,
	ProductImportItem,
	ProductUpdateInput,
} from '../api/types.ts';

const client = () => getMenuApiClient();

export const menuService = {
	getMenu: () => client().getMenu(),

	getProducts: async () => (await client().getMenu()).products,
	getCategories: async () => (await client().getMenu()).categories,
	getImages: async () => (await client().getMenu()).images,
	getSettings: async () => (await client().getMenu()).settings,
	getLastModified: async () => (await client().getMenu()).lastModified,

	addProduct: async (partial?: ProductCreateInput) =>
		(await client().createProduct(partial ?? {})).id,
	updateProduct: (id: string, data: ProductUpdateInput) =>
		client().updateProduct(id, data),
	duplicateProduct: async (id: string) =>
		(await client().duplicateProduct(id)).id,
	deleteProduct: (id: string) => client().deleteProduct(id),
	reorderProducts: (categoryId: string, orderedIds: string[]) =>
		client().reorderProducts({ categoryId, orderedIds }),

	addCategory: async (name = '') => (await client().createCategory({ name })).id,
	updateCategory: (id: string, data: CategoryUpdateInput) =>
		client().updateCategory(id, data),
	deleteCategory: (id: string) => client().deleteCategory(id),
	reorderCategories: (orderedIds: string[]) =>
		client().reorderCategories({ orderedIds }),
	resolveCategoryId: async (name: string) =>
		(await client().resolveCategoryId({ name })).id,

	addImage: async (image: ImageCreateInput) =>
		(await client().createImage(image)).id,
	getImageById: async (id: string) => client().getImage(id),
	deleteImage: (id: string) => client().deleteImage(id),

	updateSettings: (data: BusinessSettingsUpdateInput) =>
		client().updateSettings(data),

	importProducts: (items: ProductImportItem[]) => client().importProducts(items),
};
