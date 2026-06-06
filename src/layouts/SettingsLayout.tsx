import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MobilePageLayout } from '../components/layout/MobilePageLayout.tsx';
import { ImageUploader } from '../components/forms/ImageUploader.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Input } from '../components/ui/Input.tsx';
import { Label } from '../components/ui/Label.tsx';
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from '../components/ui/Card.tsx';
import type { BusinessSettings } from '../types/index.ts';

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

type SettingsLayoutProps = {
	settings: BusinessSettings;
	onSaveSettings: (data: SettingsForm) => void;
	onUploadImage: (file: File) => Promise<string>;
	onSetLogo: (imageId: string) => void;
	onRemoveLogo: () => void;
	onNotify: (message: string) => void;
};

export function SettingsLayout({
	settings,
	onSaveSettings,
	onUploadImage,
	onSetLogo,
	onRemoveLogo,
	onNotify,
}: SettingsLayoutProps) {
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
		onSaveSettings(data);
		onNotify('Configuración guardada');
	});

	return (
		<MobilePageLayout>
			<div className="hidden lg:block">
				<h1 className="text-2xl font-bold text-foreground">Configuración</h1>
				<p className="mt-1 text-sm text-foreground-muted">
					Datos generales de tu negocio
				</p>
			</div>

			<form onSubmit={onSubmit} className="w-full max-w-xl space-y-6">
				<Card>
					<CardHeader>
						<CardTitle>Datos del local</CardTitle>
						<CardDescription>Información que verán tus clientes</CardDescription>
					</CardHeader>

					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="name">Nombre del local</Label>
							<Input id="name" {...register('name')} />
							{errors.name && (
								<p className="text-xs text-accent-orange">{errors.name.message}</p>
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
											onRemoveLogo();
											onNotify('Logo eliminado');
										}}>
										Quitar logo
									</Button>
								</div>
							) : (
								<ImageUploader
									compact
									onUpload={async (file) => {
										const id = await onUploadImage(file);
										onSetLogo(id);
										onNotify('Logo subido');
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
							<Input id="facebook" {...register('socialFacebook')} />
						</div>
						<div className="space-y-2">
							<Label htmlFor="twitter">X / Twitter</Label>
							<Input id="twitter" {...register('socialTwitter')} />
						</div>
					</div>
				</Card>

				<Button
					type="submit"
					className="sticky bottom-0 w-full lg:static lg:w-auto">
					Guardar cambios
				</Button>
			</form>
		</MobilePageLayout>
	);
}
