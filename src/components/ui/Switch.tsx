import { cn } from '../../utils/cn.ts';

type SwitchProps = {
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
	label?: string;
	className?: string;
};

export function Switch({
	checked,
	onCheckedChange,
	label,
	className,
}: SwitchProps) {
	return (
		<label
			className={cn('inline-flex cursor-pointer items-center gap-2', className)}>
			<button
				type="button"
				role="switch"
				aria-checked={checked}
				onClick={() => onCheckedChange(!checked)}
				className={cn(
					'relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
					checked ? 'bg-success' : 'bg-border',
				)}>
				<span
					className={cn(
						'pointer-events-none block h-5 w-5 rounded-full bg-surface-elevated shadow transition-transform',
						checked ? 'translate-x-5' : 'translate-x-0',
					)}
				/>
			</button>
			{label && <span className="text-sm text-foreground">{label}</span>}
		</label>
	);
}
