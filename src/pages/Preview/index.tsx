import { Monitor, Smartphone, Tablet } from 'lucide-react';
import { useState } from 'react';
import { MenuPreview } from '../../components/forms/MenuPreview.tsx';
import { Button } from '../../components/ui/Button.tsx';
import type { PreviewDevice } from '../../types/index.ts';
import { cn } from '../../utils/cn.ts';

const devices: { id: PreviewDevice; label: string; icon: typeof Monitor }[] =
	[
		{ id: 'mobile', label: 'Móvil', icon: Smartphone },
		{ id: 'tablet', label: 'Tablet', icon: Tablet },
		{ id: 'desktop', label: 'Escritorio', icon: Monitor },
	];

export default function PreviewPage() {
	const [device, setDevice] = useState<PreviewDevice>('mobile');

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold text-foreground">
						Vista previa
					</h1>
					<p className="mt-1 text-sm text-foreground-muted">
						Así verá tu carta el cliente · Se actualiza al instante
					</p>
				</div>
				<div className="flex gap-2">
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

			<div
				className={cn(
					'rounded-2xl bg-fill p-4 lg:p-8',
					device === 'mobile' && 'flex justify-center',
				)}
			>
				<MenuPreview device={device} />
			</div>
		</div>
	);
}
