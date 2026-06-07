import type { DatabaseConnection } from '../DatabaseConnection.ts';
import { wrapDatabaseError } from '../DatabaseError.ts';
import type { MenuRepository } from '../MenuRepository.ts';
import { LocalStorageMenuRepository } from './LocalStorageMenuRepository.ts';
import { configureLocalStorageEngine } from './persistStorage.ts';
import type {
	LocalStorageConnectionOptions,
	LocalStorageEngine,
} from './types.ts';
import { LOCAL_STORAGE_KEYS } from './types.ts';

export function createLocalStorageConnection(
	engine: LocalStorageEngine,
	options: LocalStorageConnectionOptions = {},
): DatabaseConnection {
	configureLocalStorageEngine(engine);
	return new LocalStorageConnection(
		engine,
		options.storageKey ?? LOCAL_STORAGE_KEYS.menuStore,
	);
}

class LocalStorageConnection implements DatabaseConnection {
	private connected = false;
	private readonly repository = new LocalStorageMenuRepository();

	constructor(
		private readonly engine: LocalStorageEngine,
		private readonly storageKey: string,
	) {}

	async connect(): Promise<void> {
		if (this.connected) return;

		try {
			this.engine.getItem(this.storageKey);
			this.connected = true;
		} catch (error) {
			throw wrapDatabaseError('No se pudo conectar con localStorage', error);
		}
	}

	disconnect(): Promise<void> {
		this.connected = false;
		return Promise.resolve();
	}

	isConnected(): boolean {
		return this.connected;
	}

	getMenuRepository(): MenuRepository {
		return this.repository;
	}
}
