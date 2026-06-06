import { cn } from '../../utils/cn.ts';
import { Button } from '../ui/Button.tsx';

type ConfirmDialogProps = {
	open: boolean;
	title: string;
	description: string;
	confirmLabel?: string;
	cancelLabel?: string;
	onConfirm: () => void;
	onCancel: () => void;
};

export function ConfirmDialog({
	open,
	title,
	description,
	confirmLabel = 'Eliminar',
	cancelLabel = 'Cancelar',
	onConfirm,
	onCancel,
}: ConfirmDialogProps) {
	if (!open) return null;

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-4"
			role="dialog"
			aria-modal="true"
			aria-labelledby="confirm-title"
		>
			<button
				type="button"
				className="absolute inset-0 bg-shadow/40 backdrop-blur-overlay"
				onClick={onCancel}
				aria-label="Cerrar"
			/>
			<div className="relative z-10 w-full max-w-md rounded-xl border border-separator bg-surface-elevated p-6 shadow-lg">
				<h2
					id="confirm-title"
					className="text-lg font-semibold text-foreground"
				>
					{title}
				</h2>
				<p className="mt-2 text-sm text-foreground-muted">
					{description}
				</p>
				<div className="mt-6 flex justify-end gap-3">
					<Button variant="outline" onClick={onCancel}>
						{cancelLabel}
					</Button>
					<Button variant="destructive" onClick={onConfirm}>
						{confirmLabel}
					</Button>
				</div>
			</div>
		</div>
	);
}

type DialogProps = {
	open: boolean;
	onClose: () => void;
	title: string;
	children: React.ReactNode;
	className?: string;
};

export function Dialog({
	open,
	onClose,
	title,
	children,
	className,
}: DialogProps) {
	if (!open) return null;

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-4"
			role="dialog"
			aria-modal="true"
		>
			<button
				type="button"
				className="absolute inset-0 bg-shadow/40 backdrop-blur-overlay"
				onClick={onClose}
				aria-label="Cerrar"
			/>
			<div
				className={cn(
					'relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-separator bg-surface-elevated p-6 shadow-lg',
					className,
				)}
			>
				<h2 className="mb-4 text-lg font-semibold text-foreground">
					{title}
				</h2>
				{children}
			</div>
		</div>
	);
}
