import type { ApiClient } from '../ApiClient.ts';

export type ApiClientFactory = () => ApiClient;

let factory: ApiClientFactory | null = null;
let client: ApiClient | null = null;

export function registerApiClient(next: ApiClientFactory): void {
	factory = next;
	client = null;
}

export function getApiClient(): ApiClient {
	if (!factory) {
		throw new Error(
			'No hay cliente API registrado. Regístralo en src/config/api.config.ts',
		);
	}

	client ??= factory();
	return client;
}

/** Solo para tests o sustitución del cliente en runtime. */
export function setApiClient(next: ApiClient | null): void {
	client = next;
}
