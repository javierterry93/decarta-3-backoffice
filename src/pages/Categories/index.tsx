import { useCallback } from 'react';
import { useMenuStore } from '../../store/menuStore.ts';
import { useAutoSaveToast } from '../../hooks/useAutoSaveToast.ts';
import { CategoriesLayout } from '../../layouts/CategoriesLayout.tsx';
import { menuService } from '../../services/menuService.ts';

export default function CategoriesPage() {
	const categories = useMenuStore((s) => s.categories);
	const showToast = useAutoSaveToast();

	const handleAddCategory = useCallback(() => {
		menuService.addCategory('');
	}, []);

	const handleUpdateCategory = useCallback(
		(id: string, data: Parameters<typeof menuService.updateCategory>[1]) => {
			menuService.updateCategory(id, data);
		},
		[],
	);

	const handleDeleteCategory = useCallback((id: string) => {
		menuService.deleteCategory(id);
	}, []);

	const handleReorderCategories = useCallback((orderedIds: string[]) => {
		menuService.reorderCategories(orderedIds);
	}, []);

	return (
		<CategoriesLayout
			categories={categories}
			onAddCategory={handleAddCategory}
			onUpdateCategory={handleUpdateCategory}
			onDeleteCategory={handleDeleteCategory}
			onReorderCategories={handleReorderCategories}
			onNotify={showToast}
		/>
	);
}
