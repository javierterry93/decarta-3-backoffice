export type { DatabaseConnection } from './DatabaseConnection.ts';
export type { DatabaseConnectorFactory } from './types.ts';

export { DatabaseError, wrapDatabaseError } from './DatabaseError.ts';
export {
	connectDatabaseSync,
	createDatabaseConnection,
} from './connectDatabase.ts';
export { createConnectedMenuClient } from './createConnectedMenuClient.ts';
export { registerDatabaseConnector } from './registry.ts';
