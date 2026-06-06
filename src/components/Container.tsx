import type { ReactNode } from 'react';

export type ContainerProps = {
	children: ReactNode;
	id?: string;
	backgroundClassName?: string;
	sectionClassName?: string;
	contentClassName?: string;
};

export function Container({
	children,
	id,
	backgroundClassName = '',
	sectionClassName = '',
	contentClassName = '',
}: ContainerProps) {
	const sectionClasses = ['w-full', backgroundClassName, sectionClassName]
		.filter(Boolean)
		.join(' ');

	const innerClasses = ['container', contentClassName]
		.filter(Boolean)
		.join(' ');

	return (
		<section id={id} className={sectionClasses}>
			<div className={innerClasses}>{children}</div>
		</section>
	);
}
