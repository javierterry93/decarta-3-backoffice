import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { SupabaseDatabase } from './types.ts';

export type SupabaseEngineConfig = {
	url: string;
	publishableKey: string;
};

export function resolveSupabaseEngineConfig(): SupabaseEngineConfig {
	return {
		url: import.meta.env.VITE_SUPABASE_URL ?? '',
		publishableKey:
			import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
			import.meta.env.VITE_SUPABASE_ANON_KEY ??
			'',
	};
}

export function createSupabaseEngine(
	config: SupabaseEngineConfig = resolveSupabaseEngineConfig(),
): SupabaseClient<SupabaseDatabase> {
	if (!config.url || !config.publishableKey) {
		throw new Error(
			'VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY son obligatorios con VITE_MENU_API=supabase',
		);
	}

	return createClient<SupabaseDatabase>(config.url, config.publishableKey);
}
