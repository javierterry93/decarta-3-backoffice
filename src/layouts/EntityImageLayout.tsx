import { ImageIcon, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ConfirmDialog } from '../components/dialogs/ConfirmDialog.tsx';
import { ImageUploader } from '../components/forms/ImageUploader.tsx';
import { Button } from '../components/ui/Button.tsx';
import { useImageObjectUrl } from '../hooks/useImageUrls.ts';
import type { Image } from '../types/index.ts';

type EntityImageLayoutProps = {
	imageId: string | null;
	image?: Image;
	entityLabel?: string;
	onImageChange: (imageId: string | null) => void;
	onUploadImage: (file: File) => Promise<string>;
	onDeleteImage: (id: string) => Promise<void>;
	onNotify?: (message: string) => void;
};

export function EntityImageLayout({
	imageId,
	image,
	entityLabel = 'elemento',
	onImageChange,
	onUploadImage,
	onDeleteImage,
	onNotify,
}: EntityImageLayoutProps) {
	const [confirmDelete, setConfirmDelete] = useState(false);
	const previewUrl = useImageObjectUrl(imageId, 'full', image);
	const notify = (message: string) => onNotify?.(message);

	const handleUpload = async (files: File[]) => {
		const previousId = imageId;
		const id = await onUploadImage(files[0]!);
		onImageChange(id);
		if (previousId && previousId !== id) {
			await onDeleteImage(previousId);
		}
		notify(previousId ? 'Imagen actualizada' : 'Imagen subida');
	};

	const handleDelete = async () => {
		if (!imageId) return;
		await onDeleteImage(imageId);
		onImageChange(null);
		notify('Imagen eliminada');
	};

	return (
		<>
			<div className="space-y-5">
				{imageId && previewUrl ? (
					<div className="overflow-hidden rounded-xl border border-separator bg-surface-elevated">
						<div className="flex max-h-56 items-center justify-center bg-fill p-3 sm:max-h-64">
							<img
								src={previewUrl}
								alt={image?.name ?? `Imagen del ${entityLabel}`}
								className="max-h-48 w-full object-contain sm:max-h-56"
							/>
						</div>
						<div className="flex items-center justify-between gap-3 border-t border-separator p-3">
							<p className="text-xs text-foreground-muted">Foto del {entityLabel}</p>
							<Button
								type="button"
								variant="outline"
								size="sm"
								className="text-accent-orange"
								onClick={() => setConfirmDelete(true)}>
								<Trash2 className="h-4 w-4 shrink-0" aria-hidden />
								Eliminar
							</Button>
						</div>
					</div>
				) : (
					<div className="flex flex-col items-center rounded-xl border border-dashed border-border px-4 py-8 text-center">
						<span className="flex h-12 w-12 items-center justify-center rounded-full bg-fill text-foreground-muted">
							<ImageIcon className="h-6 w-6" aria-hidden />
						</span>
						<p className="mt-3 text-sm font-medium text-foreground">Sin imagen</p>
						<p className="mt-1 text-xs text-foreground-muted">
							Sube una foto para este {entityLabel}
						</p>
					</div>
				)}

				<div className="space-y-2">
					<p className="text-sm font-medium text-foreground">
						{imageId ? 'Cambiar imagen' : 'Subir imagen'}
					</p>
					<ImageUploader compact multiple={false} onUpload={handleUpload} />
				</div>
			</div>

			<ConfirmDialog
				open={confirmDelete}
				title="Eliminar imagen"
				description={`¿Seguro que quieres eliminar la foto de este ${entityLabel}?`}
				onConfirm={() => {
					void handleDelete();
					setConfirmDelete(false);
				}}
				onCancel={() => setConfirmDelete(false)}
			/>
		</>
	);
}
