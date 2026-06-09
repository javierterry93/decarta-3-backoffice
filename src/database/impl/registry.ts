import type { DatabaseConnection } from '../DatabaseConnection.ts';
import { DatabaseError } from '../DatabaseError.ts';
import type { DatabaseConnectorFactory } from '../DatabaseConnectorFactory.ts';

let connectorFactory: DatabaseConnectorFactory | null = null;
let cachedConnection: DatabaseConnection | null = null;

export function registerDatabaseConnector(
	factory: DatabaseConnectorFactory,
): void {
	connectorFactory = factory;
	cachedConnection = null;
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
