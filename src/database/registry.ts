import type { DatabaseConnection } from './DatabaseConnection.ts';
import { DatabaseError } from './DatabaseError.ts';
import type { DatabaseConnectorFactory } from './types.ts';

let connectorFactory: DatabaseConnectorFactory | null = null;
let cachedConnection: DatabaseConnection | null = null;

export function registerDatabaseConnector(factory: DatabaseConnectorFactory): void {
	connectorFactory = factory;
	cachedConnection = null;
}

export function resetDatabaseConnector(): void {
	connectorFactory = null;
	cachedConnection = null;
}

export function hasDatabaseConnector(): boolean {
	return connectorFactory !== null;
}

export function createDatabaseConnection(): DatabaseConnection {
	if (!connectorFactory) {
		throw new DatabaseError(
			'No hay conector registrado. Regístralo en src/config/database.config.ts',
		);
	}

	if (!cachedConnection) {
		cachedConnection = connectorFactory();
	}

	return cachedConnection;
}
