import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { CategorySorter } from '../../components/forms/CategorySorter.tsx';
import { ConfirmDialog } from '../../components/dialogs/ConfirmDialog.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { useAutoSaveToast } from '../../hooks/useAutoSaveToast.ts';
import { useMenuStore } from '../../store/menuStore.ts';

export default function CategoriesPage() {
	const categories = useMenuStore((s) => s.categories);
	const addCategory = useMenuStore((s) => s.addCategory);
	const updateCategory = useMenuStore((s) => s.updateCategory);
	const deleteCategory = useMenuStore((s) => s.deleteCategory);
	const reorderCategories = useMenuStore((s) => s.reorderCategories);
	const showToast = useAutoSaveToast();

	const [deleteId, setDeleteId] = useState<string | null>(null);

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold text-foreground">
						Categorías
					</h1>
					<p className="mt-1 text-sm text-foreground-muted">
						Arrastra las filas para cambiar el orden
					</p>
				</div>
				<Button
					onClick={() => {
						addCategory('');
						showToast('Nueva categoría añadida');
					}}
				>
					<Plus className="h-4 w-4" />
					Nueva categoría
				</Button>
			</div>

			<CategorySorter
				categories={categories}
				onReorder={reorderCategories}
				onUpdate={updateCategory}
				onSave={showToast}
			/>

			{categories.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{categories.map((cat) => (
						<Button
							key={cat.id}
							variant="ghost"
							size="sm"
							onClick={() => setDeleteId(cat.id)}
							className="text-accent-orange"
						>
							<Trash2 className="h-3 w-3" />
							Eliminar {cat.name || 'sin nombre'}
						</Button>
					))}
				</div>
			)}

			<ConfirmDialog
				open={deleteId !== null}
				title="Eliminar categoría"
				description="¿Seguro? Los productos pasarán a otra categoría."
				onConfirm={() => {
					if (deleteId) {
						deleteCategory(deleteId);
						showToast('Categoría eliminada');
					}
					setDeleteId(null);
				}}
				onCancel={() => setDeleteId(null)}
			/>
		</div>
	);
}
