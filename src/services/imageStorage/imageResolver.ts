import {
	getMenuApiClient,
	usesRemoteImageUrls,
} from '../../api/getMenuApiClient.ts';
import type { MenuImage } from '../../types/index.ts';
import {
	clearAllImageBlobs,
	deleteImageBlobs,
	getImageBlob,
	storeImageBlobs,
	storeImageFromDataUrls,
} from './indexedDbImageStorage.ts';

const objectUrlCache = new Map<string, string>();

function cacheKey(imageId: string, variant: 'full' | 'thumb'): string {
	return `${imageId}:${variant}`;
}

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
	if (usesRemoteImageUrls()) {
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

	const key = cacheKey(imageId, variant);
	const cached = objectUrlCache.get(key);
	if (cached) return cached;

	const blob = await getImageBlob(imageId, variant);
	if (!blob) return null;

	const objectUrl = URL.createObjectURL(blob);
	objectUrlCache.set(key, objectUrl);
	return objectUrl;
}

export async function persistImageBlobs(
	imageId: string,
	full: Blob,
	thumb: Blob,
): Promise<void> {
	await storeImageBlobs(imageId, full, thumb);
}

export async function removeImageBlobs(imageId: string): Promise<void> {
	for (const variant of ['full', 'thumb'] as const) {
		const key = cacheKey(imageId, variant);
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

export async function migrateLegacyImagesIfNeeded(): Promise<void> {
	if (usesRemoteImageUrls()) return;
	if (localStorage.getItem('decarta-images-v2-migrated') === '1') return;

	const snapshot = await getMenuApiClient().getMenu();
	let migrated = false;

	for (const image of snapshot.images) {
		if (
			image.url?.startsWith('data:') &&
			image.thumbnailUrl?.startsWith('data:')
		) {
			await storeImageFromDataUrls(image.id, image.url, image.thumbnailUrl);
			migrated = true;
		}
	}

	if (migrated || snapshot.images.some((i) => i.url || i.thumbnailUrl)) {
		const { useMenuStore } =
			await import('../../database/localStorage/menuStore.ts');
		useMenuStore.setState((state) => ({
			images: state.images.map(({ id, name, createdAt }) => ({
				id,
				name,
				createdAt,
			})),
		}));
	}

	localStorage.setItem('decarta-images-v2-migrated', '1');
}
