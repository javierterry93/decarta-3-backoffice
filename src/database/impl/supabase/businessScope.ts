import type { SupabaseClient } from '@supabase/supabase-js';
import { DatabaseError, wrapDatabaseError } from '../../DatabaseError.ts';
import type { SupabaseDatabase } from './types.ts';
import { SUPABASE_TABLES } from './types.ts';

/**
 * El negocio de un usuario no cambia durante la sesión (1 usuario = 1 negocio),
 * así que se resuelve una sola vez y las llamadas concurrentes comparten promesa.
 */
const businessIdByUser = new Map<string, Promise<string>>();

async function requireUserId(
	client: SupabaseClient<SupabaseDatabase>,
): Promise<string> {
	// getSession lee del almacenamiento local: no genera petición de red.
	const {
		data: { session },
		error,
	} = await client.auth.getSession();

	if (error) {
		throw new DatabaseError('No se pudo obtener el usuario autenticado', error);
	}

	const userId = session?.user.id;
	if (!userId) {
		throw new DatabaseError('Debes iniciar sesión para gestionar la carta');
	}

	return userId;
}

async function findBusinessId(
	client: SupabaseClient<SupabaseDatabase>,
	userId: string,
): Promise<string | null> {
	const { data, error } = await client
		.from(SUPABASE_TABLES.businesses)
		.select('id')
		.eq('owner_user_id', userId)
		.maybeSingle();

	if (error) {
		throw wrapDatabaseError('No se pudo leer el negocio del usuario', error);
	}

	return data?.id ?? null;
}

async function resolveBusinessId(
	client: SupabaseClient<SupabaseDatabase>,
	userId: string,
): Promise<string> {
	const existing = await findBusinessId(client, userId);
	if (existing) return existing;

	// 1 usuario = 1 negocio (schema.sql): se crea con los defaults de la tabla.
	const { data, error } = await client
		.from(SUPABASE_TABLES.businesses)
		.insert({ owner_user_id: userId })
		.select('id')
		.single();

	if (!error) return data.id;

	// Carrera entre peticiones concurrentes: el unique de owner_user_id ya lo creó.
	const created = await findBusinessId(client, userId);
	if (created) return created;

	throw wrapDatabaseError('No se pudo inicializar el negocio', error);
}

export function requireBusinessId(
	client: SupabaseClient<SupabaseDatabase>,
): Promise<string> {
	return requireUserId(client).then((userId) => {
		let pending = businessIdByUser.get(userId);

		if (!pending) {
			pending = resolveBusinessId(client, userId);
			pending.catch(() => businessIdByUser.delete(userId));
			businessIdByUser.set(userId, pending);
		}

		return pending;
	});
}
