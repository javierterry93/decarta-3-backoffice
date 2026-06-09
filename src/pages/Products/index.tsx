import { useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
	PageError,
	PageLoading,
} from '../../components/layout/PageLoading.tsx';
import { toast } from 'sonner';
import {
	useProductMutations,
	useProductsPageData,
} from '../../hooks/useProductsPage.ts';
import { useImageThumbnailMap } from '../../hooks/useImageUrls.ts';
import { ProductsLayout } from '../../layouts/ProductsLayout.tsx';

export default function ProductsPage() {
	const { products, categories, images, isLoading, error } =
		useProductsPageData();
	const mutations = useProductMutations();
	const showToast = useCallback(
		(message: string) => toast.success(message, { duration: 3000 }),
		[],
	);
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();

	const visibilityFilter =
		searchParams.get('filtro') === 'ocultos' ? 'hidden' : 'all';
	const editProductId = searchParams.get('editar');

	const clearEditParam = useCallback(() => {
		if (!searchParams.get('editar')) return;
		const params = new URLSearchParams(searchParams);
		params.delete('editar');
		const search = params.toString();
		navigate(
			{ pathname: '/carta', search: search || undefined },
			{ replace: true },
		);
	}, [navigate, searchParams]);

	const imageMap = useImageThumbnailMap(images ?? []);

	const handleDeleteProducts = useCallback(
		async (ids: string[]) => {
			await mutations.deleteProducts.mutateAsync({ ids });
			showToast(`${ids.length} productos eliminados`);
		},
		[mutations.deleteProducts, showToast],
	);

	if (isLoading) return <PageLoading />;
	if (
		error ||
		products === undefined ||
		categories === undefined ||
		images === undefined
	) {
		return <PageError message={error?.message} />;
	}

	return (
		<ProductsLayout
			products={products}
			categories={categories}
			images={images}
			imageMap={imageMap}
			visibilityFilter={visibilityFilter}
			onClearVisibilityFilter={() => navigate('/carta')}
			editProductId={editProductId}
			onCloseEditor={clearEditParam}
			onAddProduct={async (data) => {
				await mutations.createProduct.mutateAsync(data);
				showToast('Producto creado');
			}}
			onUpdateProduct={async (id, data) => {
				await mutations.updateProduct.mutateAsync({ id, input: data });
				showToast('Producto guardado');
			}}
			onDuplicateProduct={async (id) => {
				await mutations.duplicateProduct.mutateAsync(id);
				showToast('Producto duplicado');
			}}
			onDeleteProduct={(id) => mutations.deleteProduct.mutate(id)}
			onDeleteProducts={handleDeleteProducts}
			onReorderProducts={(categoryId, orderedIds) =>
				mutations.reorderProducts.mutate({ categoryId, orderedIds })
			}
			onNotify={showToast}
		/>
	);
}
