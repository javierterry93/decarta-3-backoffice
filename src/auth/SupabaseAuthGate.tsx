import type { Session } from '@supabase/supabase-js';
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from 'react';
import { PageLoading } from '../components/layout/PageLoading.tsx';
import { getSupabaseClient } from '../database/supabase/supabaseClient.ts';
import LoginPage from '../pages/Login/index.tsx';
import {
	clearSessionMeta,
	isSessionMetaExpired,
	readSessionMeta,
	saveSessionMeta,
	updateSessionToken,
	type BackofficeSessionMeta,
} from './sessionStorage.ts';
import {
	authSessionFromSignIn,
	resolveBackofficeSession,
	signOutBackoffice,
	type BackofficeAuthSession,
} from './supabaseAuthService.ts';

export type SupabaseAuthContextValue = {
	session: Session;
	accessToken: string;
	expiresAt: number;
	signOut: () => Promise<void>;
};

const SupabaseAuthContext = createContext<SupabaseAuthContextValue | null>(null);

export function useSupabaseAuth(): SupabaseAuthContextValue | null {
	return useContext(SupabaseAuthContext);
}

type SupabaseAuthGateProps = {
	children: React.ReactNode;
};

const SESSION_CHECK_INTERVAL_MS = 60_000;

function toAuthContext(
	session: Session,
	meta: BackofficeSessionMeta,
): SupabaseAuthContextValue {
	return {
		session,
		accessToken: meta.accessToken,
		expiresAt: meta.expiresAt,
		signOut: signOutBackoffice,
	};
}

function SupabaseAuthGateInner({ children }: SupabaseAuthGateProps) {
	const [auth, setAuth] = useState<SupabaseAuthContextValue | null>(null);
	const [loading, setLoading] = useState(true);

	const establishAuth = useCallback((resolved: BackofficeAuthSession) => {
		setAuth(toAuthContext(resolved.session, resolved.meta));
		setLoading(false);
	}, []);

	const clearAuth = useCallback(async () => {
		await signOutBackoffice();
		setAuth(null);
		setLoading(false);
	}, []);

	const bootstrapSession = useCallback(async () => {
		try {
			const resolved = await resolveBackofficeSession();
			setAuth((current) => {
				if (current) return current;
				return resolved
					? toAuthContext(resolved.session, resolved.meta)
					: null;
			});
		} catch {
			setAuth((current) => {
				if (current) return current;
				clearSessionMeta();
				return null;
			});
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void bootstrapSession();

		const client = getSupabaseClient();
		const {
			data: { subscription },
		} = client.auth.onAuthStateChange((event, session) => {
			if (event === 'SIGNED_OUT' || !session) {
				clearSessionMeta();
				setAuth(null);
				setLoading(false);
				return;
			}

			let meta = readSessionMeta();

			if (!meta && session.access_token) {
				meta = saveSessionMeta(session.access_token);
			} else if (
				meta &&
				session.access_token &&
				session.access_token !== meta.accessToken
			) {
				meta = updateSessionToken(session.access_token) ?? meta;
			}

			if (!meta || isSessionMetaExpired(meta)) {
				void clearAuth();
				return;
			}

			establishAuth(authSessionFromSignIn(session, meta));
		});

		const intervalId = window.setInterval(() => {
			const meta = readSessionMeta();
			if (!meta || isSessionMetaExpired(meta)) {
				void clearAuth();
			}
		}, SESSION_CHECK_INTERVAL_MS);

		return () => {
			subscription.unsubscribe();
			window.clearInterval(intervalId);
		};
	}, [bootstrapSession, clearAuth, establishAuth]);

	if (loading) return <PageLoading />;
	if (!auth) return <LoginPage onSignedIn={establishAuth} />;

	return (
		<SupabaseAuthContext.Provider value={auth}>
			{children}
		</SupabaseAuthContext.Provider>
	);
}

export function SupabaseAuthGate({ children }: SupabaseAuthGateProps) {
	if ((import.meta.env.VITE_MENU_API ?? 'supabase') !== 'supabase') {
		return children;
	}

	return <SupabaseAuthGateInner>{children}</SupabaseAuthGateInner>;
}
