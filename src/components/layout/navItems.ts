import {
	ClipboardList,
	FolderOpen,
	LayoutDashboard,
	Settings,
} from 'lucide-react';

export const primaryNavItems = [
	{ to: '/', label: 'Inicio', icon: LayoutDashboard, end: true as const },
	{ to: '/carta', label: 'Carta', icon: ClipboardList, end: false as const },
	{
		to: '/categorias',
		label: 'Categorías',
		icon: FolderOpen,
		end: false as const,
	},
] as const;

export const secondaryNavItems = [
	{
		to: '/configuracion',
		label: 'Configuración',
		icon: Settings,
		end: false as const,
	},
] as const;

export const navItems = [...primaryNavItems, ...secondaryNavItems] as const;

export const pageTitles: Record<string, string> = {
	'/': 'Inicio',
	'/carta': 'Carta',
	'/categorias': 'Categorías',
	'/configuracion': 'Configuración',
};

export function getPageTitle(pathname: string, search: string): string {
	if (
		pathname === '/carta' &&
		new URLSearchParams(search).get('filtro') === 'ocultos'
	) {
		return 'Productos ocultos';
	}
	return pageTitles[pathname] ?? 'Mi Carta';
}
