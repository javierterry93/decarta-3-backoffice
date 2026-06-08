/**
 * Punto de ensamblado (@Configuration / @Bean).
 * VITE_MENU_API=supabase registra el conector; remote usa HTTP sin conector.
 */
import { registerDatabaseConnector } from '../database/registry.ts';
import { createSupabaseConnection } from '../adapters/supabase/createSupabaseConnection.ts';
import { getSupabaseClient } from '../database/supabase/supabaseClient.ts';

if ((import.meta.env.VITE_MENU_API ?? 'supabase') === 'supabase') {
	registerDatabaseConnector(() =>
		createSupabaseConnection(getSupabaseClient(), {
			storageBucket: import.meta.env.VITE_SUPABASE_STORAGE_BUCKET ?? 'menu-images',
		}),
	);
}
