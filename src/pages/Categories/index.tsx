import { useCallback } from 'react';
import {
	PageError,
	PageLoading,
} from '../../components/layout/PageLoading.tsx';
import { useAutoSaveToast } from '../../hooks/useAutoSaveToast.ts';
import { useMenu, useMenuMutations } from '../../hooks/useMenu.ts';
import { CategoriesLayout } from '../../layouts/CategoriesLayout.tsx';

export default function CategoriesPage() {
	const { data: menu, isLoading, error } = useMenu();
	const mutations = useMenuMutations();
	const showToast = useAutoSaveToast();

	const handleAddCategory = useCallback(async () => {
		await mutations.createCategory.mutateAsync({ name: '' });
		showToast('Categoría creada');
	}, [mutations.createCategory, showToast]);

	const handleUpdateCategory = useCallback(
		async (id: string, data: { name?: string; visible?: boolean }) => {
			await mutations.updateCategory.mutateAsync({ id, input: data });
			showToast('Categoría guardada');
		},
		[mutations.updateCategory, showToast],
	);

	const handleDeleteCategory = useCallback(
		async (id: string) => {
			await mutations.deleteCategory.mutateAsync(id);
			showToast('Categoría eliminada');
		},
		[mutations.deleteCategory, showToast],
	);

	const handleReorderCategories = useCallback(
		async (orderedIds: string[]) => {
			await mutations.reorderCategories.mutateAsync({ orderedIds });
			showToast('Orden actualizado');
		},
		[mutations.reorderCategories, showToast],
	);

	if (isLoading) return <PageLoading />;
	if (error || !menu) return <PageError />;

	return (
		<CategoriesLayout
			categories={menu.categories}
			onAddCategory={handleAddCategory}
			onUpdateCategory={handleUpdateCategory}
			onDeleteCategory={handleDeleteCategory}
			onReorderCategories={handleReorderCategories}
			onNotify={showToast}
		/>
	);
}
