import { Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ConfirmDialog } from '../components/dialogs/ConfirmDialog.tsx';
import { ImageUploader } from '../components/forms/ImageUploader.tsx';
import {
	ListSearchEmpty,
	ListSearchInput,
} from '../components/forms/ListSearchInput.tsx';
import { MobilePageLayout } from '../components/layout/MobilePageLayout.tsx';
import { Button } from '../components/ui/Button.tsx';
import { useImageObjectUrl } from '../hooks/useImageUrls.ts';
import type { MenuImage, Product } from '../types/index.ts';
import { formatDate } from '../utils/format.ts';
import { isSearchActive, matchesSearchQuery } from '../utils/searchText.ts';

const PAGE_SIZE = 24;

type ImagesLayoutProps = {
	images: MenuImage[];
	products: Product[];
	onUploadImages: (files: File[]) => Promise<void>;
	onDeleteImage: (id: string) => void;
	onNotify: (message: string) => void;
};

function ImageCard({
	image,
	productCount,
	onDelete,
}: {
	image: MenuImage;
	productCount: number;
	onDelete: () => void;
}) {
	const thumbnailUrl = useImageObjectUrl(image.id, 'thumb', image);

	return (
		<div className="overflow-hidden rounded-xl border border-separator bg-surface-elevated">
			{thumbnailUrl ? (
				<img
					src={thumbnailUrl}
					alt={image.name}
					className="aspect-video w-full object-cover"
				/>
			) : (
				<div className="flex aspect-video items-center justify-center bg-fill text-xs text-foreground-muted">
					Cargando…
				</div>
			)}
			<div className="flex items-center justify-between gap-2 p-3">
				<div className="min-w-0">
					<p className="truncate font-medium text-foreground">{image.name}</p>
					<p className="text-xs text-foreground-muted">
						{formatDate(image.createdAt)} · {productCount} producto
						{productCount !== 1 ? 's' : ''}
					</p>
				</div>
				<Button
					variant="ghost"
					size="icon"
					onClick={onDelete}
					aria-label="Eliminar imagen">
					<Trash2 className="h-4 w-4 text-accent-orange" />
				</Button>
			</div>
		</div>
	);
}

export function ImagesLayout({
	images,
	products,
	onUploadImages,
	onDeleteImage,
	onNotify,
}: ImagesLayoutProps) {
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
	const [query, setQuery] = useState('');

	const sortedImages = useMemo(
		() => [...images].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
		[images],
	);

	const productCountByImage = useMemo(() => {
		const counts: Record<string, number> = {};
		for (const p of products) {
			if (p.imageId) {
				counts[p.imageId] = (counts[p.imageId] ?? 0) + 1;
			}
		}
		return counts;
	}, [products]);

	const filteredImages = useMemo(() => {
		if (!isSearchActive(query)) return sortedImages;
		return sortedImages.filter(
			(image) =>
				matchesSearchQuery(image.name, query) ||
				matchesSearchQuery(String(productCountByImage[image.id] ?? 0), query),
		);
	}, [sortedImages, query, productCountByImage]);

	const visibleImages = filteredImages.slice(0, visibleCount);

	useEffect(() => {
		setVisibleCount(PAGE_SIZE);
	}, [query]);

	return (
		<MobilePageLayout>
			<div className="hidden lg:block">
				<h1 className="text-2xl font-bold text-foreground">Imágenes</h1>
				<p className="mt-1 text-sm text-foreground-muted">
					Biblioteca de imágenes · {images.length} en total
				</p>
			</div>

			<p className="text-sm text-foreground-muted lg:hidden">
				{images.length} imagen{images.length !== 1 ? 'es' : ''} en la biblioteca
			</p>

			<ImageUploader
				onUpload={async (files) => {
					await onUploadImages(files);
					onNotify(
						files.length === 1 ? 'Imagen subida' : `${files.length} imágenes subidas`,
					);
				}}
			/>

			{sortedImages.length > 0 ? (
				<div className="space-y-4">
					<ListSearchInput
						value={query}
						onChange={setQuery}
						placeholder="Buscar imágenes…"
					/>
					{filteredImages.length === 0 ? (
						<ListSearchEmpty query={query} />
					) : (
						<>
							<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
								{visibleImages.map((image) => (
									<ImageCard
										key={image.id}
										image={image}
										productCount={productCountByImage[image.id] ?? 0}
										onDelete={() => setDeleteId(image.id)}
									/>
								))}
							</div>
							{visibleCount < filteredImages.length && (
								<div className="flex justify-center">
									<Button
										variant="outline"
										onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>
										Cargar más ({filteredImages.length - visibleCount} restantes)
									</Button>
								</div>
							)}
						</>
					)}
				</div>
			) : (
				<p className="text-center text-foreground-muted">
					Aún no hay imágenes. Sube la primera arriba.
				</p>
			)}

			<ConfirmDialog
				open={deleteId !== null}
				title="Eliminar imagen"
				description="¿Seguro? Se quitará de los productos que la usen."
				onConfirm={() => {
					if (deleteId) {
						onDeleteImage(deleteId);
						onNotify('Imagen eliminada');
					}
					setDeleteId(null);
				}}
				onCancel={() => setDeleteId(null)}
			/>
		</MobilePageLayout>
	);
}
