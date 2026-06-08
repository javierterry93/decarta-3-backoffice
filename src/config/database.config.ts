/**
 * Punto de ensamblado (@Configuration / @Bean).
 * Según VITE_MENU_API registra un conector u omite el registro (remote = HTTP).
 */
import { resolveMenuApiMode } from './menuApiMode.ts';
import { createLocalStorageConnection } from '../database/localStorage/createLocalStorageConnection.ts';
import { createLocalStorageEngine } from '../database/localStorage/createLocalStorageEngine.ts';
import { registerDatabaseConnector } from '../database/registry.ts';
import { createSupabaseConnection } from '../database/supabase/createSupabaseConnection.ts';
import { getSupabaseClient } from '../database/supabase/supabaseClient.ts';

switch (resolveMenuApiMode()) {
	case 'localStorage':
		registerDatabaseConnector(() =>
			createLocalStorageConnection(createLocalStorageEngine()),
		);
		break;
	case 'supabase':
		registerDatabaseConnector(() =>
			createSupabaseConnection(getSupabaseClient(), {
				storageBucket:
					import.meta.env.VITE_SUPABASE_STORAGE_BUCKET ?? 'menu-images',
			}),
		);
		break;
	case 'remote':
		break;
}
