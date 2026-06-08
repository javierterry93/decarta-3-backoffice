import type { SupabaseClient } from '@supabase/supabase-js';
import { DatabaseError } from '../DatabaseError.ts';
import { callSupabaseRpc } from './rpc.ts';
import type { SupabaseDatabase } from './types.ts';

export async function requireBusinessId(
	client: SupabaseClient<SupabaseDatabase>,
): Promise<string> {
	const {
		data: { user },
		error: authError,
	} = await client.auth.getUser();

	if (authError) {
		throw new DatabaseError('No se pudo obtener el usuario autenticado', authError);
	}

	if (!user?.id) {
		throw new DatabaseError('Debes iniciar sesión para gestionar la carta');
	}

	const businessId = await callSupabaseRpc<string>(
		client,
		'ensure_business',
		{},
		'No se pudo inicializar el negocio',
	);

	if (!businessId) {
		throw new DatabaseError('No se encontró el negocio del usuario');
	}

	return businessId;
}
