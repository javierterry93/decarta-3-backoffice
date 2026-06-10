import { Check, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ConfirmDialog } from '../components/dialogs/ConfirmDialog.tsx';
import { ImageUploader } from '../components/forms/ImageUploader.tsx';
import {
	ListSearchEmpty,
	ListSearchInput,
} from '../components/forms/ListSearchInput.tsx';
import { Button } from '../components/ui/Button.tsx';
import { useImageObjectUrl } from '../hooks/useImageUrls.ts';
import type { Image } from '../types/index.ts';
import { isSearchActive, matchesSearchQuery } from '../utils/searchText.ts';
import { cn } from '../utils/cn.ts';

const LIBRARY_PAGE_SIZE = 12;

type EntityImageLayoutProps = {
	imageId: string | null;
	images: Image[];
	entityLabel?: string;
	onAssign: (imageId: string | null) => void;
	onUploadImage: (file: File) => Promise<string>;
	onDeleteImage: (id: string) => Promise<void>;
	onClose: () => void;
	onNotify?: (message: string) => void;
};

function ImagePreview({
	image,
	selected,
	onSelect,
}: {
	image: Image;
	selected: boolean;
	onSelect: () => void;
}) {
	const thumbnailUrl = useImageObjectUrl(image.id, 'thumb', image);

	return (
		<button
			type="button"
			onClick={onSelect}
			className={cn(
				'group relative overflow-hidden rounded-xl border bg-surface-elevated text-left transition-colors',
				selected
					? 'border-primary ring-2 ring-primary/30'
					: 'border-separator hover:border-primary/40',
			)}
			aria-label={image.name}
			aria-pressed={selected}>
			{thumbnailUrl ? (
				<img
					src={thumbnailUrl}
					alt=""
					className="aspect-square w-full object-cover"
				/>
			) : (
				<div className="flex aspect-square items-center justify-center bg-fill text-xs text-foreground-muted">
					Cargando…
				</div>
			)}
			{selected && (
				<span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
					<Check className="h-4 w-4" aria-hidden />
				</span>
			)}
			<p className="truncate px-2 py-1.5 text-xs font-medium text-foreground">
				{image.name}
			</p>
		</button>
	);
}

export function EntityImageLayout({
	imageId,
	images,
	entityLabel = 'elemento',
	onAssign,
	onUploadImage,
	onDeleteImage,
	onClose,
	onNotify,
}: EntityImageLayoutProps) {
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [query, setQuery] = useState('');
	const [visibleCount, setVisibleCount] = useState(LIBRARY_PAGE_SIZE);

	const currentImage = useMemo(
		() => (imageId ? images.find((image) => image.id === imageId) : undefined),
		[imageId, images],
	);

	const currentPreviewUrl = useImageObjectUrl(imageId, 'full', currentImage);

	const sortedImages = useMemo(
		() => [...images].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
		[images],
	);

	const filteredImages = useMemo(() => {
		if (!isSearchActive(query)) return sortedImages;
		return sortedImages.filter((image) => matchesSearchQuery(image.name, query));
	}, [sortedImages, query]);

	const visibleImages = filteredImages.slice(0, visibleCount);

	useEffect(() => {
		setVisibleCount(LIBRARY_PAGE_SIZE);
	}, [query]);

	const notify = (message: string) => onNotify?.(message);

	return (
		<div className="flex min-h-0 flex-1 flex-col">
			<div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-0.5 pb-4">
				{currentImage && currentPreviewUrl ? (
					<div className="overflow-hidden rounded-xl border border-separator bg-surface-elevated">
						<img
							src={currentPreviewUrl}
							alt={currentImage.name}
							className="aspect-video w-full object-cover"
						/>
						<div className="flex items-center justify-between gap-3 p-3">
							<div className="min-w-0">
								<p className="truncate font-medium text-foreground">
									{currentImage.name}
								</p>
								<p className="text-xs text-foreground-muted">
									Imagen asignada a {entityLabel}
								</p>
							</div>
							<div className="flex shrink-0 gap-2">
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => {
										onAssign(null);
										notify('Imagen quitada');
									}}>
									Quitar
								</Button>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									onClick={() => setDeleteId(currentImage.id)}
									aria-label="Eliminar imagen">
									<Trash2 className="h-4 w-4 text-accent-orange" />
								</Button>
							</div>
						</div>
					</div>
				) : (
					<p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-foreground-muted">
						Este {entityLabel} aún no tiene imagen.
					</p>
				)}

				<div className="space-y-2">
					<p className="text-sm font-medium text-foreground">
						{currentImage ? 'Reemplazar imagen' : 'Subir imagen'}
					</p>
					<ImageUploader
						compact
						multiple={false}
						onUpload={async (files) => {
							const id = await onUploadImage(files[0]!);
							onAssign(id);
							notify('Imagen subida');
						}}
					/>
				</div>

				{sortedImages.length > 0 && (
					<div className="space-y-3 border-t border-separator pt-5">
						<div>
							<p className="text-sm font-medium text-foreground">Biblioteca</p>
							<p className="text-xs text-foreground-muted">
								Elige una imagen existente para {entityLabel}
							</p>
						</div>
						<ListSearchInput
							value={query}
							onChange={setQuery}
							placeholder="Buscar imágenes…"
						/>
						{filteredImages.length === 0 ? (
							<ListSearchEmpty query={query} />
						) : (
							<>
								<div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
									{visibleImages.map((image) => (
										<ImagePreview
											key={image.id}
											image={image}
											selected={image.id === imageId}
											onSelect={() => {
												onAssign(image.id);
												notify('Imagen asignada');
											}}
										/>
									))}
								</div>
								{visibleCount < filteredImages.length && (
									<div className="flex justify-center">
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() =>
												setVisibleCount((count) => count + LIBRARY_PAGE_SIZE)
											}>
											Cargar más ({filteredImages.length - visibleCount} restantes)
										</Button>
									</div>
								)}
							</>
						)}
					</div>
				)}
			</div>

			<div className="flex shrink-0 border-t border-separator pt-4">
				<Button
					type="button"
					onClick={onClose}
					className="w-full lg:ml-auto lg:w-auto">
					Listo
				</Button>
			</div>

			<ConfirmDialog
				open={deleteId !== null}
				title="Eliminar imagen"
				description="¿Seguro? Se quitará de los productos que la usen."
				onConfirm={() => {
					if (deleteId) {
						void onDeleteImage(deleteId).then(() => {
							if (deleteId === imageId) onAssign(null);
							notify('Imagen eliminada');
						});
					}
					setDeleteId(null);
				}}
				onCancel={() => setDeleteId(null)}
			/>
		</div>
	);
}
