import { type InputHTMLAttributes, useEffect, useState } from 'react';
import { cn } from '../../utils/cn.ts';
import {
	formatEuroPriceInput,
	parseEuroPriceString,
} from '../../utils/currency.ts';
import { Input } from '../ui/Input.tsx';

type EuroPriceInputProps = Omit<
	InputHTMLAttributes<HTMLInputElement>,
	'type' | 'value' | 'onChange' | 'inputMode'
> & {
	value: number;
	onChange: (value: number) => void;
};

export function EuroPriceInput({
	value,
	onChange,
	className,
	id,
	onBlur,
	onFocus,
	...props
}: EuroPriceInputProps) {
	const [text, setText] = useState(() => formatEuroPriceInput(value));
	const [focused, setFocused] = useState(false);

	useEffect(() => {
		if (!focused) {
			setText(formatEuroPriceInput(value));
		}
	}, [value, focused]);

	return (
		<div className="relative">
			<Input
				{...props}
				id={id}
				type="text"
				inputMode="decimal"
				autoComplete="off"
				value={focused ? text : formatEuroPriceInput(value)}
				className={cn('pr-9', className)}
				onFocus={(event) => {
					setFocused(true);
					setText(formatEuroPriceInput(value));
					onFocus?.(event);
				}}
				onBlur={(event) => {
					setFocused(false);
					const parsed = parseEuroPriceString(text);
					onChange(parsed);
					setText(formatEuroPriceInput(parsed));
					onBlur?.(event);
				}}
				onChange={(event) => {
					const nextText = event.target.value;
					setText(nextText);
					onChange(parseEuroPriceString(nextText));
				}}
			/>
			<span
				className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-foreground-muted"
				aria-hidden>
				€
			</span>
		</div>
	);
}
