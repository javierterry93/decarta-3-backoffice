export interface LocalStorageEngine {
	getItem(key: string): string | null;
	setItem(key: string, value: string): void;
	removeItem(key: string): void;
	clear(): void;
}

export const LOCAL_STORAGE_KEYS = {
	menuStore: 'decarta-menu-store',
} as const;

export type LocalStorageConnectionOptions = {
	storageKey?: string;
};
