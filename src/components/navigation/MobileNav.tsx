import { useEffect, useId, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
	mobileNavLinkClass,
	navItems,
	type HashNavItem,
} from './navItems.ts';

function MenuIcon({ open }: { open: boolean }) {
	return (
		<svg
			className="h-5 w-5 text-foreground"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.75"
			strokeLinecap="round"
			aria-hidden
		>
			{open ? (
				<>
					<path d="M6 6l12 12" />
					<path d="M18 6L6 18" />
				</>
			) : (
				<>
					<path d="M4 7h16" />
					<path d="M4 12h16" />
					<path d="M4 17h16" />
				</>
			)}
		</svg>
	);
}

function isHashItemActive(item: HashNavItem, pathname: string, hash: string) {
	return pathname === item.to && hash === `#${item.hash}`;
}

export function MobileNav() {
	const [open, setOpen] = useState(false);
	const panelId = useId();
	const { pathname, hash } = useLocation();

	useEffect(() => {
		setOpen(false);
	}, [pathname, hash]);

	useEffect(() => {
		document.body.style.overflow = open ? 'hidden' : '';
		return () => {
			document.body.style.overflow = '';
		};
	}, [open]);

	useEffect(() => {
		if (!open) return;

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') setOpen(false);
		};

		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, [open]);

	return (
		<div className="md:hidden">
			<button
				type="button"
				className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition hover:bg-fill active:scale-press"
				aria-expanded={open}
				aria-controls={panelId}
				aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
				onClick={() => setOpen((value) => !value)}
			>
				<MenuIcon open={open} />
			</button>

			{open ? (
				<>
					<button
						type="button"
						className="fixed inset-0 z-40 bg-shadow/20 backdrop-blur-overlay"
						aria-label="Cerrar menú"
						onClick={() => setOpen(false)}
					/>
					<nav
						id={panelId}
						className="fixed inset-x-0 top-site-header z-50 border-b border-separator bg-surface-elevated/95 px-4 py-3 shadow-lg shadow-shadow/5 backdrop-blur-xl backdrop-saturate-150"
						aria-label="Navegación móvil"
					>
						<ul className="flex flex-col gap-1">
							{navItems.map((item) =>
								item.type === 'route' ? (
									<li key={item.to + item.label}>
										<NavLink
											to={item.to}
											end={item.end}
											className={({ isActive }) =>
												mobileNavLinkClass(isActive)
											}
											onClick={() => setOpen(false)}
										>
											{item.label}
										</NavLink>
									</li>
								) : (
									<li key={item.hash + item.label}>
										<NavLink
											to={{ pathname: item.to, hash: `#${item.hash}` }}
											className={() =>
												mobileNavLinkClass(
													isHashItemActive(item, pathname, hash),
												)
											}
											onClick={() => setOpen(false)}
										>
											{item.label}
										</NavLink>
									</li>
								),
							)}
						</ul>
					</nav>
				</>
			) : null}
		</div>
	);
}
