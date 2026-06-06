import { Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ConfirmDialog } from '../components/dialogs/ConfirmDialog.tsx';
import { MobilePageLayout } from '../components/layout/MobilePageLayout.tsx';
import { ImageUploader } from '../components/forms/ImageUploader.tsx';
import { Button } from '../components/ui/Button.tsx';
import type { MenuImage, Product } from '../types/index.ts';

type ImagesLayoutProps = {
	images: MenuImage[];
	products: Product[];
	onUploadImage: (file: File) => Promise<string>;
	onDeleteImage: (id: string) => void;
	onNotify: (message: string) => void;
};

export function ImagesLayout({
	images,
	products,
	onUploadImage,
	onDeleteImage,
	onNotify,
}: ImagesLayoutProps) {
	const [deleteId, setDeleteId] = useState<string | null>(null);

	const productCountByImage = useMemo(() => {
		const counts: Record<string, number> = {};
		for (const p of products) {
			if (p.imageId) {
				counts[p.imageId] = (counts[p.imageId] ?? 0) + 1;
			}
		}
		return counts;
	}, [products]);

	return (
		<MobilePageLayout>
			<div className="hidden lg:block">
				<h1 className="text-2xl font-bold text-foreground">Imágenes</h1>
				<p className="mt-1 text-sm text-foreground-muted">
					Biblioteca de imágenes para tus productos
				</p>
			</div>

			<ImageUploader
				onUpload={async (file) => {
					await onUploadImage(file);
					onNotify('Imagen subida');
				}}
			/>

			{images.length > 0 ? (
				<div className="grid grid-cols-1 gap-3 lg:grid-cols-3 xl:grid-cols-4">
					{images.map((image) => (
						<div
							key={image.id}
							className="overflow-hidden rounded-xl border border-separator bg-surface-elevated">
							<img
								src={image.url}
								alt={image.name}
								className="aspect-video w-full object-cover"
							/>
							<div className="flex items-center justify-between p-3">
								<div className="min-w-0">
									<p className="truncate font-medium text-foreground">{image.name}</p>
									<p className="text-xs text-foreground-muted">
										{productCountByImage[image.id] ?? 0} producto
										{(productCountByImage[image.id] ?? 0) !== 1 ? 's' : ''} asociado
										{(productCountByImage[image.id] ?? 0) !== 1 ? 's' : ''}
									</p>
								</div>
								<Button
									variant="ghost"
									size="icon"
									onClick={() => setDeleteId(image.id)}
									aria-label="Eliminar imagen">
									<Trash2 className="h-4 w-4 text-accent-orange" />
								</Button>
							</div>
						</div>
					))}
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
