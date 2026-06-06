import { useCallback } from 'react';
import { useMenuStore } from '../../store/menuStore.ts';
import { useAutoSaveToast } from '../../hooks/useAutoSaveToast.ts';
import { SettingsLayout } from '../../layouts/SettingsLayout.tsx';
import { uploadImage } from '../../services/imageService.ts';
import { menuService } from '../../services/menuService.ts';

export default function SettingsPage() {
	const settings = useMenuStore((s) => s.settings);
	const showToast = useAutoSaveToast();

	const handleSaveSettings = useCallback(
		(data: Parameters<typeof menuService.updateSettings>[0]) => {
			menuService.updateSettings(data);
		},
		[],
	);

	const handleUploadImage = useCallback((file: File) => uploadImage(file), []);

	const handleSetLogo = useCallback((imageId: string) => {
		const img = menuService.getImageById(imageId);
		if (img) menuService.updateSettings({ logoUrl: img.url });
	}, []);

	const handleRemoveLogo = useCallback(() => {
		menuService.updateSettings({ logoUrl: null });
	}, []);

	return (
		<SettingsLayout
			settings={settings}
			onSaveSettings={handleSaveSettings}
			onUploadImage={handleUploadImage}
			onSetLogo={handleSetLogo}
			onRemoveLogo={handleRemoveLogo}
			onNotify={showToast}
		/>
	);
}
