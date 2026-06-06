import { type InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn.ts';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
	({ className, type = 'text', ...props }, ref) => (
		<input
			ref={ref}
			type={type}
			className={cn(
				'flex h-9 w-full rounded-md border border-border bg-surface-elevated px-3 py-1 text-sm text-foreground placeholder:text-foreground-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50',
				className,
			)}
			{...props}
		/>
	),
);
Input.displayName = 'Input';
