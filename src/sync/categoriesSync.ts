import type { QueryClient } from '@tanstack/react-query';
import { categoriesQueryKey } from '../api/index.ts';

const CATEGORIES_SYNC_CHANNEL = 'decarta-categories-changed';

export function broadcastCategoriesChanged(): void {
	if (typeof BroadcastChannel === 'undefined') return;
	const channel = new BroadcastChannel(CATEGORIES_SYNC_CHANNEL);
	channel.postMessage(null);
	channel.close();
}

export function subscribeCategoriesChanged(onChange: () => void): () => void {
	if (typeof BroadcastChannel === 'undefined') return () => {};
	const channel = new BroadcastChannel(CATEGORIES_SYNC_CHANNEL);
	channel.onmessage = onChange;
	return () => channel.close();
}

export function invalidateCategoriesAcrossTabs(queryClient: QueryClient) {
	broadcastCategoriesChanged();
	return queryClient.invalidateQueries({ queryKey: categoriesQueryKey });
}
