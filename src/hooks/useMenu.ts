import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

export function useMenuMutations() {
	const queryClient = useQueryClient();
	const client = getMenuApiClient();

	const invalidate = () =>
		queryClient.invalidateQueries({ queryKey: menuQueryKey });

	return {
		createProduct: useMutation({
			mutationFn: (input: ProductCreateInput) => client.createProduct(input),
			onSuccess: invalidate,
		}),
		updateProduct: useMutation({
			mutationFn: ({ id, input }: { id: string; input: ProductUpdateInput }) =>
				client.updateProduct(id, input),
			onSuccess: invalidate,
		}),
		deleteProduct: useMutation({
			mutationFn: (id: string) => client.deleteProduct(id),
			onSuccess: invalidate,
		}),
		duplicateProduct: useMutation({
			mutationFn: (id: string) => client.duplicateProduct(id),
			onSuccess: invalidate,
		}),
		reorderProducts: useMutation({
			mutationFn: (input: ProductReorderInput) => client.reorderProducts(input),
			onSuccess: invalidate,
		}),
		importProducts: useMutation({
			mutationFn: (items: ProductImportItem[]) => client.importProducts(items),
			onSuccess: invalidate,
		}),
		createCategory: useMutation({
			mutationFn: (input: CategoryCreateInput) => client.createCategory(input),
			onSuccess: invalidate,
		}),
		updateCategory: useMutation({
			mutationFn: ({ id, input }: { id: string; input: CategoryUpdateInput }) =>
				client.updateCategory(id, input),
			onSuccess: invalidate,
		}),
		deleteCategory: useMutation({
			mutationFn: (id: string) => client.deleteCategory(id),
			onSuccess: invalidate,
		}),
		reorderCategories: useMutation({
			mutationFn: (input: CategoryReorderInput) => client.reorderCategories(input),
			onSuccess: invalidate,
		}),
		resolveCategoryId: useMutation({
			mutationFn: (input: CategoryResolveInput) => client.resolveCategoryId(input),
			onSuccess: invalidate,
		}),
		createImage: useMutation({
			mutationFn: (input: ImageCreateInput) => client.createImage(input),
			onSuccess: invalidate,
		}),
		deleteImage: useMutation({
			mutationFn: (id: string) => client.deleteImage(id),
			onSuccess: invalidate,
		}),
		updateSettings: useMutation({
			mutationFn: (input: BusinessSettingsUpdateInput) =>
				client.updateSettings(input),
			onSuccess: invalidate,
		}),
		resetMenu: useMutation({
			mutationFn: () => client.resetMenu(),
			onSuccess: invalidate,
		}),
	};
}

export function useUploadImage() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (file: File) => uploadImage(file),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: menuQueryKey }),
	});
}

export function useUploadImages() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (files: File[]) => uploadImages(files),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: menuQueryKey }),
	});
}
