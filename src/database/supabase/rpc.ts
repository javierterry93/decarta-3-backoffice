import type { SupabaseClient } from '@supabase/supabase-js';
import { wrapDatabaseError } from '../DatabaseError.ts';
import type { SupabaseDatabase } from './types.ts';

export async function callSupabaseRpc<T = void>(
	client: SupabaseClient<SupabaseDatabase>,
	functionName: string,
	args: Record<string, unknown>,
	errorMessage: string,
): Promise<T> {
	const { data, error } = await client.rpc(functionName, args);

	if (error) {
		throw wrapDatabaseError(errorMessage, error);
	}

	return data as T;
}
