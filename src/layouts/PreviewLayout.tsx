import { Monitor, Smartphone, Tablet } from 'lucide-react';
import { useState } from 'react';
import { MenuPreview } from '../components/forms/MenuPreview.tsx';
import { MobilePageLayout } from '../components/layout/MobilePageLayout.tsx';
import { Button } from '../components/ui/Button.tsx';
import type {
	BusinessSettings,
	Category,
	MenuImage,
	PreviewDevice,
	Product,
} from '../types/index.ts';
import { cn } from '../utils/cn.ts';

const devices: { id: PreviewDevice; label: string; icon: typeof Monitor }[] =
	[
		{ id: 'mobile', label: 'Móvil', icon: Smartphone },
		{ id: 'tablet', label: 'Tablet', icon: Tablet },
		{ id: 'desktop', label: 'Escritorio', icon: Monitor },
	];

type PreviewLayoutProps = {
	products: Product[];
	categories: Category[];
	settings: BusinessSettings;
	images: MenuImage[];
};

export function PreviewLayout({
	products,
	categories,
	settings,
	images,
}: PreviewLayoutProps) {
	const [device, setDevice] = useState<PreviewDevice>('mobile');

	return (
		<MobilePageLayout>
			<div className="space-y-4 lg:flex lg:flex-row lg:items-center lg:justify-between">
			<div className="hidden lg:block">
					<h1 className="text-2xl font-bold text-foreground">
						Vista previa
					</h1>
					<p className="mt-1 text-sm text-foreground-muted">
						Así verá tu carta el cliente
					</p>
				</div>
				<div className="hidden gap-2 lg:flex">
					{devices.map(({ id, label, icon: Icon }) => (
						<Button
							key={id}
							variant={device === id ? 'default' : 'outline'}
							size="sm"
							onClick={() => setDevice(id)}
						>
							<Icon className="h-4 w-4" />
							{label}
						</Button>
					))}
				</div>
			</div>

			<div className="rounded-2xl bg-fill p-3 lg:hidden">
				<MenuPreview
					device="mobile"
					products={products}
					categories={categories}
					settings={settings}
					images={images}
				/>
			</div>

			<div
				className={cn(
					'hidden rounded-2xl bg-fill p-4 lg:block lg:p-8',
					device === 'mobile' && 'flex justify-center',
				)}
			>
				<MenuPreview
					device={device}
					products={products}
					categories={categories}
					settings={settings}
					images={images}
				/>
			</div>
		</MobilePageLayout>
	);
}
