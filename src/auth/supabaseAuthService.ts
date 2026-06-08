import type { Session } from '@supabase/supabase-js';
import { getSupabaseClient } from '../database/supabase/supabaseClient.ts';
import {
	clearSessionMeta,
	isSessionMetaExpired,
	readSessionMeta,
	saveSessionMeta,
	updateSessionToken,
	type BackofficeSessionMeta,
} from './sessionStorage.ts';

export type BackofficeAuthSession = {
	session: Session;
	meta: BackofficeSessionMeta;
};

export async function signInWithPassword(
	email: string,
	password: string,
): Promise<BackofficeAuthSession> {
	const client = getSupabaseClient();
	const { data, error } = await client.auth.signInWithPassword({
		email: email.trim(),
		password,
	});

	if (error) throw error;
	if (!data.session?.access_token) {
		throw new Error('No se recibió un token de sesión válido');
	}

	const meta = saveSessionMeta(data.session.access_token);
	return { session: data.session, meta };
}

export async function signOutBackoffice(): Promise<void> {
	clearSessionMeta();
	await getSupabaseClient().auth.signOut();
}

function reconcileSession(
	session: Session,
	meta: BackofficeSessionMeta,
): BackofficeAuthSession {
	if (session.access_token === meta.accessToken) {
		return { session, meta };
	}

	const nextMeta = updateSessionToken(session.access_token);
	if (!nextMeta || isSessionMetaExpired(nextMeta)) {
		throw new Error('La sesión ha expirado');
	}

	return { session, meta: nextMeta };
}

export async function resolveBackofficeSession(): Promise<BackofficeAuthSession | null> {
	const meta = readSessionMeta();
	if (!meta || isSessionMetaExpired(meta)) {
		clearSessionMeta();
		return null;
	}

	const client = getSupabaseClient();
	const { data, error } = await client.auth.getSession();
	if (error) throw error;

	if (data.session?.access_token) {
		return reconcileSession(data.session, meta);
	}

	const { data: refreshed, error: refreshError } =
		await client.auth.refreshSession();
	if (refreshError) throw refreshError;

	if (!refreshed.session?.access_token) {
		clearSessionMeta();
		return null;
	}

	return reconcileSession(refreshed.session, meta);
}
