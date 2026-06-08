import type { MenuApiClient } from './menuApiClient.ts';
import {
	connectDatabaseSync,
	createMenuApiClientFromRepository,
} from '../database/index.ts';
import { createHttpMenuApiClient } from './httpMenuApiClient.ts';

let client: MenuApiClient | null = null;

export function getMenuApiClient(): MenuApiClient {
	if (client) return client;

	if (import.meta.env.VITE_MENU_API === 'remote') {
		client = createHttpMenuApiClient(import.meta.env.VITE_API_BASE_URL ?? '/api');
		return client;
	}

	client = createMenuApiClientFromRepository(connectDatabaseSync());
	return client;
}

/** Solo para tests o sustitución del cliente en runtime. */
export function setMenuApiClient(next: MenuApiClient | null): void {
	client = next;
}
