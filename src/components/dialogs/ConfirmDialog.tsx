import { X } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { cn } from '../../utils/cn.ts';
import { Button } from '../ui/Button.tsx';

const MODAL_DURATION_MS = 200;

function useModalEscape(open: boolean, onClose: () => void) {
	useEffect(() => {
		if (!open) return;
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') onClose();
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [open, onClose]);
}

type ModalPhase = 'closed' | 'entering' | 'open' | 'leaving';

function useModalTransition(open: boolean) {
	const [phase, setPhase] = useState<ModalPhase>(() =>
		open ? 'entering' : 'closed',
	);
	const [prevOpen, setPrevOpen] = useState(open);

	if (open !== prevOpen) {
		setPrevOpen(open);
		setPhase(open ? 'entering' : 'leaving');
	}

	useEffect(() => {
		if (phase !== 'entering') return;
		const frame = requestAnimationFrame(() => setPhase('open'));
		return () => cancelAnimationFrame(frame);
	}, [phase]);

	useEffect(() => {
		if (phase !== 'leaving') return;
		const timer = window.setTimeout(() => setPhase('closed'), MODAL_DURATION_MS);
		return () => window.clearTimeout(timer);
	}, [phase]);

	return {
		mounted: phase !== 'closed',
		visible: phase === 'open' || phase === 'entering',
	};
}

type ModalFrameProps = {
	open: boolean;
	onClose: () => void;
	children: React.ReactNode;
	panelClassName?: string;
	ariaLabelledBy?: string;
	mobileLayout?: 'sheet' | 'fullscreen';
};

function ModalFrame({
	open,
	onClose,
	children,
	panelClassName,
	ariaLabelledBy,
	mobileLayout = 'sheet',
}: ModalFrameProps) {
	const { mounted, visible } = useModalTransition(open);
	const isFullscreenMobile = mobileLayout === 'fullscreen';

	useModalEscape(open, onClose);

	if (!mounted) return null;

	return (
		<div
			className={cn(
				'fixed inset-0 z-50 flex p-0 lg:items-center lg:justify-center lg:p-4',
				isFullscreenMobile
					? 'max-lg:flex-col'
					: 'max-lg:items-end max-lg:justify-center',
			)}
			role="dialog"
			aria-modal="true"
			aria-labelledby={ariaLabelledBy}>
			<button
				type="button"
				className={cn(
					'absolute inset-0 bg-shadow/40 backdrop-blur-overlay transition-opacity ease-out',
					visible ? 'opacity-100' : 'opacity-0',
					isFullscreenMobile && 'max-lg:pointer-events-none max-lg:opacity-0',
				)}
				style={{ transitionDuration: `${MODAL_DURATION_MS}ms` }}
				onClick={onClose}
				aria-label="Cerrar"
			/>
			<div
				className={cn(
					'relative z-10 w-full transition-all ease-out',
					!isFullscreenMobile && 'max-lg:mx-auto lg:mx-0',
					isFullscreenMobile
						? 'max-lg:flex max-lg:h-dvh max-lg:min-h-0 max-lg:max-h-none max-lg:max-w-none max-lg:flex-col max-lg:items-center max-lg:rounded-none max-lg:border-0'
						: 'max-lg:max-h-[92dvh] max-lg:overflow-y-auto max-lg:rounded-t-2xl max-lg:border-x-0 max-lg:border-t',
					visible
						? cn(
								'opacity-100 lg:scale-100',
								isFullscreenMobile ? 'max-lg:translate-y-0' : 'translate-y-0',
							)
						: cn(
								'opacity-0 lg:translate-y-1 lg:scale-[0.98]',
								isFullscreenMobile
									? 'max-lg:translate-y-0 max-lg:scale-[0.98]'
									: 'translate-y-full',
							),
					panelClassName,
				)}
				style={{ transitionDuration: `${MODAL_DURATION_MS}ms` }}>
				{children}
			</div>
		</div>
	);
}

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
	return (
		<ModalFrame
			open={open}
			onClose={onCancel}
			ariaLabelledBy="confirm-title"
			panelClassName="mx-auto max-w-md rounded-xl border border-separator bg-surface-elevated p-5 shadow-lg lg:p-6 max-lg:rounded-b-none">
			<h2 id="confirm-title" className="text-lg font-semibold text-foreground">
				{title}
			</h2>
			<p className="mt-2 text-sm text-foreground-muted">{description}</p>
			<div className="mt-6 flex flex-col-reverse gap-3 lg:flex-row lg:justify-end">
				<Button variant="outline" onClick={onCancel} className="w-full lg:w-auto">
					{cancelLabel}
				</Button>
				<Button
					variant="destructive"
					onClick={onConfirm}
					className="w-full lg:w-auto">
					{confirmLabel}
				</Button>
			</div>
		</ModalFrame>
	);
}

type DialogProps = {
	open: boolean;
	onClose: () => void;
	title: string;
	description?: string;
	children: React.ReactNode;
	className?: string;
	fullScreenMobile?: boolean;
};

export function Dialog({
	open,
	onClose,
	title,
	description,
	children,
	className,
	fullScreenMobile = true,
}: DialogProps) {
	const titleId = useId();

	return (
		<ModalFrame
			open={open}
			onClose={onClose}
			ariaLabelledBy={titleId}
			mobileLayout={fullScreenMobile ? 'fullscreen' : 'sheet'}
			panelClassName={cn(
				'border border-separator bg-surface-elevated shadow-lg',
				fullScreenMobile &&
					'flex max-lg:h-dvh max-lg:min-h-0 max-lg:w-full max-lg:max-w-none max-lg:flex-col max-lg:border-0 max-lg:p-0 max-lg:shadow-none',
				fullScreenMobile &&
					'flex max-h-[90vh] flex-col overflow-hidden lg:max-w-2xl lg:rounded-xl lg:p-6',
				!fullScreenMobile && 'max-lg:rounded-b-none p-5 max-lg:p-5',
				className,
			)}>
			<div
				className={cn(
					fullScreenMobile &&
						'dialog-content flex min-h-0 flex-1 flex-col overflow-hidden pt-[max(1rem,env(safe-area-inset-top))] pb-[env(safe-area-inset-bottom)] lg:min-h-0 lg:p-0 lg:pt-0 lg:pb-0',
					!fullScreenMobile && 'contents',
				)}>
				<div className="mb-4 flex shrink-0 items-start justify-between gap-3">
					<div className="min-w-0">
						<h2 id={titleId} className="text-lg font-semibold text-foreground">
							{title}
						</h2>
						{description && (
							<p className="mt-1 text-sm text-foreground-muted">{description}</p>
						)}
					</div>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={onClose}
						className="-mr-2 -mt-1 shrink-0"
						aria-label="Cerrar">
						<X className="h-5 w-5" aria-hidden />
					</Button>
				</div>
				<div
					className={cn(
						fullScreenMobile && 'flex min-h-0 flex-1 flex-col overflow-hidden',
					)}>
					{children}
				</div>
			</div>
		</ModalFrame>
	);
}
