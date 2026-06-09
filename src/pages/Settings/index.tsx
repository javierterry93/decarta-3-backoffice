import { useCallback } from 'react';
import { useSupabaseAuth } from '../../auth/SupabaseAuthGate.tsx';
import {
	PageError,
	PageLoading,
} from '../../components/layout/PageLoading.tsx';
import { toast } from 'sonner';
import {
	useSnapshot,
	useSnapshotMutations,
	useUploadImage,
} from '../../hooks/useSnapshot.ts';
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
	const { data: snapshot, isLoading, error } = useSnapshot();
	const mutations = useSnapshotMutations();
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
		if (!snapshot) return;
		exportToExcel(snapshot.products, snapshot.categories);
	}, [snapshot]);

	const handleExportCsv = useCallback(() => {
		if (!snapshot) return;
		exportToCsv(snapshot.products, snapshot.categories);
	}, [snapshot]);

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

	const handleResetSnapshot = useCallback(async () => {
		await mutations.resetSnapshot.mutateAsync();
	}, [mutations.resetSnapshot]);

	if (isLoading) return <PageLoading />;
	if (error || !snapshot) return <PageError />;

	return (
		<SettingsLayout
			settings={snapshot.settings}
			categories={snapshot.categories}
			images={snapshot.images}
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
			onResetSnapshot={handleResetSnapshot}
			onNotify={showToast}
			onSignOut={supabaseAuth?.signOut}
			sessionExpiresAt={supabaseAuth?.expiresAt}
		/>
	);
}
