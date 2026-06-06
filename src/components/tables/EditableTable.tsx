import { useCallback, useState } from 'react';
import { cn } from '../../utils/cn.ts';

export type EditableColumn<T> = {
	key: keyof T & string;
	label: string;
	width?: string;
	render?: (value: T[keyof T], row: T, isEditing: boolean) => React.ReactNode;
	renderEdit?: (
		value: T[keyof T],
		row: T,
		onChange: (value: T[keyof T]) => void,
	) => React.ReactNode;
	editable?: boolean;
};

type EditableTableProps<T extends { id: string }> = {
	columns: EditableColumn<T>[];
	data: T[];
	onUpdate: (id: string, key: keyof T, value: T[keyof T]) => void;
	onSave?: (id: string, key: keyof T) => void;
	rowActions?: (row: T) => React.ReactNode;
	emptyMessage?: string;
	className?: string;
};

export function EditableTable<T extends { id: string }>({
	columns,
	data,
	onUpdate,
	onSave,
	rowActions,
	emptyMessage = 'No hay datos',
	className,
}: EditableTableProps<T>) {
	const [editing, setEditing] = useState<{
		id: string;
		key: keyof T;
	} | null>(null);
	const startEdit = useCallback((id: string, key: keyof T) => {
		setEditing({ id, key });
	}, []);

	const cancelEdit = useCallback(() => {
		setEditing(null);
	}, []);

	const commitEdit = useCallback(
		(id: string, key: keyof T) => {
			onSave?.(id, key);
			setEditing(null);
		},
		[onSave],
	);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent, id: string, key: keyof T) => {
			if (e.key === 'Enter') {
				e.preventDefault();
				commitEdit(id, key);
			}
			if (e.key === 'Escape') {
				e.preventDefault();
				cancelEdit();
			}
		},
		[commitEdit, cancelEdit],
	);

	return (
		<div
			className={cn(
				'overflow-x-auto rounded-xl border border-separator bg-surface-elevated',
				className,
			)}
		>
			<table className="w-full min-w-max border-collapse text-sm">
				<thead>
					<tr className="border-b border-separator bg-fill">
						{columns.map((col) => (
							<th
								key={col.key}
								className="px-4 py-3 text-left font-medium text-foreground-muted"
								style={col.width ? { width: col.width } : undefined}
							>
								{col.label}
							</th>
						))}
						{rowActions && (
							<th className="px-4 py-3 text-right font-medium text-foreground-muted">
								Acciones
							</th>
						)}
					</tr>
				</thead>
				<tbody>
					{data.length === 0 ? (
						<tr>
							<td
								colSpan={columns.length + (rowActions ? 1 : 0)}
								className="px-4 py-12 text-center text-foreground-muted"
							>
								{emptyMessage}
							</td>
						</tr>
					) : (
						data.map((row) => (
							<tr
								key={row.id}
								className="border-b border-separator last:border-0 hover:bg-fill/50"
							>
								{columns.map((col) => {
									const isEditing =
										editing?.id === row.id &&
										editing?.key === col.key;
									const value = row[col.key];
									const editable = col.editable !== false;

									return (
										<td
											key={col.key}
											className="px-4 py-2"
											onDoubleClick={() => {
												if (editable) startEdit(row.id, col.key);
											}}
										>
											{isEditing && col.renderEdit ? (
												<div
													onKeyDown={(e) =>
														handleKeyDown(e, row.id, col.key)
													}
												>
													{col.renderEdit(
														value,
														row,
														(v) => onUpdate(row.id, col.key, v),
													)}
												</div>
											) : col.render ? (
												col.render(value, row, isEditing)
											) : (
												<span
													className={cn(
														editable &&
															'cursor-text rounded px-1 py-0.5 hover:bg-fill',
													)}
													title={
														editable
															? 'Doble clic para editar'
															: undefined
													}
												>
													{String(value ?? '')}
												</span>
											)}
										</td>
									);
								})}
								{rowActions && (
									<td className="px-4 py-2 text-right">
										{rowActions(row)}
									</td>
								)}
							</tr>
						))
					)}
				</tbody>
			</table>
		</div>
	);
}
