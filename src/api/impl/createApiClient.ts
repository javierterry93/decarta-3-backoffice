import type { Repository } from '../../database/index.ts';
import type { ApiClient } from '../ApiClient.ts';
import { createCategoryApi } from './createCategoryApi.ts';
import { createImageApi } from './createImageApi.ts';
import { createProductApi } from './createProductApi.ts';
import { createSettingsApi } from './createSettingsApi.ts';
import { createSnapshotApi } from './createSnapshotApi.ts';

/** Compone el cliente API a partir de los repositorios por entidad. */
export function createApiClient(repository: Repository): ApiClient {
	return {
		...createSnapshotApi(repository),
		...createProductApi(repository),
		...createCategoryApi(repository),
		...createImageApi(repository),
		...createSettingsApi(repository),
	};
}
