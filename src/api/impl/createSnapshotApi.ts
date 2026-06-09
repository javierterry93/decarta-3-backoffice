import type { SnapshotRepository } from '../../database/index.ts';
import type { ApiClient } from '../ApiClient.ts';

export type SnapshotApi = Pick<ApiClient, 'getSnapshot' | 'resetSnapshot'>;

export function createSnapshotApi(repository: SnapshotRepository): SnapshotApi {
	return {
		async getSnapshot() {
			return repository.fetchSnapshot();
		},

		async resetSnapshot() {
			await repository.resetSnapshot();
		},
	};
}
