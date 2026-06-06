import { Copy, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../components/ui/Button.tsx';
import { Input } from '../components/ui/Input.tsx';
import { Label } from '../components/ui/Label.tsx';
import { Select } from '../components/ui/Select.tsx';
import { Switch } from '../components/ui/Switch.tsx';
import type { Category, MenuImage } from '../types/index.ts';

export type ProductEditDraft = {
	name: string;
	categoryId: string;
	price: number;
	shortDescription: string;
	visible: boolean;
	imageId: string | null;
};

type ProductEditLayoutProps = {
	initialDraft: ProductEditDraft;
	categories: Category[];
	images: MenuImage[];
	submitLabel?: string;
	onSave: (data: ProductEditDraft) => void;
	onCancel: () => void;
	onDuplicate?: () => void;
	onDelete?: () => void;
};

export function ProductEditLayout({
	initialDraft,
	categories,
	images,
	submitLabel = 'Guardar',
	onSave,
	onCancel,
	onDuplicate,
	onDelete,
}: ProductEditLayoutProps) {
	const [draft, setDraft] = useState<ProductEditDraft>(initialDraft);

	const categoryOptions = categories.map((c) => ({
		value: c.id,
		label: c.name || 'Sin nombre',
	}));

	const imageOptions = [
		{ value: '', label: 'Sin imagen' },
		...images.map((i) => ({ value: i.id, label: i.name })),
	];

	const patch = (data: Partial<ProductEditDraft>) =>
		setDraft((prev) => ({ ...prev, ...data }));

	const canSave = draft.categoryId.length > 0;

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
					<Label htmlFor="product-name">Nombre</Label>
					<Input
						id="product-name"
						value={draft.name}
						onChange={(e) => patch({ name: e.target.value })}
						placeholder="Nombre del producto"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="product-category">Categoría</Label>
					{categories.length > 0 ? (
						<Select
							value={draft.categoryId}
							onChange={(v) => patch({ categoryId: v })}
							options={categoryOptions}
						/>
					) : (
						<p className="text-sm text-accent-orange">
							Crea al menos una categoría antes de guardar.
						</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="product-price">Precio</Label>
					<Input
						id="product-price"
						type="number"
						step="0.01"
						min="0"
						inputMode="decimal"
						value={String(draft.price)}
						onChange={(e) => patch({ price: parseFloat(e.target.value) || 0 })}
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="product-description">Descripción corta</Label>
					<Input
						id="product-description"
						value={draft.shortDescription}
						onChange={(e) => patch({ shortDescription: e.target.value })}
						placeholder="Descripción breve"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="product-image">Imagen</Label>
					<Select
						value={draft.imageId ?? ''}
						onChange={(v) => patch({ imageId: v || null })}
						options={imageOptions}
					/>
					{draft.imageId && (
						<img
							src={images.find((i) => i.id === draft.imageId)?.thumbnailUrl}
							alt=""
							className="mt-2 h-16 w-16 rounded object-cover"
						/>
					)}
				</div>

				<Switch
					checked={draft.visible}
					onCheckedChange={(visible) => patch({ visible })}
					label={draft.visible ? 'Visible en la carta' : 'Oculto en la carta'}
				/>

				{(onDuplicate || onDelete) && (
					<div className="flex gap-2 border-t border-separator pt-4 lg:hidden">
						{onDuplicate && (
							<Button
								type="button"
								variant="outline"
								size="sm"
								className="flex-1"
								onClick={onDuplicate}>
								<Copy className="h-4 w-4 shrink-0" aria-hidden />
								Duplicar
							</Button>
						)}
						{onDelete && (
							<Button
								type="button"
								variant="outline"
								size="sm"
								className="flex-1 text-accent-orange"
								onClick={onDelete}>
								<Trash2 className="h-4 w-4 shrink-0" aria-hidden />
								Eliminar
							</Button>
						)}
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
