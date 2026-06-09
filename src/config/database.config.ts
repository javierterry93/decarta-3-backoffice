/**
 * Punto de ensamblado (@Configuration / @Bean).
 * Conector Supabase (schema.sql).
 */
import { registerDatabaseConnector } from '../database/registry.ts';
import { createSupabaseConnection } from '../adapters/supabase/createSupabaseConnection.ts';
import { getSupabaseClient } from '../database/supabase/supabaseClient.ts';

registerDatabaseConnector(() =>
	createSupabaseConnection(getSupabaseClient(), {
		storageBucket: import.meta.env.VITE_SUPABASE_STORAGE_BUCKET ?? 'menu-images',
	}),
);
