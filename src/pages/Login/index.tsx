import { type FormEvent, useState } from 'react';
import { toast } from 'sonner';
import {
	signInWithPassword,
	type BackofficeAuthSession,
} from '../../auth/supabaseAuthService.ts';
import { Button } from '../../components/ui/Button.tsx';
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from '../../components/ui/Card.tsx';
import { Input } from '../../components/ui/Input.tsx';
import { Label } from '../../components/ui/Label.tsx';

type LoginPageProps = {
	onSignedIn?: (auth: BackofficeAuthSession) => void | Promise<void>;
};

export default function LoginPage({ onSignedIn }: LoginPageProps) {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [submitting, setSubmitting] = useState(false);

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault();
		setSubmitting(true);

		try {
			const authSession = await signInWithPassword(email, password);
			const expiresAt = new Date(authSession.meta.expiresAt).toLocaleTimeString(
				'es-ES',
				{
					hour: '2-digit',
					minute: '2-digit',
				},
			);
			toast.success(`Sesión iniciada · expira a las ${expiresAt}`);
			await onSignedIn?.(authSession);
		} catch (error) {
			const message =
				error instanceof Error ? error.message : 'No se pudo iniciar sesión';
			toast.error(message);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="flex min-h-dvh items-center justify-center bg-surface px-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Mi Carta · Backoffice</CardTitle>
					<CardDescription>
						Inicia sesión para gestionar la carta. La sesión dura 4 horas.
					</CardDescription>
				</CardHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="login-email">Email</Label>
						<Input
							id="login-email"
							type="email"
							autoComplete="username"
							value={email}
							onChange={(event) => setEmail(event.target.value)}
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="login-password">Contraseña</Label>
						<Input
							id="login-password"
							type="password"
							autoComplete="current-password"
							value={password}
							onChange={(event) => setPassword(event.target.value)}
							required
						/>
					</div>

					<Button type="submit" className="w-full" disabled={submitting}>
						{submitting ? 'Entrando…' : 'Entrar'}
					</Button>
				</form>
			</Card>
		</div>
	);
}
