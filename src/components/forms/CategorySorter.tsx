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
import { useMemo } from 'react';
import type { Category } from '../../types/index.ts';
import { cn } from '../../utils/cn.ts';
import { Input } from '../ui/Input.tsx';
import { Switch } from '../ui/Switch.tsx';

type CategorySorterProps = {
	categories: Category[];
	onReorder: (orderedIds: string[]) => void;
	onUpdate: (id: string, data: Partial<Category>) => void;
	onSave?: (message: string) => void;
};

function SortableRow({
	category,
	onUpdate,
	onSave,
}: {
	category: Category;
	onUpdate: (id: string, data: Partial<Category>) => void;
	onSave?: (message: string) => void;
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
					onBlur={() => onSave?.('Categoría guardada')}
					placeholder="Nombre de categoría"
					aria-label="Nombre"
				/>
			</td>
			<td className="px-4 py-2 text-center text-foreground-muted">
				{category.order}
			</td>
			<td className="px-4 py-2">
				<Switch
					checked={category.visible}
					onCheckedChange={(visible) => {
						onUpdate(category.id, { visible });
						onSave?.(visible ? 'Categoría visible' : 'Categoría oculta');
					}}
					label={category.visible ? 'Visible' : 'Oculta'}
				/>
			</td>
		</tr>
	);
}

export function CategorySorter({
	categories,
	onReorder,
	onUpdate,
	onSave,
}: CategorySorterProps) {
	const sorted = useMemo(
		() => [...categories].sort((a, b) => a.order - b.order),
		[categories],
	);
	const ids = sorted.map((c) => c.id);

	const sensors = useSensors(
		useSensor(PointerSensor),
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
		onSave?.('Orden actualizado');
	};

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCenter}
			onDragEnd={handleDragEnd}
		>
			<div className="overflow-x-auto rounded-xl border border-separator bg-surface-elevated">
				<table className="w-full border-collapse text-sm">
					<thead>
						<tr className="border-b border-separator bg-fill">
							<th className="w-10 px-2 py-3" aria-label="Orden" />
							<th className="px-4 py-3 text-left font-medium text-foreground-muted">
								Categoría
							</th>
							<th className="w-20 px-4 py-3 text-center font-medium text-foreground-muted">
								Orden
							</th>
							<th className="px-4 py-3 text-left font-medium text-foreground-muted">
								Visible
							</th>
						</tr>
					</thead>
					<tbody>
						<SortableContext
							items={ids}
							strategy={verticalListSortingStrategy}
						>
							{sorted.map((category) => (
								<SortableRow
									key={category.id}
									category={category}
									onUpdate={onUpdate}
									onSave={onSave}
								/>
							))}
						</SortableContext>
					</tbody>
				</table>
			</div>
		</DndContext>
	);
}
