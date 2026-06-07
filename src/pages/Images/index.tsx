import { useCallback } from 'react';
import {
	PageError,
	PageLoading,
} from '../../components/layout/PageLoading.tsx';
import { useAutoSaveToast } from '../../hooks/useAutoSaveToast.ts';
import {
	useMenu,
	useMenuMutations,
	useUploadImages,
} from '../../hooks/useMenu.ts';
import { ImagesLayout } from '../../layouts/ImagesLayout.tsx';

export default function ImagesPage() {
	const { data: menu, isLoading, error } = useMenu();
	const mutations = useMenuMutations();
	const uploadImagesMutation = useUploadImages();
	const showToast = useAutoSaveToast();

	const handleUploadImages = useCallback(
		async (files: File[]) => {
			await uploadImagesMutation.mutateAsync(files);
		},
		[uploadImagesMutation],
	);

	const handleDeleteImage = useCallback(
		async (id: string) => {
			await mutations.deleteImage.mutateAsync(id);
			showToast('Imagen eliminada');
		},
		[mutations.deleteImage, showToast],
	);

	if (isLoading) return <PageLoading />;
	if (error || !menu) return <PageError />;

	return (
		<ImagesLayout
			images={menu.images}
			products={menu.products}
			onUploadImages={handleUploadImages}
			onDeleteImage={handleDeleteImage}
			onNotify={showToast}
		/>
	);
}
