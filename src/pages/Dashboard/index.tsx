import { useMenuStore } from '../../store/menuStore.ts';
import { DashboardLayout } from '../../layouts/DashboardLayout.tsx';

export default function DashboardPage() {
	const products = useMenuStore((s) => s.products);
	const categories = useMenuStore((s) => s.categories);
	const lastModified = useMenuStore((s) => s.lastModified);

	return (
		<DashboardLayout
			products={products}
			categories={categories}
			lastModified={lastModified}
		/>
	);
}
