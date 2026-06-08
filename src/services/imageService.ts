import { getMenuApiClient } from '../api/getMenuApiClient.ts';
import { blobToDataUrl, optimizeImage } from '../utils/imageOptimizer.ts';

export async function uploadImage(file: File): Promise<string> {
	const { blob, thumbnailBlob } = await optimizeImage(file);
	const name = file.name.replace(/\.[^.]+$/, '') || 'Imagen';
	const client = getMenuApiClient();

	if (import.meta.env.VITE_MENU_API === 'remote') {
		const [url, thumbnailUrl] = await Promise.all([
			blobToDataUrl(blob),
			blobToDataUrl(thumbnailBlob),
		]);
		const image = await client.createImage({ name, url, thumbnailUrl });
		return image.id;
	}

	const image = await client.createImage({
		name,
		fullBlob: blob,
		thumbBlob: thumbnailBlob,
	});
	return image.id;
}

export async function uploadImages(files: File[]): Promise<string[]> {
	const ids: string[] = [];
	for (const file of files) {
		ids.push(await uploadImage(file));
	}
	return ids;
}
