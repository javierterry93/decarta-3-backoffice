import type { MenuRepository } from '../database/MenuRepository.ts';
import type { Product } from '../types/index.ts';
import {
	findCategoryByName,
	formatCategoryName,
} from '../utils/categoryImport.ts';
import { generateId } from '../utils/format.ts';
import type { MenuApiClient } from './menuApiClient.ts';
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
} from './types.ts';

function now(): string {
	return new Date().toISOString();
}

function nextOrderInCategory(products: Product[], categoryId: string): number {
	return (
		Math.max(
			0,
			...products.filter((p) => p.categoryId === categoryId).map((p) => p.order),
		) + 1
	);
}

export function createMenuService(repository: MenuRepository): MenuApiClient {
	return {
		async getMenu() {
			const businessId = await repository.requireBusinessId();
			const [products, categories, images, settings, lastModified] =
				await Promise.all([
					repository.listProducts(),
					repository.listCategories(),
					repository.listImages(),
					repository.getSettings(),
					repository.fetchLastModified(businessId),
				]);

			return { products, categories, images, settings, lastModified };
		},

		async createProduct(input: ProductCreateInput) {
			const businessId = await repository.requireBusinessId();
			const categories = await repository.listCategories();
			const products = await repository.listProducts();
			const id = generateId();
			const timestamp = now();
			const categoryId = input.categoryId ?? categories[0]?.id ?? '';

			const product: Product = {
				id,
				name: input.name ?? '',
				categoryId,
				order: nextOrderInCategory(products, categoryId),
				price: input.price ?? 0,
				shortDescription: input.shortDescription ?? '',
				visible: input.visible ?? true,
				imageId: input.imageId ?? null,
				createdAt: timestamp,
				updatedAt: timestamp,
			};

			await repository.insertProduct(product);
			await repository.touchLastModified(businessId);
			return { id };
		},

		async updateProduct(id: string, input: ProductUpdateInput) {
			const businessId = await repository.requireBusinessId();
			const current = await repository.getProduct(id);
			const timestamp = now();
			let nextOrder = input.order ?? current.order;

			if (input.categoryId && input.categoryId !== current.categoryId) {
				const products = (await repository.listProducts()).filter(
					(p) => p.id !== id,
				);
				nextOrder = nextOrderInCategory(products, input.categoryId);
			}

			const product = await repository.updateProduct(id, {
				...(input.name !== undefined ? { name: input.name } : {}),
				...(input.categoryId !== undefined ? { categoryId: input.categoryId } : {}),
				...(input.order !== undefined || input.categoryId !== undefined
					? { order: nextOrder }
					: {}),
				...(input.price !== undefined ? { price: input.price } : {}),
				...(input.shortDescription !== undefined
					? { shortDescription: input.shortDescription }
					: {}),
				...(input.visible !== undefined ? { visible: input.visible } : {}),
				...(input.imageId !== undefined ? { imageId: input.imageId } : {}),
				updatedAt: timestamp,
			});
			await repository.touchLastModified(businessId);
			return product;
		},

		async deleteProduct(id: string) {
			await repository.deleteProducts([id]);
		},

		async deleteProducts({ ids }: ProductBulkDeleteInput) {
			await repository.deleteProducts(ids);
		},

		async duplicateProduct(id: string) {
			const businessId = await repository.requireBusinessId();
			const source = await repository.getProduct(id);
			const products = await repository.listProducts();
			const newId = generateId();
			const timestamp = now();

			const copy: Product = {
				...source,
				id: newId,
				name: `${source.name} (copia)`,
				order: nextOrderInCategory(products, source.categoryId),
				createdAt: timestamp,
				updatedAt: timestamp,
			};

			await repository.insertProduct(copy);
			await repository.touchLastModified(businessId);
			return { id: newId };
		},

		async reorderProducts({ categoryId, orderedIds }: ProductReorderInput) {
			await repository.reorderProducts(categoryId, orderedIds);
		},

		async importProducts(items: ProductImportItem[]) {
			const businessId = await repository.requireBusinessId();
			const timestamp = now();
			const runningProducts = await repository.listProducts();
			const products = items.map((item) => {
				const order = nextOrderInCategory(runningProducts, item.categoryId);
				const product: Product = {
					...item,
					id: generateId(),
					order,
					createdAt: timestamp,
					updatedAt: timestamp,
				};
				runningProducts.push(product);
				return product;
			});

			if (products.length === 0) {
				return {
					importedCount: 0,
					lastModified: await repository.fetchLastModified(businessId),
				};
			}

			const lastModified = await repository.importProducts(products);
			return { importedCount: items.length, lastModified };
		},

		async createCategory(input: CategoryCreateInput) {
			const businessId = await repository.requireBusinessId();
			const categories = await repository.listCategories();
			const id = generateId();
			const category = {
				id,
				name: input.name ?? '',
				order: Math.max(0, ...categories.map((c) => c.order)) + 1,
				visible: true,
			};

			await repository.insertCategory(category);
			await repository.touchLastModified(businessId);
			return { id };
		},

		async updateCategory(id: string, input: CategoryUpdateInput) {
			const businessId = await repository.requireBusinessId();
			const category = await repository.updateCategory(id, {
				...(input.name !== undefined ? { name: input.name } : {}),
				...(input.order !== undefined ? { order: input.order } : {}),
				...(input.visible !== undefined ? { visible: input.visible } : {}),
			});
			await repository.touchLastModified(businessId);
			return category;
		},

		async deleteCategory(id: string) {
			await repository.deleteCategory(id);
		},

		async reorderCategories({ orderedIds }: CategoryReorderInput) {
			await repository.reorderCategories(orderedIds);
		},

		async resolveCategoryId({ name = '' }: CategoryResolveInput) {
			const categories = await repository.listCategories();
			const formatted = formatCategoryName(name);
			if (!formatted) return { id: categories[0]?.id ?? '' };

			const existing = findCategoryByName(categories, formatted);
			if (existing) return { id: existing.id };

			const businessId = await repository.requireBusinessId();
			const id = generateId();
			const category = {
				id,
				name: formatted,
				order: Math.max(0, ...categories.map((c) => c.order)) + 1,
				visible: true,
			};

			await repository.insertCategory(category);
			await repository.touchLastModified(businessId);
			return { id };
		},

		async createImage(input: ImageCreateInput) {
			const businessId = await repository.requireBusinessId();
			const id = generateId();
			const timestamp = now();
			let url = input.url;
			let thumbnailUrl = input.thumbnailUrl;

			if (input.fullBlob && input.thumbBlob) {
				const uploaded = await repository.uploadImageFiles(
					id,
					input.fullBlob,
					input.thumbBlob,
				);
				url = uploaded.url;
				thumbnailUrl = uploaded.thumbnailUrl;
			}

			const image = await repository.insertImage({
				id,
				name: input.name,
				createdAt: timestamp,
				url,
				thumbnailUrl,
			});

			await repository.touchLastModified(businessId);
			return image;
		},

		async deleteImage(id: string) {
			await repository.deleteMenuImage(id);
		},

		async updateSettings(input: BusinessSettingsUpdateInput) {
			const businessId = await repository.requireBusinessId();
			const timestamp = now();
			return repository.updateBusinessSettings(businessId, {
				...input,
				lastModified: timestamp,
			});
		},

		async resetMenu() {
			await repository.resetMenu();
		},
	};
}
