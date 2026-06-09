import type {
	CategoryRepository,
	ProductRepository,
} from '../../database/index.ts';
import { generateId } from '../../utils/format.ts';
import type { ApiClient } from '../ApiClient.ts';
import type {
	ProductBulkDeleteInput,
	ProductCreateInput,
	ProductImportItem,
	ProductReorderInput,
	ProductUpdateInput,
} from '../types.ts';

export type ProductApi = Pick<
	ApiClient,
	| 'createProduct'
	| 'updateProduct'
	| 'deleteProduct'
	| 'deleteProducts'
	| 'duplicateProduct'
	| 'reorderProducts'
	| 'importProducts'
>;

function nextOrderInCategory(
	products: { categoryId: string; order: number }[],
	categoryId: string,
): number {
	return (
		Math.max(
			0,
			...products.filter((p) => p.categoryId === categoryId).map((p) => p.order),
		) + 1
	);
}

export function createProductApi(
	repository: ProductRepository & CategoryRepository,
): ProductApi {
	return {
		async createProduct(input: ProductCreateInput) {
			const categoryId =
				input.categoryId ?? (await repository.listCategories())[0]?.id ?? '';
			const products = await repository.listProducts();
			const id = generateId();

			await repository.insertProduct({
				id,
				name: input.name ?? '',
				categoryId,
				order: nextOrderInCategory(products, categoryId),
				price: input.price ?? 0,
				shortDescription: input.shortDescription ?? '',
				visible: input.visible ?? true,
				imageId: input.imageId ?? null,
			});
			return { id };
		},

		async updateProduct(id: string, input: ProductUpdateInput) {
			const current = await repository.getProduct(id);
			let nextOrder = input.order ?? current.order;

			if (input.categoryId && input.categoryId !== current.categoryId) {
				const products = (await repository.listProducts()).filter(
					(p) => p.id !== id,
				);
				nextOrder = nextOrderInCategory(products, input.categoryId);
			}

			return repository.updateProduct(id, {
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
			});
		},

		async deleteProduct(id: string) {
			await repository.deleteProducts([id]);
		},

		async deleteProducts({ ids }: ProductBulkDeleteInput) {
			await repository.deleteProducts(ids);
		},

		async duplicateProduct(id: string) {
			const products = await repository.listProducts();
			const source = products.find((p) => p.id === id);
			if (!source) throw new Error(`Producto no encontrado: ${id}`);
			const newId = generateId();

			await repository.insertProduct({
				id: newId,
				name: `${source.name} (copia)`,
				categoryId: source.categoryId,
				order: nextOrderInCategory(products, source.categoryId),
				price: source.price,
				shortDescription: source.shortDescription,
				visible: source.visible,
				imageId: source.imageId,
			});
			return { id: newId };
		},

		async reorderProducts({ categoryId, orderedIds }: ProductReorderInput) {
			await repository.reorderProducts(categoryId, orderedIds);
		},

		async importProducts(items: ProductImportItem[]) {
			const runningProducts: { categoryId: string; order: number }[] =
				await repository.listProducts();
			const products = items.map((item) => {
				const order = nextOrderInCategory(runningProducts, item.categoryId);
				const product = {
					...item,
					id: generateId(),
					order,
				};
				runningProducts.push(product);
				return product;
			});

			await repository.importProducts(products);
			return { importedCount: items.length };
		},
	};
}
