import type { DatabaseConnection } from './DatabaseConnection.ts';
import { createDatabaseConnection } from './registry.ts';
import type { DatabaseConnectorFactory } from './types.ts';

export function connectDatabaseSync(
	factory?: DatabaseConnectorFactory,
): DatabaseConnection {
	return factory ? factory() : createDatabaseConnection();
}

export { createDatabaseConnection } from './registry.ts';
