import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	KeyboardSensor,
	PointerSensor,
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
import { ChevronRight, GripVertical, Pencil, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Category } from '../../types/index.ts';
import { cn } from '../../utils/cn.ts';
import {
	isSearchActive,
	matchesSearchQuery,
} from '../../utils/searchText.ts';
import { Button } from '../ui/Button.tsx';
import { ListSearchEmpty, ListSearchInput } from './ListSearchInput.tsx';
import {
	ProductVisibilityBadge,
	useIsLgScreen,
} from './productCategoryList/shared.tsx';

type CategoryListProps = {
	categories: Category[];
	productCountByCategory: Record<string, number>;
	onReorder: (orderedIds: string[]) => void;
	onEdit: (categoryId: string) => void;
	onDelete: (categoryId: string) => void;
};

const MOBILE_COUNT_COL = 'w-[4.5rem]';
const MOBILE_STATUS_COL = 'w-[3.75rem]';

function useMobileSortableSensors(reorderEnabled = true) {
	return useSensors(
		useSensor(TouchSensor, {
			activationConstraint: reorderEnabled
				? { delay: 200, tolerance: 8 }
				: { delay: 999999, tolerance: 999999 },
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);
}

function useDesktopSortableSensors(reorderEnabled = true) {
	return useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: reorderEnabled ? 8 : 999999 },
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);
}

function CategoryRowActions({
	onEdit,
	onDelete,
}: {
	onEdit: () => void;
	onDelete: () => void;
}) {
	return (
		<div className="flex justify-end gap-1">
			<Button
				variant="ghost"
				size="icon"
				onClick={onEdit}
				aria-label="Editar categoría"
				title="Editar">
				<Pencil className="h-4 w-4" />
			</Button>
			<Button
				variant="ghost"
				size="icon"
				onClick={onDelete}
				aria-label="Eliminar categoría"
				title="Eliminar">
				<Trash2 className="h-4 w-4 text-accent-orange" />
			</Button>
		</div>
	);
}

function SortableMobileRow({
	category,
	productCount,
	onEdit,
}: {
	category: Category;
	productCount: number;
	onEdit: () => void;
}) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: category.id });

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
			)}>
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
					{category.name || (
						<span className="font-normal text-foreground-muted italic">
							Sin nombre
						</span>
					)}
				</span>
				<span
					className={cn(
						MOBILE_COUNT_COL,
						'shrink-0 text-right text-sm tabular-nums text-foreground-muted',
					)}>
					{productCount}
				</span>
				<span className={cn(MOBILE_STATUS_COL, 'flex shrink-0 justify-end')}>
					<ProductVisibilityBadge visible={category.visible} compact />
				</span>
				<ChevronRight
					className="h-4 w-4 shrink-0 text-foreground-muted/50"
					aria-hidden
				/>
			</button>
		</div>
	);
}

function SortableDesktopRow({
	category,
	productCount,
	onEdit,
	onDelete,
}: {
	category: Category;
	productCount: number;
	onEdit: () => void;
	onDelete: () => void;
}) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: category.id });

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
			)}>
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
				{category.name || (
					<span className="text-foreground-muted italic">Sin nombre</span>
				)}
			</td>
			<td className="px-4 py-2 text-center tabular-nums text-foreground-muted">
				{productCount}
			</td>
			<td className="px-4 py-2 text-center">
				<ProductVisibilityBadge visible={category.visible} />
			</td>
			<td className="px-4 py-2">
				<CategoryRowActions onEdit={onEdit} onDelete={onDelete} />
			</td>
		</tr>
	);
}

function MobileCategoryList({
	categories,
	productCountByCategory,
	onReorder,
	onEdit,
	reorderEnabled = true,
}: Omit<CategoryListProps, 'onDelete'> & { reorderEnabled?: boolean }) {
	const ids = categories.map((category) => category.id);
	const sensors = useMobileSortableSensors(reorderEnabled);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over || active.id === over.id) return;
		const oldIndex = ids.indexOf(String(active.id));
		const newIndex = ids.indexOf(String(over.id));
		onReorder(arrayMove(ids, oldIndex, newIndex));
	};

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCenter}
			onDragEnd={handleDragEnd}>
			<SortableContext items={ids} strategy={verticalListSortingStrategy}>
				<div className="overflow-hidden rounded-2xl border border-separator bg-surface-elevated shadow-sm">
					<div className="flex items-center gap-1 border-b border-separator/60 bg-fill/50 px-3 py-2.5">
						<span className="w-9 shrink-0" aria-hidden />
						<div className="flex min-w-0 flex-1 items-center gap-2 px-1 text-[11px] font-semibold tracking-wide text-foreground-muted uppercase">
							<span className="min-w-0 flex-1">Nombre</span>
							<span className={cn(MOBILE_COUNT_COL, 'shrink-0 text-right')}>
								Productos
							</span>
							<span className={cn(MOBILE_STATUS_COL, 'shrink-0 text-right')}>
								Estado
							</span>
							<span className="w-4 shrink-0" aria-hidden />
						</div>
					</div>
					{categories.map((category) => (
						<SortableMobileRow
							key={category.id}
							category={category}
							productCount={productCountByCategory[category.id] ?? 0}
							onEdit={() => onEdit(category.id)}
						/>
					))}
				</div>
			</SortableContext>
		</DndContext>
	);
}

function DesktopCategoryList({
	categories,
	productCountByCategory,
	onReorder,
	onEdit,
	onDelete,
	reorderEnabled = true,
}: CategoryListProps & { reorderEnabled?: boolean }) {
	const ids = categories.map((category) => category.id);
	const sensors = useDesktopSortableSensors(reorderEnabled);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over || active.id === over.id) return;
		const oldIndex = ids.indexOf(String(active.id));
		const newIndex = ids.indexOf(String(over.id));
		onReorder(arrayMove(ids, oldIndex, newIndex));
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
							<col />
							<col className="w-28" />
							<col className="w-28" />
							<col className="w-28" />
						</colgroup>
						<thead>
							<tr className="border-b border-separator bg-fill">
								<th className="px-2 py-3" aria-label="Orden" />
								<th className="px-4 py-3 text-left font-medium text-foreground-muted">
									Nombre
								</th>
								<th className="px-4 py-3 text-center font-medium text-foreground-muted">
									Productos
								</th>
								<th className="px-4 py-3 text-center font-medium text-foreground-muted">
									Estado
								</th>
								<th className="px-4 py-3 text-right font-medium text-foreground-muted">
									Acciones
								</th>
							</tr>
						</thead>
						<tbody>
							{categories.map((category) => (
								<SortableDesktopRow
									key={category.id}
									category={category}
									productCount={productCountByCategory[category.id] ?? 0}
									onEdit={() => onEdit(category.id)}
									onDelete={() => onDelete(category.id)}
								/>
							))}
						</tbody>
					</table>
				</div>
			</SortableContext>
		</DndContext>
	);
}

export function CategoryList(props: CategoryListProps) {
	const [query, setQuery] = useState('');
	const isLg = useIsLgScreen();
	const reorderEnabled = !isSearchActive(query);
	const sortedCategories = useMemo(
		() => [...props.categories].sort((a, b) => a.order - b.order),
		[props.categories],
	);
	const filteredCategories = useMemo(() => {
		if (!isSearchActive(query)) return sortedCategories;
		return sortedCategories.filter((category) =>
			matchesSearchQuery(category.name, query),
		);
	}, [sortedCategories, query]);

	if (sortedCategories.length === 0) {
		return (
			<p className="rounded-xl border border-dashed border-border py-12 text-center text-foreground-muted">
				Aún no hay categorías. Pulsa «Nueva categoría» para empezar.
			</p>
		);
	}

	return (
		<div className="space-y-4">
			<ListSearchInput
				value={query}
				onChange={setQuery}
				placeholder="Buscar categorías…"
			/>
			{filteredCategories.length === 0 ? (
				<ListSearchEmpty query={query} />
			) : isLg ? (
				<DesktopCategoryList
					{...props}
					categories={filteredCategories}
					reorderEnabled={reorderEnabled}
				/>
			) : (
				<MobileCategoryList
					{...props}
					categories={filteredCategories}
					reorderEnabled={reorderEnabled}
				/>
			)}
		</div>
	);
}
