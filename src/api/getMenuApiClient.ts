import type { MenuApiClient } from './menuApiClient.ts';
import {
	resolveMenuApiMode,
	usesRemoteImageUrls,
	type MenuApiMode,
} from '../config/menuApiMode.ts';
import {
	connectDatabaseSync,
	createMenuApiClientFromRepository,
} from '../database/index.ts';
import { createHttpMenuApiClient } from './httpMenuApiClient.ts';

let client: MenuApiClient | null = null;

export function getMenuApiMode(): MenuApiMode {
	return resolveMenuApiMode();
}

export { usesRemoteImageUrls };

/** @deprecated Usa usesRemoteImageUrls */
export const isPersistedRemoteMode = usesRemoteImageUrls;

export function getMenuApiClient(): MenuApiClient {
	if (client) return client;

	if (resolveMenuApiMode() === 'remote') {
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
