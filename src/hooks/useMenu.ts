import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getMenuApiClient } from '../api/getMenuApiClient.ts';
import { menuQueryKey } from '../api/menuQueryKey.ts';
import { uploadImage, uploadImages } from '../services/imageService.ts';
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
} from '../api/types.ts';

export function useMenu() {
	return useQuery({
		queryKey: menuQueryKey,
		queryFn: () => getMenuApiClient().getMenu(),
	});
}

function showMutationError(error: Error) {
	toast.error(error.message || 'No se pudo guardar los cambios');
}

export function useMenuMutations() {
	const queryClient = useQueryClient();
	const client = getMenuApiClient();

	const invalidate = () =>
		queryClient.invalidateQueries({ queryKey: menuQueryKey });
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
		reorderProducts: useMutation({
			mutationFn: (input: ProductReorderInput) => client.reorderProducts(input),
			onSuccess: invalidate,
			onError,
		}),
		importProducts: useMutation({
			mutationFn: (items: ProductImportItem[]) => client.importProducts(items),
			onSuccess: invalidate,
			onError,
		}),
		createCategory: useMutation({
			mutationFn: (input: CategoryCreateInput) => client.createCategory(input),
			onSuccess: invalidate,
			onError,
		}),
		updateCategory: useMutation({
			mutationFn: ({ id, input }: { id: string; input: CategoryUpdateInput }) =>
				client.updateCategory(id, input),
			onSuccess: invalidate,
			onError,
		}),
		deleteCategory: useMutation({
			mutationFn: (id: string) => client.deleteCategory(id),
			onSuccess: invalidate,
			onError,
		}),
		reorderCategories: useMutation({
			mutationFn: (input: CategoryReorderInput) => client.reorderCategories(input),
			onSuccess: invalidate,
			onError,
		}),
		resolveCategoryId: useMutation({
			mutationFn: (input: CategoryResolveInput) => client.resolveCategoryId(input),
			onSuccess: invalidate,
			onError,
		}),
		createImage: useMutation({
			mutationFn: (input: ImageCreateInput) => client.createImage(input),
			onSuccess: invalidate,
			onError,
		}),
		deleteImage: useMutation({
			mutationFn: (id: string) => client.deleteImage(id),
			onSuccess: invalidate,
			onError,
		}),
		updateSettings: useMutation({
			mutationFn: (input: BusinessSettingsUpdateInput) =>
				client.updateSettings(input),
			onSuccess: invalidate,
			onError,
		}),
		resetMenu: useMutation({
			mutationFn: () => client.resetMenu(),
			onSuccess: invalidate,
			onError,
		}),
	};
}

export function useUploadImage() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (file: File) => uploadImage(file),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: menuQueryKey }),
		onError: showMutationError,
	});
}

export function useUploadImages() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (files: File[]) => uploadImages(files),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: menuQueryKey }),
		onError: showMutationError,
	});
}
