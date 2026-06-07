import type { MenuRepository } from './MenuRepository.ts';

export interface DatabaseConnection {
	connect(): Promise<void>;
	disconnect(): Promise<void>;
	isConnected(): boolean;
	getMenuRepository(): MenuRepository;
}
