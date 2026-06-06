import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn.ts';

const buttonVariants = cva(
	'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 active:scale-press',
	{
		variants: {
			variant: {
				default: 'bg-primary text-on-primary hover:bg-primary-hover',
				outline:
					'border border-border bg-surface-elevated text-foreground hover:bg-fill',
				ghost: 'text-foreground hover:bg-fill',
				destructive: 'bg-accent-orange text-on-primary hover:opacity-90',
			},
			size: {
				default: 'h-10 px-4 py-2',
				sm: 'h-8 px-3 text-xs',
				icon: 'h-9 w-9',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
	VariantProps<typeof buttonVariants>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, ...props }, ref) => (
		<button
			ref={ref}
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	),
);
Button.displayName = 'Button';
