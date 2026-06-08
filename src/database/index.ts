export type { DatabaseConnection } from './DatabaseConnection.ts';
export type {
	BusinessSettingsUpdatePatch,
	CategoryUpdatePatch,
	MenuRepository,
	ProductUpdatePatch,
} from './MenuRepository.ts';
export type { DatabaseConnectorFactory } from './types.ts';

export { DatabaseError, wrapDatabaseError } from './DatabaseError.ts';
export {
	connectDatabaseSync,
	createDatabaseConnection,
} from './connectDatabase.ts';
export { registerDatabaseConnector } from './registry.ts';
