import { LogOut, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSupabaseAuth } from '../../auth/SupabaseAuthGate.tsx';
import { cn } from '../../utils/cn.ts';
import { Button } from '../ui/Button.tsx';
import { navItems, getPageTitle } from './navItems.ts';

const DRAWER_DURATION_MS = 200;

function useDrawerTransition(open: boolean) {
	const [mounted, setMounted] = useState(open);
	const [visible, setVisible] = useState(open);

	useEffect(() => {
		if (open) {
			setMounted(true);
			const frame = requestAnimationFrame(() => setVisible(true));
			return () => cancelAnimationFrame(frame);
		}
		setVisible(false);
		const timer = window.setTimeout(() => setMounted(false), DRAWER_DURATION_MS);
		return () => window.clearTimeout(timer);
	}, [open]);

	return { mounted, visible };
}

function LogoutButton({
	className,
	onAfterLogout,
}: {
	className?: string;
	onAfterLogout?: () => void;
}) {
	const auth = useSupabaseAuth();
	if (!auth) return null;

	return (
		<Button
			type="button"
			variant="ghost"
			className={cn(
				'w-full justify-start gap-3 text-foreground-muted hover:text-foreground',
				className,
			)}
			onClick={() => {
				void auth.signOut().then(() => onAfterLogout?.());
			}}>
			<LogOut className="h-5 w-5 shrink-0" aria-hidden />
			Cerrar sesión
		</Button>
	);
}

function Sidebar() {
	return (
		<aside className="hidden w-64 shrink-0 flex-col border-r border-separator bg-surface-elevated lg:flex">
			<div className="flex h-site-header items-center border-b border-separator px-4">
				<span className="text-lg font-semibold text-foreground">Mi Carta</span>
			</div>
			<nav className="flex-1 space-y-1 p-3" aria-label="Menú principal">
				{navItems.map(({ to, label, icon: Icon, end }) => (
					<NavLink
						key={to}
						to={to}
						end={end}
						className={({ isActive }) =>
							cn(
								'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
								isActive
									? 'bg-primary text-on-primary'
									: 'text-foreground-muted hover:bg-fill hover:text-foreground',
							)
						}>
						<Icon className="h-5 w-5 shrink-0" aria-hidden />
						{label}
					</NavLink>
				))}
			</nav>
			<div className="border-t border-separator p-3">
				<LogoutButton />
			</div>
		</aside>
	);
}

function MobileNavDrawer({
	open,
	onClose,
}: {
	open: boolean;
	onClose: () => void;
}) {
	const { mounted, visible } = useDrawerTransition(open);

	if (!mounted) return null;

	return (
		<div className="fixed inset-0 z-50 lg:hidden" role="presentation">
			<button
				type="button"
				className={cn(
					'absolute inset-0 bg-shadow/40 backdrop-blur-overlay transition-opacity ease-out',
					visible ? 'opacity-100' : 'opacity-0',
				)}
				style={{ transitionDuration: `${DRAWER_DURATION_MS}ms` }}
				onClick={onClose}
				aria-label="Cerrar menú"
			/>
			<aside
				id="mobile-nav-menu"
				aria-label="Menú principal"
				aria-hidden={!visible}
				className={cn(
					'absolute inset-y-0 left-0 flex w-4/5 flex-col border-r border-separator bg-surface-elevated shadow-lg transition-transform ease-out',
					'pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]',
					visible ? 'translate-x-0' : '-translate-x-full',
				)}
				style={{ transitionDuration: `${DRAWER_DURATION_MS}ms` }}>
				<div className="flex h-site-header shrink-0 items-center justify-between border-b border-separator px-3">
					<span className="text-lg font-semibold text-foreground">Mi Carta</span>
					<Button
						variant="ghost"
						size="icon"
						onClick={onClose}
						aria-label="Cerrar menú">
						<X className="h-5 w-5" aria-hidden />
					</Button>
				</div>
				<nav className="flex-1 overflow-y-auto p-3">
					<ul className="space-y-1">
						{navItems.map(({ to, label, icon: Icon, end }) => (
							<li key={to}>
								<NavLink
									to={to}
									end={end}
									onClick={onClose}
									className={({ isActive }) =>
										cn(
											'flex min-h-12 items-center gap-3 rounded-xl px-3 text-base font-medium transition-colors',
											isActive
												? 'bg-primary text-on-primary'
												: 'text-foreground hover:bg-fill',
										)
									}>
									<Icon className="h-5 w-5 shrink-0" aria-hidden />
									{label}
								</NavLink>
							</li>
						))}
					</ul>
				</nav>
				<div className="shrink-0 border-t border-separator p-3">
					<LogoutButton
						className="min-h-12 rounded-xl text-base"
						onAfterLogout={onClose}
					/>
				</div>
			</aside>
		</div>
	);
}

function MobileHeader({
	menuOpen,
	onToggleMenu,
	onCloseMenu,
}: {
	menuOpen: boolean;
	onToggleMenu: () => void;
	onCloseMenu: () => void;
}) {
	const { pathname, search } = useLocation();
	const title = getPageTitle(pathname, search);

	return (
		<>
			<header className="flex h-site-header shrink-0 items-center gap-3 border-b border-separator bg-surface-elevated px-3 lg:hidden">
				<Button
					variant="ghost"
					size="icon"
					onClick={onToggleMenu}
					aria-expanded={menuOpen}
					aria-controls="mobile-nav-menu"
					aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}>
					<Menu className="h-5 w-5" aria-hidden />
				</Button>
				<h1 className="min-w-0 flex-1 truncate text-base font-semibold text-foreground">
					{title}
				</h1>
			</header>
			<MobileNavDrawer open={menuOpen} onClose={onCloseMenu} />
		</>
	);
}

type AppLayoutProps = {
	children: React.ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
	const [menuOpen, setMenuOpen] = useState(false);
	const { pathname } = useLocation();

	useEffect(() => {
		setMenuOpen(false);
	}, [pathname]);

	useEffect(() => {
		if (!menuOpen) return;
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') setMenuOpen(false);
		};
		document.body.style.overflow = 'hidden';
		window.addEventListener('keydown', onKeyDown);
		return () => {
			document.body.style.overflow = '';
			window.removeEventListener('keydown', onKeyDown);
		};
	}, [menuOpen]);

	return (
		<div className="flex min-h-dvh bg-surface">
			<Sidebar />
			<div className="flex min-w-0 flex-1 flex-col">
				<MobileHeader
					menuOpen={menuOpen}
					onToggleMenu={() => setMenuOpen((open) => !open)}
					onCloseMenu={() => setMenuOpen(false)}
				/>
				<main className="flex-1 overflow-x-hidden overflow-y-auto py-4 max-lg:px-3 lg:py-6">
					<div className="lg:container">{children}</div>
				</main>
			</div>
		</div>
	);
}
