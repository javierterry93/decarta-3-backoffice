import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import type { Product } from '../../../types/index.ts';
import { cn } from '../../../utils/cn.ts';
import { formatPrice } from '../../../utils/format.ts';
import {
	type CategoryProductTableProps,
	ProductRowActions,
	ProductVisibilityBadge,
	useCategorySelection,
} from './shared.tsx';

function useDesktopSortableSensors() {
	return useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 8 },
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);
}

function SortableDesktopRow({
	product,
	imageUrl,
	selected,
	onSelect,
	onEdit,
	onDuplicate,
	onDelete,
}: {
	product: Product;
	imageUrl?: string;
	selected: boolean;
	onSelect: (checked: boolean) => void;
	onEdit: () => void;
	onDuplicate: () => void;
	onDelete: () => void;
}) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: product.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<tr
			ref={setNodeRef}
			style={style}
			className={cn(
				'border-b border-separator last:border-0',
				isDragging && 'bg-fill opacity-80',
				selected && 'bg-primary/5',
			)}>
			<td className="px-3 py-2">
				<input
					type="checkbox"
					checked={selected}
					onChange={(e) => onSelect(e.target.checked)}
					className="h-4 w-4 rounded border-border accent-primary"
					aria-label={`Seleccionar ${product.name || 'producto'}`}
				/>
			</td>
			<td className="px-2 py-2">
				<button
					type="button"
					className="flex min-h-11 min-w-11 cursor-grab items-center justify-center rounded-lg text-foreground-muted hover:bg-fill active:cursor-grabbing"
					{...attributes}
					{...listeners}
					aria-label="Arrastrar para reordenar">
					<GripVertical className="h-4 w-4" />
				</button>
			</td>
			<td className="truncate px-4 py-2 font-medium text-foreground">
				{product.name || (
					<span className="text-foreground-muted italic">Sin nombre</span>
				)}
			</td>
			<td className="truncate px-4 py-2 whitespace-nowrap">
				{formatPrice(product.price)}
			</td>
			<td className="truncate px-4 py-2 text-foreground-muted">
				{product.shortDescription || '—'}
			</td>
			<td className="px-4 py-2 text-center">
				<ProductVisibilityBadge visible={product.visible} />
			</td>
			<td className="px-4 py-2 text-center">
				{imageUrl ? (
					<img
						src={imageUrl}
						alt=""
						className="mx-auto h-10 w-10 rounded object-cover"
					/>
				) : (
					<span className="text-foreground-muted">—</span>
				)}
			</td>
			<td className="px-4 py-2">
				<ProductRowActions
					onEdit={onEdit}
					onDuplicate={onDuplicate}
					onDelete={onDelete}
				/>
			</td>
		</tr>
	);
}

export function DesktopCategoryProductTable({
	category,
	products,
	imageMap,
	selectedIds,
	onSelectionChange,
	onReorder,
	onEdit,
	onDuplicate,
	onDelete,
}: CategoryProductTableProps) {
	const ids = products.map((p) => p.id);
	const { allSelected, someSelected, toggleAll, toggleOne } =
		useCategorySelection(products, selectedIds, onSelectionChange);
	const sensors = useDesktopSortableSensors();

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over || active.id === over.id) return;
		const oldIndex = ids.indexOf(String(active.id));
		const newIndex = ids.indexOf(String(over.id));
		onReorder(category.id, arrayMove(ids, oldIndex, newIndex));
	};

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCenter}
			onDragEnd={handleDragEnd}>
			<SortableContext items={ids} strategy={verticalListSortingStrategy}>
				<div className="overflow-x-auto rounded-xl border border-separator bg-surface-elevated">
					<table className="w-full table-fixed border-collapse text-sm">
						<colgroup>
							<col className="w-10" />
							<col className="w-10" />
							<col />
							<col />
							<col />
							<col />
							<col />
							<col className="w-28" />
						</colgroup>
						<thead>
							<tr className="border-b border-separator bg-fill">
								<th className="px-3 py-3">
									<input
										type="checkbox"
										checked={allSelected}
										ref={(el) => {
											if (el) el.indeterminate = !allSelected && someSelected;
										}}
										onChange={(e) => toggleAll(e.target.checked)}
										className="h-4 w-4 rounded border-border accent-primary"
										aria-label={`Seleccionar todos en ${category.name}`}
									/>
								</th>
								<th className="px-2 py-3" aria-label="Orden" />
								<th className="px-4 py-3 text-left font-medium text-foreground-muted">
									Nombre
								</th>
								<th className="px-4 py-3 text-left font-medium text-foreground-muted">
									Precio
								</th>
								<th className="px-4 py-3 text-left font-medium text-foreground-muted">
									Descripción
								</th>
								<th className="px-4 py-3 text-center font-medium text-foreground-muted">
									Estado
								</th>
								<th className="px-4 py-3 text-center font-medium text-foreground-muted">
									Imagen
								</th>
								<th className="px-4 py-3 text-right font-medium text-foreground-muted">
									Acciones
								</th>
							</tr>
						</thead>
						<tbody>
							{products.map((product) => (
								<SortableDesktopRow
									key={product.id}
									product={product}
									imageUrl={product.imageId ? imageMap[product.imageId] : undefined}
									selected={selectedIds.has(product.id)}
									onSelect={(checked) => toggleOne(product.id, checked)}
									onEdit={() => onEdit(product.id)}
									onDuplicate={() => onDuplicate(product.id)}
									onDelete={() => onDelete(product.id)}
								/>
							))}
						</tbody>
					</table>
				</div>
			</SortableContext>
		</DndContext>
	);
}
