import type { ImageRepository } from '../../database/index.ts';
import { generateId } from '../../utils/format.ts';
import type { ApiClient } from '../ApiClient.ts';
import type { ImageCreateInput } from '../types.ts';

export type ImageApi = Pick<
	ApiClient,
	'listImages' | 'createImage' | 'deleteImage'
>;

export function createImageApi(repository: ImageRepository): ImageApi {
	return {
		async listImages() {
			return repository.listImages();
		},

		async createImage(input: ImageCreateInput) {
			const id = generateId();
			let url = input.url;
			let thumbnailUrl = input.thumbnailUrl;

			if (input.fullBlob && input.thumbBlob) {
				const uploaded = await repository.uploadImageFiles(
					id,
					input.fullBlob,
					input.thumbBlob,
				);
				url = uploaded.url;
				thumbnailUrl = uploaded.thumbnailUrl;
			}

			return repository.insertImage({
				id,
				name: input.name,
				url,
				thumbnailUrl,
			});
		},

		async deleteImage(id: string) {
			await repository.deleteImage(id);
		},
	};
}
