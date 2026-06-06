import {
	PageError,
	PageLoading,
} from '../../components/layout/PageLoading.tsx';
import { useMenu } from '../../hooks/useMenu.ts';
import { DashboardLayout } from '../../layouts/DashboardLayout.tsx';

export default function DashboardPage() {
	const { data: menu, isLoading, error } = useMenu();

	if (isLoading) return <PageLoading />;
	if (error || !menu) return <PageError />;

	return (
		<DashboardLayout
			products={menu.products}
			categories={menu.categories}
			lastModified={menu.lastModified}
		/>
	);
}
