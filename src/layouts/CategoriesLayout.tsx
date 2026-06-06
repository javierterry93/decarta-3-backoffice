import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { CategorySorter } from '../components/forms/CategorySorter.tsx';
import { ConfirmDialog } from '../components/dialogs/ConfirmDialog.tsx';
import { MobilePageLayout } from '../components/layout/MobilePageLayout.tsx';
import { Button } from '../components/ui/Button.tsx';
import type { Category } from '../types/index.ts';

type CategoriesLayoutProps = {
	categories: Category[];
	onAddCategory: () => void;
	onUpdateCategory: (id: string, data: Partial<Category>) => void;
	onDeleteCategory: (id: string) => void;
	onReorderCategories: (orderedIds: string[]) => void;
	onNotify: (message: string) => void;
};

export function CategoriesLayout({
	categories,
	onAddCategory,
	onUpdateCategory,
	onDeleteCategory,
	onReorderCategories,
	onNotify,
}: CategoriesLayoutProps) {
	const [localCategories, setLocalCategories] = useState(categories);
	const [prevCategories, setPrevCategories] = useState(categories);
	const [deleteId, setDeleteId] = useState<string | null>(null);

	if (categories !== prevCategories) {
		setPrevCategories(categories);
		setLocalCategories(categories);
	}

	const handleUpdate = (id: string, data: Partial<Category>) => {
		setLocalCategories((prev) =>
			prev.map((c) => (c.id === id ? { ...c, ...data } : c)),
		);
	};

	const handlePersist = (id: string) => {
		const category = localCategories.find((c) => c.id === id);
		if (category) onUpdateCategory(id, category);
	};

	const handleReorder = (orderedIds: string[]) => {
		setLocalCategories((prev) =>
			[...prev]
				.map((c) => {
					const index = orderedIds.indexOf(c.id);
					return index >= 0 ? { ...c, order: index + 1 } : c;
				})
				.sort((a, b) => a.order - b.order),
		);
		onReorderCategories(orderedIds);
	};

	const handleToggleVisible = (id: string, visible: boolean) => {
		handleUpdate(id, { visible });
		onUpdateCategory(id, { visible });
		onNotify(visible ? 'Categoría visible' : 'Categoría oculta');
	};

	return (
		<MobilePageLayout>
			<div className="space-y-3 lg:flex lg:items-center lg:justify-between lg:gap-4">
				<div className="hidden lg:block">
					<h1 className="text-2xl font-bold text-foreground">Categorías</h1>
					<p className="mt-1 text-sm text-foreground-muted">
						Arrastra para cambiar el orden
					</p>
				</div>
				<p className="text-sm text-foreground-muted lg:hidden">
					Mantén pulsado ≡ para reordenar
				</p>
				<Button
					className="w-full lg:w-auto"
					onClick={() => {
						onAddCategory();
						onNotify('Nueva categoría añadida');
					}}
				>
					<Plus className="h-4 w-4" />
					Nueva categoría
				</Button>
			</div>

			<CategorySorter
				categories={localCategories}
				onReorder={handleReorder}
				onUpdate={handleUpdate}
				onPersist={handlePersist}
				onToggleVisible={handleToggleVisible}
				onDelete={setDeleteId}
				onNotify={onNotify}
			/>

			{localCategories.length > 0 && (
				<div className="hidden flex-wrap gap-2 lg:flex">
					{localCategories.map((cat) => (
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
