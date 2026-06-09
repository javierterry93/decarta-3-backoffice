import type { Image } from '../types/index.ts';

export interface ImageRepository {
	listImages(): Promise<Image[]>;
	uploadImageFiles(
		id: string,
		fullBlob: Blob,
		thumbBlob: Blob,
	): Promise<{ url: string; thumbnailUrl: string }>;
	insertImage(image: Omit<Image, 'createdAt'>): Promise<Image>;
	removeImageFiles(ids: string[]): Promise<void>;
	deleteImage(id: string): Promise<void>;
}
