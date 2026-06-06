import { useMemo } from 'react';
import type { PreviewDevice } from '../../types/index.ts';
import { useMenuStore } from '../../store/menuStore.ts';
import { cn } from '../../utils/cn.ts';
import { formatPrice } from '../../utils/format.ts';

type MenuPreviewProps = {
	device: PreviewDevice;
	className?: string;
};

const deviceWidths: Record<PreviewDevice, string> = {
	mobile: 'max-w-sm',
	tablet: 'max-w-2xl',
	desktop: 'max-w-4xl',
};

export function MenuPreview({ device, className }: MenuPreviewProps) {
	const products = useMenuStore((s) => s.products);
	const categories = useMenuStore((s) => s.categories);
	const settings = useMenuStore((s) => s.settings);
	const images = useMenuStore((s) => s.images);

	const imageMap = useMemo(
		() => Object.fromEntries(images.map((i) => [i.id, i.url])),
		[images],
	);

	const visibleCategories = useMemo(
		() =>
			[...categories]
				.filter((c) => c.visible)
				.sort((a, b) => a.order - b.order),
		[categories],
	);

	return (
		<div
			className={cn(
				'mx-auto w-full rounded-2xl border border-separator bg-surface-elevated shadow-lg',
				deviceWidths[device],
				className,
			)}
		>
			<header className="border-b border-separator p-6 text-center">
				{settings.logoUrl && (
					<img
						src={settings.logoUrl}
						alt=""
						className="mx-auto mb-3 h-16 w-16 rounded-full object-cover"
					/>
				)}
				<h1 className="text-2xl font-bold text-foreground">
					{settings.name || 'Mi Carta'}
				</h1>
				{settings.hours && (
					<p className="mt-1 text-sm text-foreground-muted">
						{settings.hours}
					</p>
				)}
			</header>

			<div className="p-4">
				{visibleCategories.map((category) => {
					const categoryProducts = products.filter(
						(p) => p.categoryId === category.id && p.visible,
					);
					if (categoryProducts.length === 0) return null;

					return (
						<section key={category.id} className="mb-8 last:mb-0">
							<h2 className="mb-4 border-b border-separator pb-2 text-lg font-semibold text-foreground">
								{category.name}
							</h2>
							<ul className="space-y-4">
								{categoryProducts.map((product) => (
									<li
										key={product.id}
										className="flex gap-4"
									>
										{product.imageId && imageMap[product.imageId] && (
											<img
												src={imageMap[product.imageId]}
												alt=""
												className="h-20 w-20 shrink-0 rounded-lg object-cover"
											/>
										)}
										<div className="min-w-0 flex-1">
											<div className="flex items-start justify-between gap-2">
												<span className="font-medium text-foreground">
													{product.name}
												</span>
												<span className="shrink-0 font-semibold text-primary">
													{formatPrice(product.price)}
												</span>
											</div>
											{product.shortDescription && (
												<p className="mt-1 text-sm text-foreground-muted">
													{product.shortDescription}
												</p>
											)}
										</div>
									</li>
								))}
							</ul>
						</section>
					);
				})}

				{visibleCategories.every(
					(c) =>
						!products.some(
							(p) => p.categoryId === c.id && p.visible,
						),
				) && (
					<p className="py-12 text-center text-foreground-muted">
						No hay productos visibles en la carta
					</p>
				)}
			</div>

			{(settings.phone || settings.address) && (
				<footer className="border-t border-separator p-4 text-center text-sm text-foreground-muted">
					{settings.phone && <p>{settings.phone}</p>}
					{settings.address && <p>{settings.address}</p>}
				</footer>
			)}
		</div>
	);
}
