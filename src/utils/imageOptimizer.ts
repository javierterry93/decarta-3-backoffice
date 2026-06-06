const MAX_WIDTH = 1200;
const THUMB_WIDTH = 200;
const QUALITY = 0.82;

function loadImage(file: File): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		const url = URL.createObjectURL(file);
		img.onload = () => {
			URL.revokeObjectURL(url);
			resolve(img);
		};
		img.onerror = reject;
		img.src = url;
	});
}

function canvasToBlob(
	canvas: HTMLCanvasElement,
	type: string,
	quality: number,
): Promise<Blob> {
	return new Promise((resolve, reject) => {
		canvas.toBlob(
			(blob) => (blob ? resolve(blob) : reject(new Error('No blob'))),
			type,
			quality,
		);
	});
}

async function resizeImage(
	img: HTMLImageElement,
	maxWidth: number,
): Promise<Blob> {
	const scale = Math.min(1, maxWidth / img.width);
	const width = Math.round(img.width * scale);
	const height = Math.round(img.height * scale);
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('Canvas no disponible');
	ctx.drawImage(img, 0, 0, width, height);
	return canvasToBlob(canvas, 'image/jpeg', QUALITY);
}

export async function optimizeImage(file: File): Promise<{
	blob: Blob;
	thumbnailBlob: Blob;
}> {
	const img = await loadImage(file);
	const [blob, thumbnailBlob] = await Promise.all([
		resizeImage(img, MAX_WIDTH),
		resizeImage(img, THUMB_WIDTH),
	]);
	return { blob, thumbnailBlob };
}

export function blobToDataUrl(blob: Blob): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = reject;
		reader.readAsDataURL(blob);
	});
}
