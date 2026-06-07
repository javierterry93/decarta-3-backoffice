/**
 * Punto de ensamblado (@Configuration / @Bean).
 * Según VITE_MENU_API registra un conector u omite el registro (remote = HTTP).
 */
import { createClient } from '@supabase/supabase-js';
import { resolveMenuApiMode } from './menuApiMode.ts';
import { createLocalStorageConnection } from '../database/localStorage/createLocalStorageConnection.ts';
import { createLocalStorageEngine } from '../database/localStorage/createLocalStorageEngine.ts';
import { registerDatabaseConnector } from '../database/registry.ts';
import { createSupabaseConnection } from '../database/supabase/createSupabaseConnection.ts';
import type { SupabaseDatabase } from '../database/supabase/types.ts';

function createSupabaseEngine(): ReturnType<typeof createClient<SupabaseDatabase>> {
	const url = import.meta.env.VITE_SUPABASE_URL;
	const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

	if (!url || !anonKey) {
		throw new Error(
			'VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY son obligatorios con VITE_MENU_API=supabase',
		);
	}

	return createClient<SupabaseDatabase>(url, anonKey);
}

switch (resolveMenuApiMode()) {
	case 'localStorage':
		registerDatabaseConnector(() =>
			createLocalStorageConnection(createLocalStorageEngine()),
		);
		break;
	case 'supabase':
		registerDatabaseConnector(() =>
			createSupabaseConnection(createSupabaseEngine(), {
				storageBucket: import.meta.env.VITE_SUPABASE_STORAGE_BUCKET ?? 'menu-images',
			}),
		);
		break;
	case 'remote':
		break;
}
