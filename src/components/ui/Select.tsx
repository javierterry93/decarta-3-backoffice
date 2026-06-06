import { cn } from '../../utils/cn.ts';

type SelectProps = {
	value: string;
	onChange: (value: string) => void;
	options: { value: string; label: string }[];
	className?: string;
	placeholder?: string;
};

export function Select({
	value,
	onChange,
	options,
	className,
	placeholder = 'Seleccionar…',
}: SelectProps) {
	return (
		<select
			value={value}
			onChange={(e) => onChange(e.target.value)}
			className={cn(
				'flex h-9 w-full rounded-md border border-border bg-surface-elevated px-3 py-1 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
				className,
			)}
		>
			{!value && (
				<option value="" disabled>
					{placeholder}
				</option>
			)}
			{options.map((opt) => (
				<option key={opt.value} value={opt.value}>
					{opt.label}
				</option>
			))}
		</select>
	);
}
