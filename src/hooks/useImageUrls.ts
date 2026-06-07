import { useEffect, useMemo, useState } from 'react';
import type { MenuImage } from '../types/index.ts';
import {
	resolveImageObjectUrl,
	revokeImageObjectUrl,
} from '../services/imageStorage/imageResolver.ts';

export function useImageObjectUrl(
	imageId: string | null | undefined,
	variant: 'full' | 'thumb',
	image?: MenuImage,
): string | null {
	const [url, setUrl] = useState<string | null>(null);

	useEffect(() => {
		if (!imageId) {
			setUrl(null);
			return;
		}

		let cancelled = false;
		let resolvedUrl: string | null = null;

		void resolveImageObjectUrl(imageId, variant, image).then((next) => {
			if (cancelled) return;
			resolvedUrl = next;
			setUrl(next);
		});

		return () => {
			cancelled = true;
			if (resolvedUrl) revokeImageObjectUrl(resolvedUrl);
		};
	}, [imageId, variant, image?.url, image?.thumbnailUrl]);

	return url;
}

export function useImageThumbnailMap(
	images: MenuImage[],
): Record<string, string> {
	const ids = useMemo(() => images.map((i) => i.id).join(','), [images]);
	const [map, setMap] = useState<Record<string, string>>({});

	useEffect(() => {
		let cancelled = false;

		void (async () => {
			const entries = await Promise.all(
				images.map(async (image) => {
					const url = await resolveImageObjectUrl(image.id, 'thumb', image);
					return url ? ([image.id, url] as const) : null;
				}),
			);
			if (cancelled) return;
			setMap(Object.fromEntries(entries.filter(Boolean) as [string, string][]));
		})();

		return () => {
			cancelled = true;
			for (const url of Object.values(map)) revokeImageObjectUrl(url);
		};
	}, [ids, images]);

	return map;
}
