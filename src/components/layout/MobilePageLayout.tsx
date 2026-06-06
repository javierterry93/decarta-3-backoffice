import { cn } from '../../utils/cn.ts';

type MobilePageLayoutProps = {
	children: React.ReactNode;
	className?: string;
};

export function MobilePageLayout({
	children,
	className,
}: MobilePageLayoutProps) {
	return (
		<div className={cn('space-y-4 lg:space-y-6', className)}>{children}</div>
	);
}
