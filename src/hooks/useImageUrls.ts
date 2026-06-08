import { useMemo } from 'react';
import type { MenuImage } from '../types/index.ts';
import { resolveImageUrl } from '../services/imageStorage/imageResolver.ts';

export function useImageObjectUrl(
	imageId: string | null | undefined,
	variant: 'full' | 'thumb',
	image?: MenuImage,
): string | null {
	return useMemo(
		() => (imageId ? resolveImageUrl(image, variant) : null),
		[imageId, variant, image?.url, image?.thumbnailUrl],
	);
}

export function useImageThumbnailMap(
	images: MenuImage[],
): Record<string, string> {
	return useMemo(() => {
		const map: Record<string, string> = {};
		for (const image of images) {
			const url = resolveImageUrl(image, 'thumb');
			if (url) map[image.id] = url;
		}
		return map;
	}, [images]);
}
