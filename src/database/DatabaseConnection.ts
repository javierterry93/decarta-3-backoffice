import type { MenuApiClient } from '../api/menuApiClient.ts';

export interface DatabaseConnection {
	connect(): Promise<void>;
	disconnect(): Promise<void>;
	isConnected(): boolean;
	getMenuClient(): MenuApiClient;
}
