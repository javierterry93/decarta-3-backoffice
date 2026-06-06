import {
	ClipboardList,
	Eye,
	FolderOpen,
	Image,
	LayoutDashboard,
	Menu,
	Settings,
	X,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../utils/cn.ts';
import { Button } from '../ui/Button.tsx';

const navItems = [
	{ to: '/', label: 'Inicio', icon: LayoutDashboard, end: true },
	{ to: '/carta', label: 'Carta', icon: ClipboardList },
	{ to: '/categorias', label: 'Categorías', icon: FolderOpen },
	{ to: '/imagenes', label: 'Imágenes', icon: Image },
	{ to: '/vista-previa', label: 'Vista previa', icon: Eye },
	{ to: '/configuracion', label: 'Configuración', icon: Settings },
];

type SidebarProps = {
	open: boolean;
	onClose: () => void;
};

export function Sidebar({ open, onClose }: SidebarProps) {
	return (
		<>
			{open && (
				<button
					type="button"
					className="fixed inset-0 z-40 bg-shadow/30 backdrop-blur-overlay lg:hidden"
					onClick={onClose}
					aria-label="Cerrar menú"
				/>
			)}

			<aside
				className={cn(
					'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-separator bg-surface-elevated transition-transform lg:static lg:translate-x-0',
					open ? 'translate-x-0' : '-translate-x-full',
				)}
			>
				<div className="flex h-site-header items-center justify-between border-b border-separator px-4">
					<span className="text-lg font-semibold text-foreground">
						Mi Carta
					</span>
					<Button
						variant="ghost"
						size="icon"
						className="lg:hidden"
						onClick={onClose}
						aria-label="Cerrar menú"
					>
						<X className="h-5 w-5" />
					</Button>
				</div>

				<nav className="flex-1 space-y-1 p-3" aria-label="Menú principal">
					{navItems.map(({ to, label, icon: Icon, end }) => (
						<NavLink
							key={to}
							to={to}
							end={end}
							onClick={onClose}
							className={({ isActive }) =>
								cn(
									'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
									isActive
										? 'bg-primary text-on-primary'
										: 'text-foreground-muted hover:bg-fill hover:text-foreground',
								)
							}
						>
							<Icon className="h-5 w-5 shrink-0" aria-hidden />
							{label}
						</NavLink>
					))}
				</nav>
			</aside>
		</>
	);
}

type AppLayoutProps = {
	children: React.ReactNode;
	sidebarOpen: boolean;
	onToggleSidebar: () => void;
	onCloseSidebar: () => void;
};

export function AppLayout({
	children,
	sidebarOpen,
	onToggleSidebar,
	onCloseSidebar,
}: AppLayoutProps) {
	return (
		<div className="flex min-h-screen bg-surface">
			<Sidebar open={sidebarOpen} onClose={onCloseSidebar} />

			<div className="flex min-w-0 flex-1 flex-col">
				<header className="flex h-site-header items-center gap-3 border-b border-separator bg-surface-elevated px-4 lg:hidden">
					<Button
						variant="ghost"
						size="icon"
						onClick={onToggleSidebar}
						aria-label="Abrir menú"
					>
						<Menu className="h-5 w-5" />
					</Button>
					<span className="font-semibold text-foreground">Mi Carta</span>
				</header>

				<main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
			</div>
		</div>
	);
}
