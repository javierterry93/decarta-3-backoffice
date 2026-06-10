import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
	categoriesQueryKey,
	getApiClient,
	imagesQueryKey,
	productsQueryKey,
	snapshotQueryKey,
} from '../api/index.ts';
import type {
	ProductBulkDeleteInput,
	ProductCreateInput,
	ProductReorderInput,
	ProductUpdateInput,
} from '../api/types.ts';
import type { Product } from '../types/index.ts';
import { subscribeCategoriesChanged } from '../sync/categoriesSync.ts';

/**
 * Datos de la página de productos con consultas por entidad
 * (products, categories, images), sin tocar la tabla businesses.
 */
export function useProductsPageData() {
	const client = getApiClient();
	const queryClient = useQueryClient();

	useEffect(() => {
		return subscribeCategoriesChanged(() => {
			void queryClient.invalidateQueries({ queryKey: categoriesQueryKey });
		});
	}, [queryClient]);

	const products = useQuery({
		queryKey: productsQueryKey,
		queryFn: () => client.listProducts(),
	});
	const categories = useQuery({
		queryKey: categoriesQueryKey,
		queryFn: () => client.listCategories(),
	});
	const images = useQuery({
		queryKey: imagesQueryKey,
		queryFn: () => client.listImages(),
	});

	return {
		products: products.data,
		categories: categories.data,
		images: images.data,
		isLoading: products.isLoading || categories.isLoading || images.isLoading,
		error: products.error ?? categories.error ?? images.error ?? null,
	};
}

function showMutationError(error: Error) {
	toast.error(error.message || 'No se pudo guardar los cambios');
}

export function useProductMutations() {
	const queryClient = useQueryClient();
	const client = getApiClient();

	// El snapshot también se invalida porque otras páginas (dashboard) lo usan.
	const invalidate = () =>
		Promise.all([
			queryClient.invalidateQueries({ queryKey: productsQueryKey }),
			queryClient.invalidateQueries({ queryKey: snapshotQueryKey }),
		]);
	const onError = showMutationError;

	return {
		createProduct: useMutation({
			mutationFn: (input: ProductCreateInput) => client.createProduct(input),
			onSuccess: invalidate,
			onError,
		}),
		updateProduct: useMutation({
			mutationFn: ({ id, input }: { id: string; input: ProductUpdateInput }) =>
				client.updateProduct(id, input),
			onSuccess: invalidate,
			onError,
		}),
		deleteProduct: useMutation({
			mutationFn: (id: string) => client.deleteProduct(id),
			onSuccess: invalidate,
			onError,
		}),
		deleteProducts: useMutation({
			mutationFn: (input: ProductBulkDeleteInput) => client.deleteProducts(input),
			onSuccess: invalidate,
			onError,
		}),
		duplicateProduct: useMutation({
			mutationFn: (id: string) => client.duplicateProduct(id),
			onSuccess: invalidate,
			onError,
		}),
		// Reordenar es optimista: se actualiza la caché al instante y no se
		// vuelve a pedir la lista de productos; solo se marca el snapshot.
		reorderProducts: useMutation({
			mutationFn: (input: ProductReorderInput) => client.reorderProducts(input),
			onMutate: async ({ categoryId, orderedIds }: ProductReorderInput) => {
				await queryClient.cancelQueries({ queryKey: productsQueryKey });
				const previous = queryClient.getQueryData<Product[]>(productsQueryKey);

				queryClient.setQueryData<Product[]>(productsQueryKey, (products) =>
					products?.map((product) => {
						if (product.categoryId !== categoryId) return product;
						const index = orderedIds.indexOf(product.id);
						return index === -1 ? product : { ...product, order: index };
					}),
				);

				return { previous };
			},
			onError: (error, _input, context) => {
				if (context?.previous) {
					queryClient.setQueryData(productsQueryKey, context.previous);
				}
				showMutationError(error);
			},
			onSuccess: () =>
				queryClient.invalidateQueries({ queryKey: snapshotQueryKey }),
		}),
	};
}
