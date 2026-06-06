import { cn } from '../../utils/cn.ts';

type CardProps = {
	children: React.ReactNode;
	className?: string;
};

export function Card({ children, className }: CardProps) {
	return (
		<div
			className={cn(
				'rounded-xl border border-separator bg-surface-elevated p-6 shadow-sm',
				className,
			)}
		>
			{children}
		</div>
	);
}

export function CardHeader({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div className={cn('mb-4 flex flex-col gap-1', className)}>
			{children}
		</div>
	);
}

export function CardTitle({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<h2 className={cn('text-lg font-semibold text-foreground', className)}>
			{children}
		</h2>
	);
}

export function CardDescription({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<p className={cn('text-sm text-foreground-muted', className)}>
			{children}
		</p>
	);
}
