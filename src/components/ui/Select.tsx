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
				'flex h-11 w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary lg:h-9 lg:text-sm',
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
