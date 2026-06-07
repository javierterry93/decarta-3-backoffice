import { Plus } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { CategoryList } from '../components/forms/CategoryList.tsx';
import { ConfirmDialog, Dialog } from '../components/dialogs/ConfirmDialog.tsx';
import { MobilePageLayout } from '../components/layout/MobilePageLayout.tsx';
import { Button } from '../components/ui/Button.tsx';
import {
	CategoryEditLayout,
	type CategoryEditDraft,
} from './CategoryEditLayout.tsx';
import { categoryToDraft, emptyCategoryDraft } from './categoryDraft.ts';
import type { Category, Product } from '../types/index.ts';

type CategoryEditor = { mode: 'create' } | { mode: 'edit'; id: string };

type CategoriesLayoutProps = {
	categories: Category[];
	products: Product[];
	onAddCategory: (data: CategoryEditDraft) => void;
	onUpdateCategory: (id: string, data: CategoryEditDraft) => void;
	onDeleteCategory: (id: string) => void;
	onReorderCategories: (orderedIds: string[]) => void;
	onNotify: (message: string) => void;
};

export function CategoriesLayout({
	categories,
	products,
	onAddCategory,
	onUpdateCategory,
	onDeleteCategory,
	onReorderCategories,
	onNotify,
}: CategoriesLayoutProps) {
	const [editor, setEditor] = useState<CategoryEditor | null>(null);
	const [deleteId, setDeleteId] = useState<string | null>(null);

	const productCountByCategory = useMemo(() => {
		const counts: Record<string, number> = {};
		for (const product of products) {
			counts[product.categoryId] = (counts[product.categoryId] ?? 0) + 1;
		}
		return counts;
	}, [products]);

	const editingCategory = useMemo(() => {
		if (editor?.mode !== 'edit') return null;
		return categories.find((category) => category.id === editor.id) ?? null;
	}, [categories, editor]);

	const editorDraft = useMemo(() => {
		if (editor?.mode === 'create') return emptyCategoryDraft();
		if (editingCategory) return categoryToDraft(editingCategory);
		return null;
	}, [editor, editingCategory]);

	const handleReorder = useCallback(
		(orderedIds: string[]) => {
			onReorderCategories(orderedIds);
			onNotify('Orden actualizado');
		},
		[onReorderCategories, onNotify],
	);

	const handleSave = useCallback(
		(data: CategoryEditDraft) => {
			if (editor?.mode === 'create') {
				onAddCategory(data);
			} else if (editor?.mode === 'edit') {
				onUpdateCategory(editor.id, data);
			}
			setEditor(null);
		},
		[editor, onAddCategory, onUpdateCategory],
	);

	const deleteCategory = categories.find((category) => category.id === deleteId);
	const deleteProductCount = deleteId
		? (productCountByCategory[deleteId] ?? 0)
		: 0;

	return (
		<MobilePageLayout>
			<div className="space-y-3 lg:flex lg:items-start lg:justify-between lg:gap-4">
				<div className="hidden lg:block">
					<h1 className="text-2xl font-bold text-foreground">Categorías</h1>
					<p className="mt-1 text-sm text-foreground-muted">
						Orden de la carta · Arrastra para reordenar
					</p>
				</div>
				<p className="text-sm text-foreground-muted lg:hidden">
					Toca una categoría para editarla · Mantén pulsado ≡ para ordenar
				</p>

				<div className="hidden flex-wrap justify-end gap-2 lg:flex">
					<Button onClick={() => setEditor({ mode: 'create' })}>
						<Plus className="h-4 w-4" />
						Nueva categoría
					</Button>
				</div>
			</div>

			<CategoryList
				categories={categories}
				productCountByCategory={productCountByCategory}
				onReorder={handleReorder}
				onEdit={(id) => setEditor({ mode: 'edit', id })}
				onDelete={setDeleteId}
			/>

			<Button
				size="icon"
				className="fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom))] right-3 z-30 h-14 w-14 rounded-full shadow-lg lg:hidden"
				onClick={() => setEditor({ mode: 'create' })}
				aria-label="Nueva categoría">
				<Plus className="h-6 w-6" />
			</Button>

			<Dialog
				open={editor !== null && editorDraft !== null}
				onClose={() => setEditor(null)}
				title={editor?.mode === 'create' ? 'Nueva categoría' : 'Editar categoría'}>
				{editorDraft && (
					<CategoryEditLayout
						key={
							editor?.mode === 'create'
								? 'create'
								: `edit-${editor?.mode === 'edit' ? editor.id : ''}`
						}
						initialDraft={editorDraft}
						productCount={
							editor?.mode === 'edit' ? (productCountByCategory[editor.id] ?? 0) : 0
						}
						submitLabel={editor?.mode === 'create' ? 'Crear categoría' : 'Guardar'}
						onSave={handleSave}
						onCancel={() => setEditor(null)}
						onDelete={
							editor?.mode === 'edit'
								? () => {
										setDeleteId(editor.id);
										setEditor(null);
									}
								: undefined
						}
					/>
				)}
			</Dialog>

			<ConfirmDialog
				open={deleteId !== null}
				title="Eliminar categoría"
				description={
					deleteProductCount > 0
						? `¿Seguro? «${deleteCategory?.name || 'Sin nombre'}» tiene ${deleteProductCount} producto${deleteProductCount !== 1 ? 's' : ''}. Pasarán a otra categoría.`
						: `¿Seguro que quieres eliminar «${deleteCategory?.name || 'Sin nombre'}»?`
				}
				onConfirm={() => {
					if (deleteId) {
						onDeleteCategory(deleteId);
						onNotify('Categoría eliminada');
					}
					setDeleteId(null);
				}}
				onCancel={() => setDeleteId(null)}
			/>
		</MobilePageLayout>
	);
}
