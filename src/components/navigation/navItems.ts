export type RouteNavItem = {
	type: 'route';
	to: string;
	label: string;
	end?: boolean;
};

export type HashNavItem = {
	type: 'hash';
	to: string;
	hash: string;
	label: string;
};

export type NavItem = RouteNavItem | HashNavItem;

export const navItems: NavItem[] = [
	{ type: 'route', to: '/', label: 'Inicio', end: true },
	{ type: 'route', to: '/pruebas', label: 'Pruebas' },
	{ type: 'hash', to: '/', hash: 'servicios', label: 'Servicios' },
];

export function desktopNavLinkClass(isActive: boolean) {
	return [
		'rounded-full px-3 py-2 text-sm font-medium transition',
		isActive
			? 'bg-fill text-primary'
			: 'text-foreground-muted hover:bg-fill hover:text-foreground',
	]
		.filter(Boolean)
		.join(' ');
}

export function mobileNavLinkClass(isActive: boolean) {
	return [
		'block w-full rounded-2xl px-4 py-3.5 text-left text-body-lg font-medium transition',
		isActive ? 'bg-fill text-primary' : 'text-foreground hover:bg-fill',
	]
		.filter(Boolean)
		.join(' ');
}
