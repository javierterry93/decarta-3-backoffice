import type { MenuApiClient } from './menuApiClient.ts';
import type { MenuApiMode } from './types.ts';
import { createHttpMenuApiClient } from './httpMenuApiClient.ts';
import { localMenuApiClient } from './localMenuApiClient.ts';

let client: MenuApiClient | null = null;

export function getMenuApiMode(): MenuApiMode {
	const mode = import.meta.env.VITE_MENU_API;
	return mode === 'remote' ? 'remote' : 'local';
}

export function getMenuApiClient(): MenuApiClient {
	if (client) return client;

	client =
		getMenuApiMode() === 'remote'
			? createHttpMenuApiClient(import.meta.env.VITE_API_BASE_URL ?? '/api')
			: localMenuApiClient;

	return client;
}

/** Solo para tests o sustitución del cliente en runtime. */
export function setMenuApiClient(next: MenuApiClient | null): void {
	client = next;
}
