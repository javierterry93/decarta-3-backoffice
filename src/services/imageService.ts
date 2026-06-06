import { getMenuApiClient } from '../api/getMenuApiClient.ts';
import { blobToDataUrl, optimizeImage } from '../utils/imageOptimizer.ts';

export async function uploadImage(file: File): Promise<string> {
	const { blob, thumbnailBlob } = await optimizeImage(file);
	const [url, thumbnailUrl] = await Promise.all([
		blobToDataUrl(blob),
		blobToDataUrl(thumbnailBlob),
	]);
	const image = await getMenuApiClient().createImage({
		name: file.name.replace(/\.[^.]+$/, ''),
		url,
		thumbnailUrl,
	});
	return image.id;
}
