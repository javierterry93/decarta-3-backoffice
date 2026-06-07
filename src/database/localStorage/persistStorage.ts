import { createJSONStorage, type StateStorage } from 'zustand/middleware';
import { createLocalStorageEngine } from './createLocalStorageEngine.ts';
import type { LocalStorageEngine } from './types.ts';

let engine: LocalStorageEngine = createLocalStorageEngine();

export function configureLocalStorageEngine(next: LocalStorageEngine): void {
	engine = next;
}

function createStateStorage(current: LocalStorageEngine): StateStorage {
	return {
		getItem: (name) => current.getItem(name),
		setItem: (name, value) => current.setItem(name, value),
		removeItem: (name) => current.removeItem(name),
	};
}

export function createMenuStorePersistStorage() {
	return createJSONStorage(() => createStateStorage(engine));
}
