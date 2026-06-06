import { useCallback } from 'react';
import {
	PageError,
	PageLoading,
} from '../../components/layout/PageLoading.tsx';
import { useAutoSaveToast } from '../../hooks/useAutoSaveToast.ts';
import {
	useMenu,
	useMenuMutations,
	useUploadImage,
} from '../../hooks/useMenu.ts';
import { ImagesLayout } from '../../layouts/ImagesLayout.tsx';

export default function ImagesPage() {
	const { data: menu, isLoading, error } = useMenu();
	const mutations = useMenuMutations();
	const uploadImageMutation = useUploadImage();
	const showToast = useAutoSaveToast();

	const handleUploadImage = useCallback(
		(file: File) => uploadImageMutation.mutateAsync(file),
		[uploadImageMutation],
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
			onUploadImage={handleUploadImage}
			onDeleteImage={handleDeleteImage}
			onNotify={showToast}
		/>
	);
}
