import type { Image } from '../../types/index.ts';

export function resolveImageUrl(
	image: Image | undefined | null,
	variant: 'full' | 'thumb',
): string | null {
	if (!image) return null;
	return variant === 'full' ? (image.url ?? null) : (image.thumbnailUrl ?? null);
}
