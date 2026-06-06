import { useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getMenuApiMode } from '../../api/getMenuApiClient.ts';
import {
	PageError,
	PageLoading,
} from '../../components/layout/PageLoading.tsx';
import { useAutoSaveToast } from '../../hooks/useAutoSaveToast.ts';
import { useMenu, useMenuMutations } from '../../hooks/useMenu.ts';
import { ProductsLayout } from '../../layouts/ProductsLayout.tsx';
import {
	exportToCsv,
	exportToExcel,
	guessColumnMappings,
	mapRowsToProducts,
	parseExcelFile,
} from '../../services/excelService.ts';
import { useMenuStore } from '../../store/menuStore.ts';
import type { Category, Product } from '../../types/index.ts';

const PENDING_CATEGORY_PREFIX = '__pending__:';

function resolveCategoryIdForImport(
	categories: Category[],
	name: string,
): string {
	if (!name.trim()) return categories[0]?.id ?? '';
	const existing = categories.find(
		(c) => c.name.toLowerCase() === name.toLowerCase(),
	);
	if (existing) return existing.id;
	if (getMenuApiMode() === 'local') {
		return useMenuStore.getState().addCategory(name.trim());
	}
	return `${PENDING_CATEGORY_PREFIX}${name.trim()}`;
}

export default function ProductsPage() {
	const { data: menu, isLoading, error } = useMenu();
	const mutations = useMenuMutations();
	const showToast = useAutoSaveToast();
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();

	const visibilityFilter =
		searchParams.get('filtro') === 'ocultos' ? 'hidden' : 'all';

	const handleExportExcel = useCallback(() => {
		if (!menu) return;
		exportToExcel(menu.products, menu.categories);
	}, [menu]);

	const handleExportCsv = useCallback(() => {
		if (!menu) return;
		exportToCsv(menu.products, menu.categories);
	}, [menu]);

	const handleDeleteProducts = useCallback(
		async (ids: string[]) => {
			await Promise.all(ids.map((id) => mutations.deleteProduct.mutateAsync(id)));
			showToast(`${ids.length} productos eliminados`);
		},
		[mutations.deleteProduct, showToast],
	);

	const handleImportProducts = useCallback(
		async (
			items: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'order'>[],
		) => {
			const resolved = await Promise.all(
				items.map(async (item) => {
					if (!item.categoryId.startsWith(PENDING_CATEGORY_PREFIX)) {
						return item;
					}
					const name = item.categoryId.slice(PENDING_CATEGORY_PREFIX.length);
					const { id } = await mutations.resolveCategoryId.mutateAsync({
						name,
					});
					return { ...item, categoryId: id };
				}),
			);
			const result = await mutations.importProducts.mutateAsync(resolved);
			showToast(`${result.importedCount} productos importados`);
		},
		[mutations.importProducts, mutations.resolveCategoryId, showToast],
	);

	if (isLoading) return <PageLoading />;
	if (error || !menu) return <PageError />;

	return (
		<ProductsLayout
			products={menu.products}
			categories={menu.categories}
			images={menu.images}
			visibilityFilter={visibilityFilter}
			onClearVisibilityFilter={() => navigate('/carta')}
			onAddProduct={async (data) => {
				await mutations.createProduct.mutateAsync(data);
				showToast('Producto creado');
			}}
			onUpdateProduct={async (id, data) => {
				await mutations.updateProduct.mutateAsync({ id, input: data });
				showToast('Producto guardado');
			}}
			onDuplicateProduct={async (id) => {
				await mutations.duplicateProduct.mutateAsync(id);
				showToast('Producto duplicado');
			}}
			onDeleteProduct={(id) => mutations.deleteProduct.mutate(id)}
			onDeleteProducts={handleDeleteProducts}
			onReorderProducts={async (categoryId, orderedIds) => {
				await mutations.reorderProducts.mutateAsync({
					categoryId,
					orderedIds,
				});
				showToast('Orden actualizado');
			}}
			onExportExcel={handleExportExcel}
			onExportCsv={handleExportCsv}
			onImportProducts={handleImportProducts}
			onResolveCategoryId={(name) =>
				resolveCategoryIdForImport(menu.categories, name)
			}
			parseExcelFile={parseExcelFile}
			guessColumnMappings={guessColumnMappings}
			mapRowsToProducts={mapRowsToProducts}
			onNotify={showToast}
		/>
	);
}
