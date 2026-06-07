import type { LocalStorageEngine } from './types.ts';

export function createLocalStorageEngine(
	storage: Storage = globalThis.localStorage,
): LocalStorageEngine {
	return {
		getItem: (key) => storage.getItem(key),
		setItem: (key, value) => storage.setItem(key, value),
		removeItem: (key) => storage.removeItem(key),
		clear: () => storage.clear(),
	};
}
