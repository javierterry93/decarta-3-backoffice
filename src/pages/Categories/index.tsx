import { useCallback } from 'react';
import {
	PageError,
	PageLoading,
} from '../../components/layout/PageLoading.tsx';
import { toast } from 'sonner';
import { useMenu, useMenuMutations } from '../../hooks/useMenu.ts';
import type { CategoryEditDraft } from '../../layouts/CategoryEditLayout.tsx';
import { CategoriesLayout } from '../../layouts/CategoriesLayout.tsx';

export default function CategoriesPage() {
	const { data: menu, isLoading, error } = useMenu();
	const mutations = useMenuMutations();
	const showToast = useCallback(
		(message: string) => toast.success(message, { duration: 3000 }),
		[],
	);

	const handleAddCategory = useCallback(
		async (data: CategoryEditDraft) => {
			const { id } = await mutations.createCategory.mutateAsync({
				name: data.name,
			});
			if (!data.visible) {
				await mutations.updateCategory.mutateAsync({
					id,
					input: { visible: false },
				});
			}
			showToast('Categoría creada');
		},
		[mutations.createCategory, mutations.updateCategory, showToast],
	);

	const handleUpdateCategory = useCallback(
		async (id: string, data: CategoryEditDraft) => {
			await mutations.updateCategory.mutateAsync({
				id,
				input: { name: data.name, visible: data.visible },
			});
			showToast('Categoría guardada');
		},
		[mutations.updateCategory, showToast],
	);

	const handleDeleteCategory = useCallback(
		(id: string) => mutations.deleteCategory.mutate(id),
		[mutations.deleteCategory],
	);

	const handleReorderCategories = useCallback(
		(orderedIds: string[]) => {
			mutations.reorderCategories.mutate({ orderedIds });
		},
		[mutations.reorderCategories],
	);

	if (isLoading) return <PageLoading />;
	if (error || !menu) return <PageError />;

	return (
		<CategoriesLayout
			categories={menu.categories}
			products={menu.products}
			onAddCategory={handleAddCategory}
			onUpdateCategory={handleUpdateCategory}
			onDeleteCategory={handleDeleteCategory}
			onReorderCategories={handleReorderCategories}
			onNotify={showToast}
		/>
	);
}
