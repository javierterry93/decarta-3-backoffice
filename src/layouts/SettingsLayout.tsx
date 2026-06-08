import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
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
import { MenuImportExportSection } from '../components/forms/MenuImportExportSection.tsx';
import { ResetMenuDialog } from '../components/dialogs/ResetMenuDialog.tsx';
import type {
	BusinessSettings,
	Category,
	ExcelColumnMapping,
	MenuImage,
	Product,
} from '../types/index.ts';

type ExcelPreviewRow = Record<string, string | number>;

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
	categories: Category[];
	images: MenuImage[];
	onSaveSettings: (data: SettingsForm) => void;
	onUploadImage: (file: File) => Promise<string>;
	onSetLogo: (imageId: string) => void;
	onRemoveLogo: () => void;
	onExportExcel: () => void;
	onExportCsv: () => void;
	onImportProducts: (
		items: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'order'>[],
	) => void;
	parseExcelFile: (file: File) => Promise<{
		columns: string[];
		rows: ExcelPreviewRow[];
	}>;
	guessColumnMappings: (columns: string[]) => ExcelColumnMapping[];
	mapRowsToProducts: (
		rows: ExcelPreviewRow[],
		mappings: ExcelColumnMapping[],
		categories: Category[],
	) => Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'order'>[];
	onResetMenu: () => Promise<void>;
	onNotify: (message: string) => void;
	onSignOut?: () => Promise<void>;
	sessionExpiresAt?: number;
};

function LogoPreview({
	logoImage,
	onRemove,
}: {
	logoImage: MenuImage;
	onRemove: () => void;
}) {
	return (
		<div className="flex items-center gap-4">
			{logoImage.url ? (
				<img
					src={logoImage.url}
					alt="Logo"
					className="h-16 w-16 rounded-full object-cover"
				/>
			) : (
				<div className="flex h-16 w-16 items-center justify-center rounded-full bg-fill text-xs text-foreground-muted">
					…
				</div>
			)}
			<Button type="button" variant="outline" size="sm" onClick={onRemove}>
				Quitar logo
			</Button>
		</div>
	);
}

export function SettingsLayout({
	settings,
	categories,
	images,
	onSaveSettings,
	onUploadImage,
	onSetLogo,
	onRemoveLogo,
	onExportExcel,
	onExportCsv,
	onImportProducts,
	parseExcelFile,
	guessColumnMappings,
	mapRowsToProducts,
	onResetMenu,
	onNotify,
	onSignOut,
	sessionExpiresAt,
}: SettingsLayoutProps) {
	const logoImage = settings.logoImageId
		? images.find((i) => i.id === settings.logoImageId)
		: undefined;
	const [resetOpen, setResetOpen] = useState(false);
	const [isResetting, setIsResetting] = useState(false);
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

			<div className="mx-auto w-full max-w-xl space-y-6">
				<form onSubmit={onSubmit} className="space-y-6">
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
								{logoImage ? (
									<LogoPreview
										logoImage={logoImage}
										onRemove={() => {
											onRemoveLogo();
											onNotify('Logo eliminado');
										}}
									/>
								) : (
									<ImageUploader
										compact
										multiple={false}
										onUpload={async (files) => {
											const id = await onUploadImage(files[0]!);
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

				<MenuImportExportSection
					categories={categories}
					onExportExcel={onExportExcel}
					onExportCsv={onExportCsv}
					onImportProducts={onImportProducts}
					parseExcelFile={parseExcelFile}
					guessColumnMappings={guessColumnMappings}
					mapRowsToProducts={mapRowsToProducts}
					onNotify={onNotify}
				/>

				{onSignOut && (
					<Card>
						<CardHeader>
							<CardTitle>Sesión</CardTitle>
							<CardDescription>
								{sessionExpiresAt
									? `Expira a las ${new Date(sessionExpiresAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`
									: 'Cuenta del backoffice'}
							</CardDescription>
						</CardHeader>
						<Button type="button" variant="outline" onClick={() => void onSignOut()}>
							Cerrar sesión
						</Button>
					</Card>
				)}

				<Card className="border-accent-orange/20">
					<CardHeader>
						<CardTitle>Zona peligrosa</CardTitle>
						<CardDescription>
							Elimina toda la carta y restaura la configuración por defecto
						</CardDescription>
					</CardHeader>
					<Button
						type="button"
						variant="destructive"
						onClick={() => setResetOpen(true)}>
						<Trash2 className="h-4 w-4" />
						Borrar toda la carta
					</Button>
				</Card>
			</div>

			<ResetMenuDialog
				open={resetOpen}
				onClose={() => {
					if (!isResetting) setResetOpen(false);
				}}
				isPending={isResetting}
				onConfirm={() => {
					setIsResetting(true);
					void onResetMenu()
						.then(() => {
							setResetOpen(false);
							onNotify('Carta borrada');
						})
						.catch(() => {
							onNotify('No se pudo borrar la carta');
						})
						.finally(() => {
							setIsResetting(false);
						});
				}}
			/>
		</MobilePageLayout>
	);
}
