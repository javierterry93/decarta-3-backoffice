import type { DatabaseConnection } from './DatabaseConnection.ts';

export type DatabaseConnectorFactory = () => DatabaseConnection;
