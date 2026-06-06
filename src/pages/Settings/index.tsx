import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ImageUploader } from '../../components/forms/ImageUploader.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Input } from '../../components/ui/Input.tsx';
import { Label } from '../../components/ui/Label.tsx';
import { Card, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card.tsx';
import { useAutoSaveToast } from '../../hooks/useAutoSaveToast.ts';
import { useMenuStore } from '../../store/menuStore.ts';
import { useEffect } from 'react';

const settingsSchema = z.object({
	name: z.string().min(1, 'El nombre es obligatorio'),
	phone: z.string(),
	address: z.string(),
	hours: z.string(),
	socialInstagram: z.string(),
	socialFacebook: z.string(),
	socialTwitter: z.string(),
});

type SettingsForm = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
	const settings = useMenuStore((s) => s.settings);
	const updateSettings = useMenuStore((s) => s.updateSettings);
	const showToast = useAutoSaveToast();

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<SettingsForm>({
		resolver: zodResolver(settingsSchema),
		defaultValues: {
			name: settings.name,
			phone: settings.phone,
			address: settings.address,
			hours: settings.hours,
			socialInstagram: settings.socialInstagram,
			socialFacebook: settings.socialFacebook,
			socialTwitter: settings.socialTwitter,
		},
	});

	useEffect(() => {
		reset({
			name: settings.name,
			phone: settings.phone,
			address: settings.address,
			hours: settings.hours,
			socialInstagram: settings.socialInstagram,
			socialFacebook: settings.socialFacebook,
			socialTwitter: settings.socialTwitter,
		});
	}, [settings, reset]);

	const onSubmit = handleSubmit((data) => {
		updateSettings(data);
		showToast('Configuración guardada');
	});

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold text-foreground">
					Configuración
				</h1>
				<p className="mt-1 text-sm text-foreground-muted">
					Datos generales de tu negocio
				</p>
			</div>

			<form onSubmit={onSubmit} className="max-w-xl space-y-6">
				<Card>
					<CardHeader>
						<CardTitle>Datos del local</CardTitle>
						<CardDescription>
							Información que verán tus clientes
						</CardDescription>
					</CardHeader>

					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="name">Nombre del local</Label>
							<Input id="name" {...register('name')} />
							{errors.name && (
								<p className="text-xs text-accent-orange">
									{errors.name.message}
								</p>
							)}
						</div>

						<div className="space-y-2">
							<Label>Logo</Label>
							{settings.logoUrl ? (
								<div className="flex items-center gap-4">
									<img
										src={settings.logoUrl}
										alt="Logo"
										className="h-16 w-16 rounded-full object-cover"
									/>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() => {
											updateSettings({ logoUrl: null });
											showToast('Logo eliminado');
										}}
									>
										Quitar logo
									</Button>
								</div>
							) : (
								<ImageUploader
									compact
									onUploaded={(id) => {
										const img = useMenuStore
											.getState()
											.images.find((i) => i.id === id);
										if (img) {
											updateSettings({ logoUrl: img.url });
											showToast('Logo subido');
										}
									}}
								/>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="phone">Teléfono</Label>
							<Input id="phone" type="tel" {...register('phone')} />
						</div>

						<div className="space-y-2">
							<Label htmlFor="address">Dirección</Label>
							<Input id="address" {...register('address')} />
						</div>

						<div className="space-y-2">
							<Label htmlFor="hours">Horarios</Label>
							<Input
								id="hours"
								placeholder="Lun–Dom: 12:00–23:00"
								{...register('hours')}
							/>
						</div>
					</div>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Redes sociales</CardTitle>
					</CardHeader>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="instagram">Instagram</Label>
							<Input
								id="instagram"
								placeholder="@tulocal"
								{...register('socialInstagram')}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="facebook">Facebook</Label>
							<Input
								id="facebook"
								{...register('socialFacebook')}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="twitter">X / Twitter</Label>
							<Input id="twitter" {...register('socialTwitter')} />
						</div>
					</div>
				</Card>

				<Button type="submit">Guardar cambios</Button>
			</form>
		</div>
	);
}
