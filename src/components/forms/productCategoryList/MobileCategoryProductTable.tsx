import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	KeyboardSensor,
	TouchSensor,
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
import { ChevronRight, GripVertical } from 'lucide-react';
import type { Product } from '../../../types/index.ts';
import { cn } from '../../../utils/cn.ts';
import { formatPrice } from '../../../utils/format.ts';
import {
	type CategoryProductTableProps,
	ProductVisibilityBadge,
	useCategorySelection,
} from './shared.tsx';

const MOBILE_PRICE_COL = 'w-[4.5rem]';
const MOBILE_STATUS_COL = 'w-[3.75rem]';

function useMobileSortableSensors() {
	return useSensors(
		useSensor(TouchSensor, {
			activationConstraint: { delay: 200, tolerance: 8 },
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);
}

function SortableMobileRow({
	product,
	selected,
	onSelect,
	onEdit,
}: {
	product: Product;
	selected: boolean;
	onSelect: (checked: boolean) => void;
	onEdit: () => void;
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
		<div
			ref={setNodeRef}
			style={style}
			className={cn(
				'flex min-h-12 items-center gap-1 border-b border-separator/40 px-3 py-1 last:border-b-0',
				isDragging &&
					'relative z-10 mx-1 rounded-xl border border-separator bg-surface-elevated shadow-md',
				selected && 'bg-primary/5 ring-1 ring-inset ring-primary/20',
			)}>
			<input
				type="checkbox"
				checked={selected}
				onChange={(e) => onSelect(e.target.checked)}
				className="mx-1 h-4 w-4 shrink-0 rounded border-border accent-primary"
				aria-label={`Seleccionar ${product.name || 'producto'}`}
			/>
			<button
				type="button"
				style={{ touchAction: 'none' }}
				className="flex h-9 w-9 shrink-0 cursor-grab items-center justify-center rounded-lg text-foreground-muted/70 active:cursor-grabbing active:bg-fill"
				{...attributes}
				{...listeners}
				aria-label="Arrastrar para reordenar">
				<GripVertical className="h-4 w-4" />
			</button>
			<button
				type="button"
				className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-1 py-2 text-left active:bg-fill"
				onClick={onEdit}>
				<span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
					{product.name || (
						<span className="font-normal text-foreground-muted italic">
							Sin nombre
						</span>
					)}
				</span>
				<span
					className={cn(
						MOBILE_PRICE_COL,
						'shrink-0 text-right text-sm font-semibold tabular-nums text-foreground',
					)}>
					{formatPrice(product.price)}
				</span>
				<span className={cn(MOBILE_STATUS_COL, 'flex shrink-0 justify-end')}>
					<ProductVisibilityBadge visible={product.visible} compact />
				</span>
				<ChevronRight
					className="h-4 w-4 shrink-0 text-foreground-muted/50"
					aria-hidden
				/>
			</button>
		</div>
	);
}

export function MobileCategoryProductTable({
	category,
	products,
	selectedIds,
	onSelectionChange,
	onReorder,
	onEdit,
}: Pick<
	CategoryProductTableProps,
	| 'category'
	| 'products'
	| 'selectedIds'
	| 'onSelectionChange'
	| 'onReorder'
	| 'onEdit'
>) {
	const ids = products.map((p) => p.id);
	const { allSelected, someSelected, toggleAll, toggleOne } =
		useCategorySelection(products, selectedIds, onSelectionChange);
	const sensors = useMobileSortableSensors();

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
				<div className="overflow-hidden rounded-2xl border border-separator bg-surface-elevated shadow-sm">
					<div className="flex items-center gap-1 border-b border-separator/60 bg-fill/50 px-3 py-2.5">
						<input
							type="checkbox"
							checked={allSelected}
							ref={(el) => {
								if (el) el.indeterminate = !allSelected && someSelected;
							}}
							onChange={(e) => toggleAll(e.target.checked)}
							className="mx-1 h-4 w-4 shrink-0 rounded border-border accent-primary"
							aria-label={`Seleccionar todos en ${category.name}`}
						/>
						<span className="w-9 shrink-0" aria-hidden />
						<div className="flex min-w-0 flex-1 items-center gap-2 px-1 text-[11px] font-semibold tracking-wide text-foreground-muted uppercase">
							<span className="min-w-0 flex-1">Nombre</span>
							<span className={cn(MOBILE_PRICE_COL, 'shrink-0 text-right')}>
								Precio
							</span>
							<span className={cn(MOBILE_STATUS_COL, 'shrink-0 text-right')}>
								Estado
							</span>
							<span className="w-4 shrink-0" aria-hidden />
						</div>
					</div>
					{products.map((product) => (
						<SortableMobileRow
							key={product.id}
							product={product}
							selected={selectedIds.has(product.id)}
							onSelect={(checked) => toggleOne(product.id, checked)}
							onEdit={() => onEdit(product.id)}
						/>
					))}
				</div>
			</SortableContext>
		</DndContext>
	);
}
