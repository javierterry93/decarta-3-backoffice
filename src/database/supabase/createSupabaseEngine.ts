import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_AUTH_STORAGE_KEY } from '../../auth/constants.ts';
import type { SupabaseDatabase } from './types.ts';

export type SupabaseEngineConfig = {
	url: string;
	publishableKey: string;
};

function readEnv(key: keyof ImportMetaEnv): string {
	const value = import.meta.env[key];
	return typeof value === 'string' ? value.trim() : '';
}

export function resolveSupabaseEngineConfig(): SupabaseEngineConfig {
	return {
		url: readEnv('VITE_SUPABASE_URL'),
		publishableKey:
			readEnv('VITE_SUPABASE_PUBLISHABLE_KEY') ||
			readEnv('VITE_SUPABASE_ANON_KEY'),
	};
}

export function createSupabaseEngine(
	config: SupabaseEngineConfig = resolveSupabaseEngineConfig(),
): SupabaseClient<SupabaseDatabase> {
	if (!config.url || !config.publishableKey) {
		throw new Error(
			'VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY son obligatorios',
		);
	}

	return createClient<SupabaseDatabase>(config.url, config.publishableKey, {
		auth: {
			persistSession: true,
			autoRefreshToken: true,
			storageKey: SUPABASE_AUTH_STORAGE_KEY,
			// Alineado con SESSION_DURATION_MS; configurar JWT_EXPIRY=14400 en Supabase.
			storage: typeof window !== 'undefined' ? window.localStorage : undefined,
		},
		global: {
			headers: {
				'X-Client-Info': 'zenda-backoffice',
			},
		},
	});
}
