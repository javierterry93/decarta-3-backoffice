import type { BusinessSettings } from '../types/index.ts';

export type BusinessSettingsUpdatePatch = Partial<BusinessSettings>;

export interface BusinessRepository {
	requireBusinessId(): Promise<string>;
	getSettings(): Promise<BusinessSettings>;
	updateBusinessSettings(
		businessId: string,
		patch: BusinessSettingsUpdatePatch,
	): Promise<BusinessSettings>;
	touchLastModified(businessId: string): Promise<string>;
}
