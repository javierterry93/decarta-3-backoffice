import {
	PageError,
	PageLoading,
} from '../../components/layout/PageLoading.tsx';
import { useSnapshot } from '../../hooks/useSnapshot.ts';
import { DashboardLayout } from '../../layouts/DashboardLayout.tsx';

export default function DashboardPage() {
	const { data: snapshot, isLoading, error } = useSnapshot();

	if (isLoading) return <PageLoading />;
	if (error || !snapshot) return <PageError />;

	return (
		<DashboardLayout
			products={snapshot.products}
			categories={snapshot.categories}
			lastModified={snapshot.lastModified}
		/>
	);
}
