import { useCallback } from 'react';

import { useMenuStore } from '../../store/menuStore.ts';

import { useAutoSaveToast } from '../../hooks/useAutoSaveToast.ts';

import { ProductsLayout } from '../../layouts/ProductsLayout.tsx';

import {

	exportToCsv,

	exportToExcel,

	guessColumnMappings,

	mapRowsToProducts,

	parseExcelFile,

} from '../../services/excelService.ts';

import { menuService } from '../../services/menuService.ts';



export default function ProductsPage() {

	const products = useMenuStore((s) => s.products);

	const categories = useMenuStore((s) => s.categories);

	const images = useMenuStore((s) => s.images);

	const showToast = useAutoSaveToast();



	const handleExportExcel = useCallback(() => {

		exportToExcel(products, categories);

	}, [products, categories]);



	const handleExportCsv = useCallback(() => {

		exportToCsv(products, categories);

	}, [products, categories]);



	const handleDeleteProducts = useCallback((ids: string[]) => {

		for (const id of ids) menuService.deleteProduct(id);

	}, []);



	return (

		<ProductsLayout

			products={products}

			categories={categories}

			images={images}

			onAddProduct={(data) => menuService.addProduct(data)}

			onUpdateProduct={(id, data) => menuService.updateProduct(id, data)}

			onDuplicateProduct={(id) => menuService.duplicateProduct(id)}

			onDeleteProduct={(id) => menuService.deleteProduct(id)}

			onDeleteProducts={handleDeleteProducts}

			onReorderProducts={(categoryId, orderedIds) =>

				menuService.reorderProducts(categoryId, orderedIds)

			}

			onExportExcel={handleExportExcel}

			onExportCsv={handleExportCsv}

			onImportProducts={(items) => menuService.importProducts(items)}

			onResolveCategoryId={(name) => menuService.resolveCategoryId(name)}

			parseExcelFile={parseExcelFile}

			guessColumnMappings={guessColumnMappings}

			mapRowsToProducts={mapRowsToProducts}

			onNotify={showToast}

		/>

	);

}


