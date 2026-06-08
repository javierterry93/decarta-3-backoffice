import type { MenuImage } from '../../types/index.ts';

export function resolveImageUrl(
	image: MenuImage | undefined | null,
	variant: 'full' | 'thumb',
): string | null {
	if (!image) return null;
	return variant === 'full' ? (image.url ?? null) : (image.thumbnailUrl ?? null);
}
