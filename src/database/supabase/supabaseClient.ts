import type { SupabaseClient } from '@supabase/supabase-js';
import { createSupabaseEngine } from './createSupabaseEngine.ts';
import type { SupabaseDatabase } from './types.ts';

let client: SupabaseClient<SupabaseDatabase> | null = null;

export function getSupabaseClient(): SupabaseClient<SupabaseDatabase> {
	if (!client) {
		client = createSupabaseEngine();
	}
	return client;
}

export function resetSupabaseClient(): void {
	client = null;
}
