import { getMenuApiClient } from '../../api/getMenuApiClient.ts';
import type { MenuImage } from '../../types/index.ts';
import {
	clearAllImageBlobs,
	deleteImageBlobs,
} from './indexedDbImageStorage.ts';

const objectUrlCache = new Map<string, string>();

export function revokeImageObjectUrl(url: string): void {
	for (const [key, cached] of objectUrlCache.entries()) {
		if (cached === url) {
			URL.revokeObjectURL(cached);
			objectUrlCache.delete(key);
			break;
		}
	}
}

export async function resolveImageObjectUrl(
	imageId: string,
	variant: 'full' | 'thumb',
	image?: MenuImage,
): Promise<string | null> {
	const remote =
		image ??
		(await getMenuApiClient()
			.getImage(imageId)
			.catch(() => null));
	if (!remote) return null;
	return variant === 'full'
		? (remote.url ?? null)
		: (remote.thumbnailUrl ?? null);
}

export async function removeImageBlobs(imageId: string): Promise<void> {
	for (const variant of ['full', 'thumb'] as const) {
		const key = `${imageId}:${variant}`;
		const cached = objectUrlCache.get(key);
		if (cached) {
			URL.revokeObjectURL(cached);
			objectUrlCache.delete(key);
		}
	}
	await deleteImageBlobs(imageId);
}

export async function clearAllLocalImageStorage(): Promise<void> {
	for (const url of objectUrlCache.values()) {
		URL.revokeObjectURL(url);
	}
	objectUrlCache.clear();
	await clearAllImageBlobs();
}
