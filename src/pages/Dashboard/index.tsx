import {
	ClipboardList,
	EyeOff,
	FolderOpen,
	Package,
} from 'lucide-react';
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from '../../components/ui/Card.tsx';
import { useMenuStore } from '../../store/menuStore.ts';
import { formatDate } from '../../utils/format.ts';

export default function DashboardPage() {
	const products = useMenuStore((s) => s.products);
	const categories = useMenuStore((s) => s.categories);
	const lastModified = useMenuStore((s) => s.lastModified);

	const hiddenProducts = products.filter((p) => !p.visible).length;

	const stats = [
		{
			label: 'Productos totales',
			value: products.length,
			icon: Package,
			color: 'text-primary',
		},
		{
			label: 'Categorías',
			value: categories.length,
			icon: FolderOpen,
			color: 'text-info',
		},
		{
			label: 'Productos ocultos',
			value: hiddenProducts,
			icon: EyeOff,
			color: 'text-accent-orange',
		},
		{
			label: 'Última modificación',
			value: formatDate(lastModified),
			icon: ClipboardList,
			color: 'text-success',
			isText: true,
		},
	];

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold text-foreground">Inicio</h1>
				<p className="mt-1 text-foreground-muted">
					Resumen de tu carta digital
				</p>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{stats.map(({ label, value, icon: Icon, color, isText }) => (
					<Card key={label}>
						<CardHeader className="mb-0">
							<div className="flex items-center justify-between">
								<CardDescription>{label}</CardDescription>
								<Icon className={`h-5 w-5 ${color}`} aria-hidden />
							</div>
							<CardTitle
								className={
									isText ? 'text-base font-medium' : 'text-3xl'
								}
							>
								{value}
							</CardTitle>
						</CardHeader>
					</Card>
				))}
			</div>
		</div>
	);
}
