import { AlertTriangle, EyeOff, FolderOpen, Package } from 'lucide-react';
import { NavLink, useLocation, type Location } from 'react-router-dom';
import { useMemo } from 'react';
import { MobilePageLayout } from '../components/layout/MobilePageLayout.tsx';
import {
	CardDescription,
	CardHeader,
	CardTitle,
} from '../components/ui/Card.tsx';
import type { Category, Product } from '../types/index.ts';
import { cn } from '../utils/cn.ts';
import { formatDate } from '../utils/format.ts';
import {
	getProductIssues,
	productIssueLabels,
} from '../utils/productValidation.ts';

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

	const incompleteProducts = useMemo(
		() =>
			products
				.map((product) => ({ product, issues: getProductIssues(product) }))
				.filter(({ issues }) => issues.length > 0),
		[products],
	);

	const categoryNames = useMemo(
		() =>
			Object.fromEntries(
				categories.map((category) => [category.id, category.name]),
			),
		[categories],
	);

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
	];

	return (
		<MobilePageLayout>
			<div className="space-y-1">
				<h1 className="hidden text-2xl font-bold text-foreground lg:block">
					Inicio
				</h1>
				<div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
					<p className="text-sm text-foreground-muted lg:text-base">
						Resumen de tu carta digital
					</p>
					<p className="shrink-0 text-sm text-foreground-muted">
						Última modificación:{' '}
						<span className="font-medium text-foreground">
							{formatDate(lastModified)}
						</span>
					</p>
				</div>
			</div>

			{incompleteProducts.length > 0 && (
				<div className="rounded-xl border border-accent-orange/20 bg-accent-orange/5 px-4 py-4">
					<div className="flex gap-3">
						<AlertTriangle
							className="mt-0.5 h-5 w-5 shrink-0 text-accent-orange"
							aria-hidden
						/>
						<div className="min-w-0 flex-1 space-y-3">
							<div>
								<p className="font-medium text-foreground">
									Productos con datos incompletos
								</p>
								<p className="mt-1 text-sm text-foreground-muted">
									{incompleteProducts.length === 1
										? 'Hay 1 producto sin nombre o sin precio.'
										: `Hay ${incompleteProducts.length} productos sin nombre o sin precio.`}{' '}
									Revísalos en la carta antes de publicar.
								</p>
							</div>
							<ul className="space-y-2">
								{incompleteProducts.map(({ product, issues }) => (
									<li key={product.id}>
										<NavLink
											to={`/carta?editar=${product.id}`}
											className="flex flex-col gap-1 rounded-lg border border-accent-orange/15 bg-surface-elevated px-3 py-2 text-sm transition-colors hover:bg-fill sm:flex-row sm:items-center sm:justify-between">
											<span className="min-w-0 truncate font-medium text-foreground">
												{product.name.trim() || 'Sin nombre'}
												<span className="font-normal text-foreground-muted">
													{' '}
													· {categoryNames[product.categoryId] || 'Sin categoría'}
												</span>
											</span>
											<span className="flex shrink-0 flex-wrap gap-1.5">
												{issues.map((issue) => (
													<span
														key={issue}
														className="rounded-full bg-accent-orange/10 px-2 py-0.5 text-xs font-medium text-accent-orange">
														{productIssueLabels[issue]}
													</span>
												))}
											</span>
										</NavLink>
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>
			)}

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
				{stats.map(({ label, value, icon: Icon, color, to }) => (
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
							<CardTitle className="text-3xl">{value}</CardTitle>
						</CardHeader>
					</NavLink>
				))}
			</div>
		</MobilePageLayout>
	);
}
