import type { BusinessRepository } from '../../database/index.ts';
import type { ApiClient } from '../ApiClient.ts';
import type { BusinessSettingsUpdateInput } from '../types.ts';

export type SettingsApi = Pick<ApiClient, 'updateSettings'>;

export function createSettingsApi(repository: BusinessRepository): SettingsApi {
	return {
		async updateSettings(input: BusinessSettingsUpdateInput) {
			const businessId = await repository.requireBusinessId();
			return repository.updateBusinessSettings(businessId, input);
		},
	};
}
