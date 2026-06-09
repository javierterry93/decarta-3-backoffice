import { useCallback } from 'react';
import {
	PageError,
	PageLoading,
} from '../../components/layout/PageLoading.tsx';
import { toast } from 'sonner';
import {
	useSnapshot,
	useSnapshotMutations,
	useUploadImages,
} from '../../hooks/useSnapshot.ts';
import { ImagesLayout } from '../../layouts/ImagesLayout.tsx';

export default function ImagesPage() {
	const { data: snapshot, isLoading, error } = useSnapshot();
	const mutations = useSnapshotMutations();
	const uploadImagesMutation = useUploadImages();
	const showToast = useCallback(
		(message: string) => toast.success(message, { duration: 3000 }),
		[],
	);

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
	if (error || !snapshot) return <PageError />;

	return (
		<ImagesLayout
			images={snapshot.images}
			products={snapshot.products}
			onUploadImages={handleUploadImages}
			onDeleteImage={handleDeleteImage}
			onNotify={showToast}
		/>
	);
}
