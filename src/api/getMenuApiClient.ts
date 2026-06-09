import type { MenuApiClient } from './menuApiClient.ts';

export type MenuApiClientFactory = () => MenuApiClient;

let factory: MenuApiClientFactory | null = null;
let client: MenuApiClient | null = null;

export function registerMenuApiClient(next: MenuApiClientFactory): void {
	factory = next;
	client = null;
}

export function getMenuApiClient(): MenuApiClient {
	if (!factory) {
		throw new Error(
			'No hay cliente API registrado. Regístralo en src/config/api.config.ts',
		);
	}

	client ??= factory();
	return client;
}

/** Solo para tests o sustitución del cliente en runtime. */
export function setMenuApiClient(next: MenuApiClient | null): void {
	client = next;
}
