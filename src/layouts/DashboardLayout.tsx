import { ClipboardList, EyeOff, FolderOpen, Package } from 'lucide-react';
import { NavLink, useLocation, type Location } from 'react-router-dom';
import { MobilePageLayout } from '../components/layout/MobilePageLayout.tsx';
import {
	CardDescription,
	CardHeader,
	CardTitle,
} from '../components/ui/Card.tsx';
import type { Category, Product } from '../types/index.ts';
import { cn } from '../utils/cn.ts';
import { formatDate } from '../utils/format.ts';

type DashboardLayoutProps = {
	products: Product[];
	categories: Category[];
	lastModified: string;
};

function isStatActive(to: string, location: Location): boolean {
	const params = new URLSearchParams(location.search);
	const hiddenFilter = params.get('filtro') === 'ocultos';

	if (to.includes('filtro=ocultos')) {
		return location.pathname === '/carta' && hiddenFilter;
	}
	if (to === '/carta') {
		return location.pathname === '/carta' && !hiddenFilter;
	}
	return location.pathname === to.split('?')[0];
}

export function DashboardLayout({
	products,
	categories,
	lastModified,
}: DashboardLayoutProps) {
	const location = useLocation();
	const hiddenProducts = products.filter((p) => !p.visible).length;

	const stats = [
		{
			label: 'Productos totales',
			value: products.length,
			icon: Package,
			color: 'text-primary',
			to: '/carta',
		},
		{
			label: 'Categorías',
			value: categories.length,
			icon: FolderOpen,
			color: 'text-info',
			to: '/categorias',
		},
		{
			label: 'Productos ocultos',
			value: hiddenProducts,
			icon: EyeOff,
			color: 'text-accent-orange',
			to: '/carta?filtro=ocultos',
		},
		{
			label: 'Última modificación',
			value: formatDate(lastModified),
			icon: ClipboardList,
			color: 'text-success',
			isText: true,
			to: '/carta',
		},
	];

	return (
		<MobilePageLayout>
			<div className="hidden lg:block">
				<h1 className="text-2xl font-bold text-foreground">Inicio</h1>
				<p className="mt-1 text-foreground-muted">Resumen de tu carta digital</p>
			</div>

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
				{stats.map(({ label, value, icon: Icon, color, isText, to }) => (
					<NavLink
						key={label}
						to={to}
						className={() =>
							cn(
								'block rounded-xl border border-separator bg-surface-elevated p-6 shadow-sm transition-colors',
								'hover:bg-fill active:scale-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
								isStatActive(to, location) &&
									'border-primary/30 ring-1 ring-primary/20',
							)
						}
						aria-label={`${label}: ${value}`}>
						<CardHeader className="mb-0">
							<div className="flex items-center justify-between">
								<CardDescription>{label}</CardDescription>
								<Icon className={`h-5 w-5 ${color}`} aria-hidden />
							</div>
							<CardTitle className={isText ? 'text-base font-medium' : 'text-3xl'}>
								{value}
							</CardTitle>
						</CardHeader>
					</NavLink>
				))}
			</div>
		</MobilePageLayout>
	);
}
