import type { MenuApiClient } from '../api/menuApiClient.ts';
import type { DatabaseConnection } from './DatabaseConnection.ts';

async function withConnection<T>(
	connection: DatabaseConnection,
	fn: (client: MenuApiClient) => Promise<T>,
): Promise<T> {
	if (!connection.isConnected()) {
		await connection.connect();
	}
	return fn(connection.getMenuClient());
}

export function createConnectedMenuClient(
	connection: DatabaseConnection,
): MenuApiClient {
	return new Proxy({} as MenuApiClient, {
		get(_target, prop) {
			if (typeof prop !== 'string') return undefined;
			return (...args: unknown[]) =>
				withConnection(connection, (client) => {
					const method = client[prop as keyof MenuApiClient];
					if (typeof method !== 'function') {
						throw new Error(`MenuApiClient no expone el método ${String(prop)}`);
					}
					return (method as (...a: unknown[]) => Promise<unknown>)(...args);
				});
		},
	});
}
