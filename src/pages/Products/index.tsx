import { Copy, Download, Plus, Trash2, Upload } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { ConfirmDialog } from '../../components/dialogs/ConfirmDialog.tsx';
import { ExcelImportDialog } from '../../components/dialogs/ExcelImportDialog.tsx';
import {
	EditableTable,
	type EditableColumn,
} from '../../components/tables/EditableTable.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Input } from '../../components/ui/Input.tsx';
import { Select } from '../../components/ui/Select.tsx';
import { Switch } from '../../components/ui/Switch.tsx';
import { useAutoSaveToast } from '../../hooks/useAutoSaveToast.ts';
import { exportToCsv, exportToExcel } from '../../services/excelService.ts';
import { useMenuStore } from '../../store/menuStore.ts';
import type { Product } from '../../types/index.ts';
import { formatPrice } from '../../utils/format.ts';

export default function ProductsPage() {
	const products = useMenuStore((s) => s.products);
	const categories = useMenuStore((s) => s.categories);
	const images = useMenuStore((s) => s.images);
	const addProduct = useMenuStore((s) => s.addProduct);
	const updateProduct = useMenuStore((s) => s.updateProduct);
	const duplicateProduct = useMenuStore((s) => s.duplicateProduct);
	const deleteProduct = useMenuStore((s) => s.deleteProduct);
	const showToast = useAutoSaveToast();

	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [importOpen, setImportOpen] = useState(false);

	const categoryOptions = useMemo(
		() => categories.map((c) => ({ value: c.id, label: c.name })),
		[categories],
	);

	const imageMap = useMemo(
		() => Object.fromEntries(images.map((i) => [i.id, i.thumbnailUrl])),
		[images],
	);

	const handleUpdate = useCallback(
		(id: string, key: keyof Product, value: Product[keyof Product]) => {
			updateProduct(id, { [key]: value });
		},
		[updateProduct],
	);

	const handleSave = useCallback(
		(_id: string, key: keyof Product) => {
			const messages: Partial<Record<keyof Product, string>> = {
				name: 'Producto guardado',
				price: 'Precio actualizado',
				shortDescription: 'Descripción actualizada',
				categoryId: 'Categoría actualizada',
			};
			showToast(messages[key] ?? 'Cambio guardado');
		},
		[showToast],
	);

	const columns: EditableColumn<Product>[] = useMemo(
		() => [
			{
				key: 'name',
				label: 'Nombre',
				renderEdit: (value, _row, onChange) => (
					<Input
						autoFocus
						value={String(value ?? '')}
						onChange={(e) => onChange(e.target.value as Product['name'])}
						onBlur={() => showToast('Producto guardado')}
					/>
				),
			},
			{
				key: 'categoryId',
				label: 'Categoría',
				render: (value) =>
					categories.find((c) => c.id === value)?.name ?? '—',
				renderEdit: (value, _row, onChange) => (
					<Select
						value={String(value ?? '')}
						onChange={(v) => {
							onChange(v as Product['categoryId']);
							showToast('Categoría actualizada');
						}}
						options={categoryOptions}
					/>
				),
			},
			{
				key: 'price',
				label: 'Precio',
				render: (value) => formatPrice(Number(value)),
				renderEdit: (value, _row, onChange) => (
					<Input
						autoFocus
						type="number"
						step="0.01"
						min="0"
						value={String(value ?? '')}
						onChange={(e) =>
							onChange(
								(parseFloat(e.target.value) || 0) as Product['price'],
							)
						}
						onBlur={() => showToast('Precio actualizado')}
					/>
				),
			},
			{
				key: 'shortDescription',
				label: 'Descripción corta',
				renderEdit: (value, _row, onChange) => (
					<Input
						autoFocus
						value={String(value ?? '')}
						onChange={(e) =>
							onChange(e.target.value as Product['shortDescription'])
						}
						onBlur={() => showToast('Descripción actualizada')}
					/>
				),
			},
			{
				key: 'visible',
				label: 'Visible',
				editable: false,
				render: (_value, row) => (
					<Switch
						checked={row.visible}
						onCheckedChange={(visible) => {
							updateProduct(row.id, { visible });
							showToast(visible ? 'Producto visible' : 'Producto oculto');
						}}
					/>
				),
			},
			{
				key: 'imageId',
				label: 'Imagen',
				editable: false,
				render: (_value, row) =>
					row.imageId && imageMap[row.imageId] ? (
						<img
							src={imageMap[row.imageId]}
							alt=""
							className="h-10 w-10 rounded object-cover"
						/>
					) : (
						<span className="text-foreground-muted">—</span>
					),
				renderEdit: (value, _row, onChange) => (
					<Select
						value={String(value ?? '')}
						onChange={(v) => {
							onChange((v || null) as Product['imageId']);
							showToast('Imagen asignada');
						}}
						options={[
							{ value: '', label: 'Sin imagen' },
							...images.map((i) => ({
								value: i.id,
								label: i.name,
							})),
						]}
					/>
				),
			},
		],
		[
			categories,
			categoryOptions,
			imageMap,
			images,
			showToast,
			updateProduct,
		],
	);

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold text-foreground">Carta</h1>
					<p className="mt-1 text-sm text-foreground-muted">
						Doble clic en una celda para editar · Enter para guardar ·
						Escape para cancelar
					</p>
				</div>
				<div className="flex flex-wrap gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => setImportOpen(true)}
					>
						<Upload className="h-4 w-4" />
						Importar Excel
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => {
							exportToExcel(products, categories);
							showToast('Carta exportada a Excel');
						}}
					>
						<Download className="h-4 w-4" />
						Exportar
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => {
							exportToCsv(products, categories);
							showToast('Carta exportada a CSV');
						}}
					>
						CSV
					</Button>
					<Button
						onClick={() => {
							addProduct();
							showToast('Nuevo producto añadido');
						}}
					>
						<Plus className="h-4 w-4" />
						Nuevo producto
					</Button>
				</div>
			</div>

			<EditableTable
				columns={columns}
				data={products}
				onUpdate={handleUpdate}
				onSave={handleSave}
				emptyMessage="Aún no hay productos. Pulsa «Nuevo producto» para empezar."
				rowActions={(row) => (
					<div className="flex justify-end gap-1">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => {
								duplicateProduct(row.id);
								showToast('Producto duplicado');
							}}
							aria-label="Duplicar producto"
							title="Duplicar"
						>
							<Copy className="h-4 w-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setDeleteId(row.id)}
							aria-label="Eliminar producto"
							title="Eliminar"
						>
							<Trash2 className="h-4 w-4 text-accent-orange" />
						</Button>
					</div>
				)}
			/>

			<ConfirmDialog
				open={deleteId !== null}
				title="Eliminar producto"
				description="¿Seguro que quieres eliminar este producto?"
				onConfirm={() => {
					if (deleteId) {
						deleteProduct(deleteId);
						showToast('Producto eliminado');
					}
					setDeleteId(null);
				}}
				onCancel={() => setDeleteId(null)}
			/>

			<ExcelImportDialog
				open={importOpen}
				onClose={() => setImportOpen(false)}
			/>
		</div>
	);
}
