import { NavLink } from 'react-router-dom';
import { MobileNav } from './MobileNav.tsx';
import { desktopNavLinkClass, navItems } from './navItems.ts';

export function SiteHeader() {
	return (
		<header className="sticky top-0 z-50 h-site-header border-b border-separator bg-surface-elevated/80 backdrop-blur-xl backdrop-saturate-150">
			<div className="container flex h-full items-center justify-between gap-4">
				<span className="text-sm font-semibold tracking-tight text-foreground">
					Zenda
				</span>

				<nav
					className="hidden gap-1 md:flex"
					aria-label="Navegación principal"
				>
					{navItems
						.filter((item) => item.type === 'route')
						.map((item) => (
							<NavLink
								key={item.to + item.label}
								to={item.to}
								end={item.end}
								className={({ isActive }) => desktopNavLinkClass(isActive)}
							>
								{item.label}
							</NavLink>
						))}
				</nav>

				<MobileNav />
			</div>
		</header>
	);
}
