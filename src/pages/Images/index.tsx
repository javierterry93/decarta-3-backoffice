import { useCallback } from 'react';
import { useMenuStore } from '../../store/menuStore.ts';
import { useAutoSaveToast } from '../../hooks/useAutoSaveToast.ts';
import { ImagesLayout } from '../../layouts/ImagesLayout.tsx';
import { uploadImage } from '../../services/imageService.ts';
import { menuService } from '../../services/menuService.ts';

export default function ImagesPage() {
	const images = useMenuStore((s) => s.images);
	const products = useMenuStore((s) => s.products);
	const showToast = useAutoSaveToast();

	const handleUploadImage = useCallback((file: File) => uploadImage(file), []);

	const handleDeleteImage = useCallback((id: string) => {
		menuService.deleteImage(id);
	}, []);

	return (
		<ImagesLayout
			images={images}
			products={products}
			onUploadImage={handleUploadImage}
			onDeleteImage={handleDeleteImage}
			onNotify={showToast}
		/>
	);
}
