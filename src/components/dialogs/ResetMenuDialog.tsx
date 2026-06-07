import { useEffect, useState } from 'react';
import { Dialog } from './ConfirmDialog.tsx';
import { Button } from '../ui/Button.tsx';
import { Input } from '../ui/Input.tsx';
import { Label } from '../ui/Label.tsx';

export const RESET_MENU_CONFIRMATION_TEXT = 'ELIMINAR';

type ResetMenuDialogProps = {
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
	isPending?: boolean;
};

export function ResetMenuDialog({
	open,
	onClose,
	onConfirm,
	isPending = false,
}: ResetMenuDialogProps) {
	const [confirmation, setConfirmation] = useState('');

	useEffect(() => {
		if (!open) setConfirmation('');
	}, [open]);

	const canConfirm = confirmation === RESET_MENU_CONFIRMATION_TEXT && !isPending;

	return (
		<Dialog
			open={open}
			onClose={onClose}
			title="Borrar toda la carta"
			fullScreenMobile={false}>
			<div className="space-y-4">
				<p className="text-sm text-foreground-muted">
					Esta acción elimina productos, categorías, imágenes y restaura la
					configuración del local. No se puede deshacer.
				</p>

				<div className="space-y-2">
					<Label htmlFor="reset-confirmation">
						Escribe{' '}
						<span className="font-semibold text-foreground">
							{RESET_MENU_CONFIRMATION_TEXT}
						</span>{' '}
						para confirmar
					</Label>
					<Input
						id="reset-confirmation"
						value={confirmation}
						onChange={(e) => setConfirmation(e.target.value)}
						placeholder={RESET_MENU_CONFIRMATION_TEXT}
						autoComplete="off"
						spellCheck={false}
					/>
				</div>

				<div className="flex flex-col-reverse gap-3 pt-2 lg:flex-row lg:justify-end">
					<Button
						variant="outline"
						onClick={onClose}
						disabled={isPending}
						className="w-full lg:w-auto">
						Cancelar
					</Button>
					<Button
						variant="destructive"
						onClick={onConfirm}
						disabled={!canConfirm}
						className="w-full lg:w-auto">
						Borrar todo
					</Button>
				</div>
			</div>
		</Dialog>
	);
}
