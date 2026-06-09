import { getApiClient } from '../api/index.ts';
import { optimizeImage } from '../utils/imageOptimizer.ts';

export async function uploadImage(file: File): Promise<string> {
	const { blob, thumbnailBlob } = await optimizeImage(file);
	const name = file.name.replace(/\.[^.]+$/, '') || 'Imagen';
	const client = getApiClient();

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
