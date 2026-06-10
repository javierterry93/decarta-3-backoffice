import { ArrowLeft, Copy, ImageIcon, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '../components/ui/Button.tsx';
import { EuroPriceInput } from '../components/forms/EuroPriceInput.tsx';
import { Input } from '../components/ui/Input.tsx';
import { Label } from '../components/ui/Label.tsx';
import { Select } from '../components/ui/Select.tsx';
import { Switch } from '../components/ui/Switch.tsx';
import { useImageObjectUrl } from '../hooks/useImageUrls.ts';
import { EntityImageLayout } from './EntityImageLayout.tsx';
import type { Category, Image } from '../types/index.ts';
import {
	isProductDraftValid,
	isProductNameValid,
	isProductPriceValid,
} from '../utils/productValidation.ts';

export type ProductEditScreen = 'form' | 'images';

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
	images: Image[];
	screen: ProductEditScreen;
	onScreenChange: (screen: ProductEditScreen) => void;
	onUploadImage: (file: File) => Promise<string>;
	onDeleteImage: (id: string) => Promise<void>;
	onNotify?: (message: string) => void;
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
	screen,
	onScreenChange,
	onUploadImage,
	onDeleteImage,
	onNotify,
	submitLabel = 'Guardar',
	onSave,
	onCancel,
	onDuplicate,
	onDelete,
}: ProductEditLayoutProps) {
	const [draft, setDraft] = useState<ProductEditDraft>(initialDraft);

	useEffect(() => {
		setDraft(initialDraft);
	}, [initialDraft]);

	const previewUrl = useImageObjectUrl(
		draft.imageId,
		'thumb',
		images.find((i) => i.id === draft.imageId),
	);

	const categoryOptions = categories.map((c) => ({
		value: c.id,
		label: c.name || 'Sin nombre',
	}));

	const patch = (data: Partial<ProductEditDraft>) =>
		setDraft((prev) => ({ ...prev, ...data }));

	const nameError = !isProductNameValid(draft.name)
		? 'El nombre es obligatorio'
		: null;
	const priceError = !isProductPriceValid(draft.price)
		? 'El precio es obligatorio'
		: null;
	const canSave = isProductDraftValid(draft);

	if (screen === 'images') {
		return (
			<div className="flex min-h-0 flex-1 flex-col">
				<div className="min-h-0 flex-1 overflow-y-auto p-0.5 pb-4">
					<EntityImageLayout
						imageId={draft.imageId}
						image={images.find((i) => i.id === draft.imageId)}
						entityLabel="producto"
						onImageChange={(imageId) => patch({ imageId })}
						onUploadImage={onUploadImage}
						onDeleteImage={onDeleteImage}
						onNotify={onNotify}
					/>
				</div>
				<div className="flex shrink-0 border-t border-separator bg-surface-elevated pt-4">
					<Button
						type="button"
						variant="outline"
						onClick={() => onScreenChange('form')}
						className="w-full lg:ml-auto lg:w-auto">
						<ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
						Volver al producto
					</Button>
				</div>
			</div>
		);
	}

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
						required
					/>
					{nameError && <p className="text-xs text-accent-orange">{nameError}</p>}
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
					<EuroPriceInput
						id="product-price"
						value={draft.price}
						onChange={(price) => patch({ price })}
						required
					/>
					{priceError && <p className="text-xs text-accent-orange">{priceError}</p>}
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
					<Label>Imagen</Label>
					<button
						type="button"
						onClick={() => onScreenChange('images')}
						className="flex w-full items-center gap-3 rounded-xl border border-separator bg-fill p-3 text-left transition-colors hover:bg-surface-elevated">
						{previewUrl ? (
							<img
								src={previewUrl}
								alt=""
								className="h-14 w-14 shrink-0 rounded-lg object-cover"
							/>
						) : (
							<span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-surface-elevated text-foreground-muted">
								<ImageIcon className="h-6 w-6" aria-hidden />
							</span>
						)}
						<span className="min-w-0 flex-1">
							<span className="block text-sm font-medium text-foreground">
								{draft.imageId
									? (images.find((i) => i.id === draft.imageId)?.name ??
										'Imagen asignada')
									: 'Sin imagen'}
							</span>
							<span className="block text-xs text-foreground-muted">
								Gestionar imagen del producto
							</span>
						</span>
					</button>
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
