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
import { GripVertical, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import type { Category } from '../../types/index.ts';
import { cn } from '../../utils/cn.ts';
import { Input } from '../ui/Input.tsx';
import { Switch } from '../ui/Switch.tsx';
import { Button } from '../ui/Button.tsx';

type CategorySorterProps = {
	categories: Category[];
	onReorder: (orderedIds: string[]) => void;
	onUpdate: (id: string, data: Partial<Category>) => void;
	onPersist: (id: string) => void;
	onToggleVisible: (id: string, visible: boolean) => void;
	onDelete?: (id: string) => void;
	onNotify: (message: string) => void;
};

function SortableCategoryCard({
	category,
	onUpdate,
	onPersist,
	onToggleVisible,
	onDelete,
	onNotify,
}: {
	category: Category;
	onUpdate: (id: string, data: Partial<Category>) => void;
	onPersist: (id: string) => void;
	onToggleVisible: (id: string, visible: boolean) => void;
	onDelete?: (id: string) => void;
	onNotify: (message: string) => void;
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
		<article
			ref={setNodeRef}
			style={style}
			className={cn(
				'rounded-xl border border-separator bg-surface-elevated p-3',
				isDragging && 'opacity-80 shadow-md',
			)}
		>
			<div className="flex items-start gap-3">
				<button
					type="button"
					className="mt-2 flex min-h-11 min-w-11 shrink-0 cursor-grab items-center justify-center rounded-lg text-foreground-muted active:cursor-grabbing active:bg-fill"
					{...attributes}
					{...listeners}
					aria-label="Arrastrar para reordenar"
				>
					<GripVertical className="h-5 w-5" />
				</button>
				<div className="min-w-0 flex-1 space-y-3">
					<Input
						value={category.name}
						onChange={(e) => onUpdate(category.id, { name: e.target.value })}
						onBlur={() => {
							onPersist(category.id);
							onNotify('Categoría guardada');
						}}
						placeholder="Nombre de categoría"
						aria-label="Nombre"
					/>
					<div className="flex items-center justify-between gap-3">
						<span className="text-sm text-foreground-muted">
							Orden {category.order}
						</span>
						<Switch
							checked={category.visible}
							onCheckedChange={(visible) =>
								onToggleVisible(category.id, visible)
							}
							label={category.visible ? 'Visible' : 'Oculta'}
						/>
					</div>
				</div>
			</div>
			{onDelete && (
				<Button
					variant="ghost"
					size="sm"
					className="mt-3 w-full text-accent-orange lg:hidden"
					onClick={() => onDelete(category.id)}
				>
					<Trash2 className="h-4 w-4" />
					Eliminar categoría
				</Button>
			)}
		</article>
	);
}

function SortableRow({
	category,
	onUpdate,
	onPersist,
	onToggleVisible,
	onNotify,
}: {
	category: Category;
	onUpdate: (id: string, data: Partial<Category>) => void;
	onPersist: (id: string) => void;
	onToggleVisible: (id: string, visible: boolean) => void;
	onNotify: (message: string) => void;
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
			)}
		>
			<td className="px-2 py-2">
				<button
					type="button"
					className="cursor-grab rounded p-1 text-foreground-muted hover:bg-fill active:cursor-grabbing"
					{...attributes}
					{...listeners}
					aria-label="Arrastrar para reordenar"
				>
					<GripVertical className="h-4 w-4" />
				</button>
			</td>
			<td className="px-4 py-2">
				<Input
					value={category.name}
					onChange={(e) =>
						onUpdate(category.id, { name: e.target.value })
					}
					onBlur={() => {
						onPersist(category.id);
						onNotify('Categoría guardada');
					}}
					placeholder="Nombre de categoría"
					aria-label="Nombre"
				/>
			</td>
			<td className="px-4 py-2 text-center text-foreground-muted">
				{category.order}
			</td>
			<td className="px-4 py-2 text-center">
				<div className="flex justify-center">
					<Switch
						checked={category.visible}
						onCheckedChange={(visible) =>
							onToggleVisible(category.id, visible)
						}
						label={category.visible ? 'Visible' : 'Oculta'}
					/>
				</div>
			</td>
		</tr>
	);
}

export function CategorySorter({
	categories,
	onReorder,
	onUpdate,
	onPersist,
	onToggleVisible,
	onDelete,
	onNotify,
}: CategorySorterProps) {
	const sorted = useMemo(
		() => [...categories].sort((a, b) => a.order - b.order),
		[categories],
	);
	const ids = sorted.map((c) => c.id);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { delay: 150, tolerance: 8 },
		}),
		useSensor(TouchSensor, {
			activationConstraint: { delay: 150, tolerance: 8 },
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over || active.id === over.id) return;

		const oldIndex = ids.indexOf(String(active.id));
		const newIndex = ids.indexOf(String(over.id));
		const newOrder = arrayMove(ids, oldIndex, newIndex);
		onReorder(newOrder);
		onNotify('Orden actualizado');
	};

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCenter}
			onDragEnd={handleDragEnd}
		>
			<SortableContext items={ids} strategy={verticalListSortingStrategy}>
				<div className="space-y-2 lg:hidden">
					{sorted.map((category) => (
						<SortableCategoryCard
							key={category.id}
							category={category}
							onUpdate={onUpdate}
							onPersist={onPersist}
							onToggleVisible={onToggleVisible}
							onDelete={onDelete}
							onNotify={onNotify}
						/>
					))}
				</div>

				<div className="hidden overflow-x-auto rounded-xl border border-separator bg-surface-elevated lg:block">
					<table className="w-full table-fixed border-collapse text-sm">
						<colgroup>
							<col className="w-10" />
							<col />
							<col className="w-28" />
							<col className="w-28" />
						</colgroup>
						<thead>
							<tr className="border-b border-separator bg-fill">
								<th className="px-2 py-3" aria-label="Orden" />
								<th className="px-4 py-3 text-left font-medium text-foreground-muted">
									Categoría
								</th>
								<th className="px-4 py-3 text-center font-medium text-foreground-muted">
									Orden
								</th>
								<th className="px-4 py-3 text-center font-medium text-foreground-muted">
									Visible
								</th>
							</tr>
						</thead>
						<tbody>
							{sorted.map((category) => (
								<SortableRow
									key={category.id}
									category={category}
									onUpdate={onUpdate}
									onPersist={onPersist}
									onToggleVisible={onToggleVisible}
									onNotify={onNotify}
								/>
							))}
						</tbody>
					</table>
				</div>
			</SortableContext>
		</DndContext>
	);
}
