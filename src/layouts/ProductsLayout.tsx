import { Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ProductCategoryList } from '../components/forms/ProductCategoryList.tsx';
import { ConfirmDialog, Dialog } from '../components/dialogs/ConfirmDialog.tsx';
import { Button } from '../components/ui/Button.tsx';
import {
	ProductEditLayout,
	type ProductEditDraft,
} from './ProductEditLayout.tsx';
import { emptyProductDraft, productToDraft } from './productDraft.ts';
import type { Category, MenuImage, Product } from '../types/index.ts';
import { MobilePageLayout } from '../components/layout/MobilePageLayout.tsx';
import { cn } from '../utils/cn.ts';

type ProductEditor = { mode: 'create' } | { mode: 'edit'; id: string };

type ProductVisibilityFilter = 'all' | 'hidden';

type ProductsLayoutProps = {
	products: Product[];
	categories: Category[];
	images: MenuImage[];
	imageMap: Record<string, string>;
	visibilityFilter?: ProductVisibilityFilter;
	onClearVisibilityFilter?: () => void;
	editProductId?: string | null;
	onCloseEditor?: () => void;
	onAddProduct: (data: ProductEditDraft) => void;
	onUpdateProduct: (id: string, data: Partial<Product>) => void;
	onDuplicateProduct: (id: string) => void;
	onDeleteProduct: (id: string) => void;
	onDeleteProducts: (ids: string[]) => void;
	onReorderProducts: (categoryId: string, orderedIds: string[]) => void;
	onNotify: (message: string) => void;
};

export function ProductsLayout({
	products,
	categories,
	images,
	imageMap,
	visibilityFilter = 'all',
	onClearVisibilityFilter,
	editProductId,
	onCloseEditor,
	onAddProduct,
	onUpdateProduct,
	onDuplicateProduct,
	onDeleteProduct,
	onDeleteProducts,
	onReorderProducts,
	onNotify,
}: ProductsLayoutProps) {
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [editor, setEditor] = useState<ProductEditor | null>(null);
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
	const consumedEditProductIdRef = useRef<string | null>(null);
	const isHiddenFilter = visibilityFilter === 'hidden';

	const filteredProducts = useMemo(
		() =>
			isHiddenFilter ? products.filter((product) => !product.visible) : products,
		[products, isHiddenFilter],
	);

	const editingProduct = useMemo(() => {
		if (editor?.mode !== 'edit') return null;
		return products.find((p) => p.id === editor.id) ?? null;
	}, [products, editor]);

	const editorDraft = useMemo(() => {
		if (editor?.mode === 'create') return emptyProductDraft(categories);
		if (editingProduct) return productToDraft(editingProduct);
		return null;
	}, [editor, categories, editingProduct]);

	const closeEditor = useCallback(() => {
		setEditor(null);
		onCloseEditor?.();
	}, [onCloseEditor]);

	useEffect(() => {
		if (!editProductId) {
			consumedEditProductIdRef.current = null;
			return;
		}
		if (consumedEditProductIdRef.current === editProductId) return;

		const product = products.find((item) => item.id === editProductId);
		if (!product) return;

		consumedEditProductIdRef.current = editProductId;
		setEditor({ mode: 'edit', id: editProductId });
		onCloseEditor?.();
	}, [editProductId, products, onCloseEditor]);

	const handleReorder = useCallback(
		(categoryId: string, orderedIds: string[]) => {
			onReorderProducts(categoryId, orderedIds);
			onNotify('Orden actualizado');
		},
		[onReorderProducts, onNotify],
	);

	const handleSave = useCallback(
		(data: ProductEditDraft) => {
			if (editor?.mode === 'create') {
				onAddProduct(data);
			} else if (editor?.mode === 'edit') {
				onUpdateProduct(editor.id, data);
			}
			closeEditor();
		},
		[editor, onAddProduct, onUpdateProduct, closeEditor],
	);

	const handleBulkDelete = useCallback(() => {
		onDeleteProducts([...selectedIds]);
		onNotify(`${selectedIds.size} productos eliminados`);
		setSelectedIds(new Set());
		setBulkDeleteOpen(false);
	}, [selectedIds, onDeleteProducts, onNotify]);

	return (
		<MobilePageLayout>
			<div className="space-y-3 lg:flex lg:items-start lg:justify-between lg:gap-4">
				<div className="hidden lg:block">
					<h1 className="text-2xl font-bold text-foreground">
						{isHiddenFilter ? 'Productos ocultos' : 'Carta'}
					</h1>
					<p className="mt-1 text-sm text-foreground-muted">
						{isHiddenFilter
							? 'Productos no visibles en la carta'
							: 'Productos por categoría · Arrastra para ordenar'}
					</p>
				</div>
				<p className="text-sm text-foreground-muted lg:hidden">
					{isHiddenFilter
						? 'Productos no visibles en la carta'
						: 'Toca un producto para editarlo · Mantén pulsado ≡ para ordenar'}
				</p>

				<div className="hidden flex-wrap justify-end gap-2 lg:flex">
					<Button onClick={() => setEditor({ mode: 'create' })}>
						<Plus className="h-4 w-4" />
						Nuevo producto
					</Button>
				</div>
			</div>

			{isHiddenFilter && (
				<div className="flex items-center justify-between gap-3 rounded-xl border border-accent-orange/20 bg-accent-orange/5 px-4 py-3">
					<p className="text-sm font-medium text-foreground">
						Filtro: productos ocultos
					</p>
					{onClearVisibilityFilter && (
						<Button variant="outline" size="sm" onClick={onClearVisibilityFilter}>
							Ver todos
						</Button>
					)}
				</div>
			)}

			{selectedIds.size > 0 && (
				<div
					className={cn(
						'rounded-xl border border-primary/20 bg-surface-elevated p-3 shadow-lg',
						'fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-30 lg:static lg:shadow-none',
					)}>
					<p className="mb-3 text-sm font-medium text-foreground">
						{selectedIds.size} seleccionado
						{selectedIds.size !== 1 ? 's' : ''}
					</p>
					<div className="flex flex-col gap-2 sm:flex-row">
						<Button
							variant="outline"
							size="sm"
							className="flex-1"
							onClick={() => setSelectedIds(new Set())}>
							Deseleccionar
						</Button>
						<Button
							variant="destructive"
							size="sm"
							className="flex-1"
							onClick={() => setBulkDeleteOpen(true)}>
							<Trash2 className="h-4 w-4" />
							Eliminar
						</Button>
					</div>
				</div>
			)}

			{filteredProducts.length === 0 ? (
				<p className="rounded-xl border border-dashed border-border py-12 text-center text-foreground-muted">
					{isHiddenFilter
						? 'No hay productos ocultos.'
						: 'Aún no hay productos. Pulsa «Nuevo producto» para empezar.'}
				</p>
			) : (
				<ProductCategoryList
					products={filteredProducts}
					categories={categories}
					imageMap={imageMap}
					selectedIds={selectedIds}
					onSelectionChange={setSelectedIds}
					onReorder={handleReorder}
					onEdit={(id) => setEditor({ mode: 'edit', id })}
					onDuplicate={(id) => {
						onDuplicateProduct(id);
						onNotify('Producto duplicado');
					}}
					onDelete={setDeleteId}
				/>
			)}

			<Button
				size="icon"
				className="fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom))] right-3 z-30 h-14 w-14 rounded-full shadow-lg lg:hidden"
				onClick={() => setEditor({ mode: 'create' })}
				aria-label="Nuevo producto">
				<Plus className="h-6 w-6" />
			</Button>

			<Dialog
				open={editor !== null && editorDraft !== null}
				onClose={closeEditor}
				title={editor?.mode === 'create' ? 'Nuevo producto' : 'Editar producto'}>
				{editorDraft && (
					<ProductEditLayout
						key={
							editor?.mode === 'create'
								? 'create'
								: `edit-${editor?.mode === 'edit' ? editor.id : ''}`
						}
						initialDraft={editorDraft}
						categories={categories}
						images={images}
						submitLabel={editor?.mode === 'create' ? 'Crear producto' : 'Guardar'}
						onSave={handleSave}
						onCancel={closeEditor}
						onDuplicate={
							editor?.mode === 'edit'
								? () => {
										onDuplicateProduct(editor.id);
										onNotify('Producto duplicado');
										closeEditor();
									}
								: undefined
						}
						onDelete={
							editor?.mode === 'edit'
								? () => {
										setDeleteId(editor.id);
										closeEditor();
									}
								: undefined
						}
					/>
				)}
			</Dialog>

			<ConfirmDialog
				open={deleteId !== null}
				title="Eliminar producto"
				description="¿Seguro que quieres eliminar este producto?"
				onConfirm={() => {
					if (deleteId) {
						onDeleteProduct(deleteId);
						setSelectedIds((prev) => {
							const next = new Set(prev);
							next.delete(deleteId);
							return next;
						});
						onNotify('Producto eliminado');
					}
					setDeleteId(null);
				}}
				onCancel={() => setDeleteId(null)}
			/>

			<ConfirmDialog
				open={bulkDeleteOpen}
				title="Eliminar productos"
				description={`¿Seguro que quieres eliminar ${selectedIds.size} productos?`}
				onConfirm={handleBulkDelete}
				onCancel={() => setBulkDeleteOpen(false)}
			/>
		</MobilePageLayout>
	);
}
