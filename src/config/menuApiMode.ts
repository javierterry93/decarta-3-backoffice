export type MenuApiMode = 'localStorage' | 'supabase' | 'remote';

export function resolveMenuApiMode(): MenuApiMode {
	const raw = import.meta.env.VITE_MENU_API ?? 'localStorage';

	switch (raw) {
		case 'remote':
			return 'remote';
		case 'supabase':
		case 'database':
			return 'supabase';
		case 'localStorage':
		case 'local':
			return 'localStorage';
		default:
			throw new Error(`VITE_MENU_API no soportado: ${raw}`);
	}
}

export function usesRemoteImageUrls(mode: MenuApiMode = resolveMenuApiMode()): boolean {
	return mode === 'remote' || mode === 'supabase';
}
