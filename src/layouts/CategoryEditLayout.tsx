import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '../components/ui/Button.tsx';
import { Input } from '../components/ui/Input.tsx';
import { Label } from '../components/ui/Label.tsx';
import { Switch } from '../components/ui/Switch.tsx';

export type CategoryEditDraft = {
	name: string;
	visible: boolean;
};

type CategoryEditLayoutProps = {
	initialDraft: CategoryEditDraft;
	productCount?: number;
	submitLabel?: string;
	onSave: (data: CategoryEditDraft) => void;
	onCancel: () => void;
	onDelete?: () => void;
};

export function CategoryEditLayout({
	initialDraft,
	productCount = 0,
	submitLabel = 'Guardar',
	onSave,
	onCancel,
	onDelete,
}: CategoryEditLayoutProps) {
	const [draft, setDraft] = useState<CategoryEditDraft>(initialDraft);

	useEffect(() => {
		setDraft(initialDraft);
	}, [initialDraft]);

	const nameError = !draft.name.trim() ? 'El nombre es obligatorio' : null;
	const canSave = draft.name.trim().length > 0;

	return (
		<form
			className="flex min-h-0 flex-1 flex-col"
			onSubmit={(e) => {
				e.preventDefault();
				if (!canSave) return;
				onSave(draft);
			}}>
			<div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-0.5 pb-4">
				<div className="space-y-2">
					<Label htmlFor="category-name">Nombre</Label>
					<Input
						id="category-name"
						value={draft.name}
						onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
						placeholder="Nombre de categoría"
						required
						autoFocus
					/>
					{nameError && <p className="text-xs text-accent-orange">{nameError}</p>}
				</div>

				<Switch
					checked={draft.visible}
					onCheckedChange={(visible) => setDraft((prev) => ({ ...prev, visible }))}
					label={draft.visible ? 'Visible en la carta' : 'Oculta en la carta'}
				/>

				{productCount > 0 && (
					<p className="text-sm text-foreground-muted">
						{productCount} producto{productCount !== 1 ? 's' : ''} en esta categoría
					</p>
				)}

				{onDelete && (
					<div className="border-t border-separator pt-4 lg:hidden">
						<Button
							type="button"
							variant="outline"
							size="sm"
							className="w-full text-accent-orange"
							onClick={onDelete}>
							<Trash2 className="h-4 w-4 shrink-0" aria-hidden />
							Eliminar categoría
						</Button>
					</div>
				)}
			</div>

			<div className="flex shrink-0 flex-col-reverse gap-3 border-t border-separator bg-surface-elevated pt-4 lg:flex-row lg:justify-end lg:pt-2">
				<Button
					type="button"
					variant="outline"
					onClick={onCancel}
					className="w-full lg:w-auto">
					Cancelar
				</Button>
				<Button type="submit" disabled={!canSave} className="w-full lg:w-auto">
					{submitLabel}
				</Button>
			</div>
		</form>
	);
}
