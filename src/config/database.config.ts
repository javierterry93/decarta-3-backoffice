/**
 * Punto de ensamblado (@Configuration / @Bean).
 * Conector Supabase (schema.sql).
 */
import { registerDatabaseConnector } from '../database/index.ts';
import { createSupabaseConnection } from '../database/impl/supabase/SupabaseConnection.ts';
import { getSupabaseClient } from '../database/impl/supabase/getSupabaseClient.ts';

registerDatabaseConnector(() =>
	createSupabaseConnection(getSupabaseClient(), {
		storageBucket: import.meta.env.VITE_SUPABASE_STORAGE_BUCKET ?? 'imageStore',
	}),
);
