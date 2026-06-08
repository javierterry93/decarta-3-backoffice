import { useCallback } from 'react';
import { useSupabaseAuth } from '../../auth/SupabaseAuthGate.tsx';
import {
	PageError,
	PageLoading,
} from '../../components/layout/PageLoading.tsx';
import { toast } from 'sonner';
import {
	useMenu,
	useMenuMutations,
	useUploadImage,
} from '../../hooks/useMenu.ts';
import { SettingsLayout } from '../../layouts/SettingsLayout.tsx';
import {
	exportToCsv,
	exportToExcel,
	guessColumnMappings,
	mapRowsToProducts,
	parseExcelFile,
} from '../../services/excelService.ts';
import { resolveImportedProductCategories } from '../../utils/categoryImport.ts';
import type { Product } from '../../types/index.ts';

export default function SettingsPage() {
	const { data: menu, isLoading, error } = useMenu();
	const mutations = useMenuMutations();
	const uploadImageMutation = useUploadImage();
	const showToast = useCallback(
		(message: string) => toast.success(message, { duration: 3000 }),
		[],
	);
	const supabaseAuth = useSupabaseAuth();

	const handleSaveSettings = useCallback(
		async (data: Parameters<typeof mutations.updateSettings.mutateAsync>[0]) => {
			await mutations.updateSettings.mutateAsync(data);
			showToast('Configuración guardada');
		},
		[mutations.updateSettings, showToast],
	);

	const handleUploadImage = useCallback(
		(file: File) => uploadImageMutation.mutateAsync(file),
		[uploadImageMutation],
	);

	const handleSetLogo = useCallback(
		async (imageId: string) => {
			await mutations.updateSettings.mutateAsync({ logoImageId: imageId });
			showToast('Logo actualizado');
		},
		[mutations.updateSettings, showToast],
	);

	const handleRemoveLogo = useCallback(async () => {
		await mutations.updateSettings.mutateAsync({ logoImageId: null });
		showToast('Logo eliminado');
	}, [mutations.updateSettings, showToast]);

	const handleExportExcel = useCallback(() => {
		if (!menu) return;
		exportToExcel(menu.products, menu.categories);
	}, [menu]);

	const handleExportCsv = useCallback(() => {
		if (!menu) return;
		exportToCsv(menu.products, menu.categories);
	}, [menu]);

	const handleImportProducts = useCallback(
		async (
			items: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'order'>[],
		) => {
			const resolved = await resolveImportedProductCategories(items, (name) =>
				mutations.resolveCategoryId.mutateAsync({ name }),
			);
			const result = await mutations.importProducts.mutateAsync(resolved);
			showToast(`${result.importedCount} productos importados`);
		},
		[mutations.importProducts, mutations.resolveCategoryId, showToast],
	);

	const handleResetMenu = useCallback(async () => {
		await mutations.resetMenu.mutateAsync();
	}, [mutations.resetMenu]);

	if (isLoading) return <PageLoading />;
	if (error || !menu) return <PageError />;

	return (
		<SettingsLayout
			settings={menu.settings}
			categories={menu.categories}
			images={menu.images}
			onSaveSettings={handleSaveSettings}
			onUploadImage={handleUploadImage}
			onSetLogo={handleSetLogo}
			onRemoveLogo={handleRemoveLogo}
			onExportExcel={handleExportExcel}
			onExportCsv={handleExportCsv}
			onImportProducts={handleImportProducts}
			parseExcelFile={parseExcelFile}
			guessColumnMappings={guessColumnMappings}
			mapRowsToProducts={mapRowsToProducts}
			onResetMenu={handleResetMenu}
			onNotify={showToast}
			onSignOut={supabaseAuth?.signOut}
			sessionExpiresAt={supabaseAuth?.expiresAt}
		/>
	);
}
