import { Search, X } from 'lucide-react';
import { Input } from '../ui/Input.tsx';
import { Button } from '../ui/Button.tsx';
import { cn } from '../../utils/cn.ts';

type ListSearchInputProps = {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
};

export function ListSearchInput({
	value,
	onChange,
	placeholder = 'Buscar…',
	className,
}: ListSearchInputProps) {
	return (
		<div className={cn('relative', className)}>
			<Search
				className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-foreground-muted"
				aria-hidden
			/>
			<Input
				type="text"
				value={value}
				onChange={(event) => onChange(event.target.value)}
				placeholder={placeholder}
				className="pr-9 pl-9"
				aria-label={placeholder}
			/>
			{value && (
				<Button
					type="button"
					variant="ghost"
					size="icon"
					className="absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2"
					onClick={() => onChange('')}
					aria-label="Limpiar búsqueda">
					<X className="h-4 w-4" />
				</Button>
			)}
		</div>
	);
}

export function ListSearchEmpty({ query }: { query: string }) {
	return (
		<p className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-foreground-muted">
			No hay resultados para «{query.trim()}».
		</p>
	);
}
