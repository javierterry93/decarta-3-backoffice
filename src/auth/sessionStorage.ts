import {
	SESSION_DURATION_MS,
	SESSION_META_STORAGE_KEY,
} from './constants.ts';

export type BackofficeSessionMeta = {
	accessToken: string;
	loginAt: number;
	expiresAt: number;
};

export function createSessionMeta(accessToken: string): BackofficeSessionMeta {
	const loginAt = Date.now();
	return {
		accessToken,
		loginAt,
		expiresAt: loginAt + SESSION_DURATION_MS,
	};
}

export function saveSessionMeta(accessToken: string): BackofficeSessionMeta {
	const meta = createSessionMeta(accessToken);
	localStorage.setItem(SESSION_META_STORAGE_KEY, JSON.stringify(meta));
	return meta;
}

export function readSessionMeta(): BackofficeSessionMeta | null {
	try {
		const raw = localStorage.getItem(SESSION_META_STORAGE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as BackofficeSessionMeta;
		if (
			typeof parsed.accessToken !== 'string' ||
			typeof parsed.loginAt !== 'number' ||
			typeof parsed.expiresAt !== 'number'
		) {
			return null;
		}
		return parsed;
	} catch {
		return null;
	}
}

export function updateSessionToken(accessToken: string): BackofficeSessionMeta | null {
	const meta = readSessionMeta();
	if (!meta) return null;

	const updated = { ...meta, accessToken };
	localStorage.setItem(SESSION_META_STORAGE_KEY, JSON.stringify(updated));
	return updated;
}

export function clearSessionMeta(): void {
	localStorage.removeItem(SESSION_META_STORAGE_KEY);
}

export function isSessionMetaExpired(
	meta: BackofficeSessionMeta,
	now = Date.now(),
): boolean {
	return now >= meta.expiresAt;
}

export function getSessionRemainingMs(
	meta: BackofficeSessionMeta,
	now = Date.now(),
): number {
	return Math.max(0, meta.expiresAt - now);
}
