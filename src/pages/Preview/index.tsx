import { useMenuStore } from '../../store/menuStore.ts';
import { PreviewLayout } from '../../layouts/PreviewLayout.tsx';

export default function PreviewPage() {
	const products = useMenuStore((s) => s.products);
	const categories = useMenuStore((s) => s.categories);
	const settings = useMenuStore((s) => s.settings);
	const images = useMenuStore((s) => s.images);

	return (
		<PreviewLayout
			products={products}
			categories={categories}
			settings={settings}
			images={images}
		/>
	);
}
