import { useMemo, useState } from 'react';
import { cn } from '../../utils/cn.ts';
import type { Category, Product } from '../../types/index.ts';
import {
	isSearchActive,
	matchesSearchQuery,
} from '../../utils/searchText.ts';
import { matchesPriceSearchQuery } from '../../utils/currency.ts';
import { ListSearchEmpty, ListSearchInput } from './ListSearchInput.tsx';
import { DesktopCategoryProductTable } from './productCategoryList/DesktopCategoryProductTable.tsx';
import { MobileCategoryProductTable } from './productCategoryList/MobileCategoryProductTable.tsx';
import {
	CategorySectionHeader,
	type CategoryProductTableProps,
	useIsLgScreen,
} from './productCategoryList/shared.tsx';

type ProductCategoryListProps = {
	products: Product[];
	categories: Category[];
	imageMap: Record<string, string>;
	selectedIds: Set<string>;
	onSelectionChange: (ids: Set<string>) => void;
	onReorder: (categoryId: string, orderedIds: string[]) => void;
	onEdit: (productId: string) => void;
	onDuplicate: (productId: string) => void;
	onDelete: (productId: string) => void;
	className?: string;
};

function productMatchesSearch(
	product: Product,
	categoryName: string,
	query: string,
): boolean {
	return (
		matchesSearchQuery(product.name, query) ||
		matchesSearchQuery(product.shortDescription ?? '', query) ||
		matchesSearchQuery(categoryName, query) ||
		matchesPriceSearchQuery(product.price, query)
	);
}

function CategoryProductTable(props: CategoryProductTableProps) {
	const isLg = useIsLgScreen();
	const { category, products } = props;

	if (products.length === 0) return null;

	return (
		<section className="space-y-3">
			<CategorySectionHeader category={category} productCount={products.length} />
			{isLg ? (
				<DesktopCategoryProductTable {...props} />
			) : (
				<MobileCategoryProductTable {...props} />
			)}
		</section>
	);
}

export function ProductCategoryList({
	products,
	categories,
	imageMap,
	selectedIds,
	onSelectionChange,
	onReorder,
	onEdit,
	onDuplicate,
	onDelete,
	className,
}: ProductCategoryListProps) {
	const [query, setQuery] = useState('');
	const reorderEnabled = !isSearchActive(query);

	const sortedCategories = useMemo(
		() => [...categories].sort((a, b) => a.order - b.order),
		[categories],
	);

	const categoryNameById = useMemo(
		() => Object.fromEntries(categories.map((category) => [category.id, category.name])),
		[categories],
	);

	const filteredProducts = useMemo(() => {
		if (!isSearchActive(query)) return products;
		return products.filter((product) =>
			productMatchesSearch(
				product,
				categoryNameById[product.categoryId] ?? '',
				query,
			),
		);
	}, [products, query, categoryNameById]);

	const productsByCategory = useMemo(() => {
		const map = new Map<string, Product[]>();
		for (const category of categories) {
			map.set(category.id, []);
		}
		for (const product of filteredProducts) {
			const list = map.get(product.categoryId);
			if (list) list.push(product);
		}
		for (const [, list] of map) {
			list.sort((a, b) => a.order - b.order);
		}
		return map;
	}, [filteredProducts, categories]);

	if (products.length === 0) {
		return (
			<p className="rounded-xl border border-dashed border-border py-12 text-center text-foreground-muted">
				Aún no hay productos. Pulsa «Nuevo producto» para empezar.
			</p>
		);
	}

	return (
		<div className={cn('space-y-4', className)}>
			<ListSearchInput
				value={query}
				onChange={setQuery}
				placeholder="Buscar productos…"
			/>
			{filteredProducts.length === 0 ? (
				<ListSearchEmpty query={query} />
			) : (
				<div className="space-y-8">
					{sortedCategories.map((category) => (
						<CategoryProductTable
							key={category.id}
							category={category}
							products={productsByCategory.get(category.id) ?? []}
							imageMap={imageMap}
							selectedIds={selectedIds}
							onSelectionChange={onSelectionChange}
							onReorder={onReorder}
							onEdit={onEdit}
							onDuplicate={onDuplicate}
							onDelete={onDelete}
							reorderEnabled={reorderEnabled}
						/>
					))}
				</div>
			)}
		</div>
	);
}
