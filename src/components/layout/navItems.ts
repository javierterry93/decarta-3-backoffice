import {
	ClipboardList,
	Eye,
	FolderOpen,
	Image,
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
	{ to: '/imagenes', label: 'Imágenes', icon: Image, end: false as const },
] as const;

export const secondaryNavItems = [
	{ to: '/vista-previa', label: 'Vista previa', icon: Eye, end: false as const },
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
	'/imagenes': 'Imágenes',
	'/vista-previa': 'Vista previa',
	'/configuracion': 'Configuración',
};
