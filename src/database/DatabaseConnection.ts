import type { Repository } from './Repository.ts';

export interface DatabaseConnection {
	connect(): Promise<void>;
	disconnect(): Promise<void>;
	isConnected(): boolean;
	getRepository(): Repository;
}
