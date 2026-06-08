import type { SupabaseClient } from '@supabase/supabase-js';
import { wrapDatabaseError } from '../../database/DatabaseError.ts';
import type { SupabaseDatabase } from '../../database/supabase/types.ts';

export async function callSupabaseRpc<T = void>(
	client: SupabaseClient<SupabaseDatabase>,
	functionName: keyof SupabaseDatabase['public']['Functions'],
	args: Record<string, unknown>,
	errorMessage: string,
): Promise<T> {
	const { data, error } = await client.rpc(functionName, args as never);

	if (error) {
		throw wrapDatabaseError(errorMessage, error);
	}

	return data as T;
}
