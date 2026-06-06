import { useMemo } from 'react';
import { cn } from '../../utils/cn.ts';
import type { Category, MenuImage, Product } from '../../types/index.ts';
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
	images: MenuImage[];
	selectedIds: Set<string>;
	onSelectionChange: (ids: Set<string>) => void;
	onReorder: (categoryId: string, orderedIds: string[]) => void;
	onEdit: (productId: string) => void;
	onDuplicate: (productId: string) => void;
	onDelete: (productId: string) => void;
	className?: string;
};

function CategoryProductTable(props: CategoryProductTableProps) {
	const isLg = useIsLgScreen();
	const { category, products } = props;

	if (products.length === 0) return null;

	return (
		<section className="space-y-3">
			<CategorySectionHeader
				category={category}
				productCount={products.length}
			/>
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
	images,
	selectedIds,
	onSelectionChange,
	onReorder,
	onEdit,
	onDuplicate,
	onDelete,
	className,
}: ProductCategoryListProps) {
	const imageMap = useMemo(
		() => Object.fromEntries(images.map((i) => [i.id, i.thumbnailUrl])),
		[images],
	);

	const sortedCategories = useMemo(
		() => [...categories].sort((a, b) => a.order - b.order),
		[categories],
	);

	const productsByCategory = useMemo(() => {
		const map = new Map<string, Product[]>();
		for (const category of categories) {
			map.set(category.id, []);
		}
		for (const product of products) {
			const list = map.get(product.categoryId);
			if (list) list.push(product);
		}
		for (const [, list] of map) {
			list.sort((a, b) => a.order - b.order);
		}
		return map;
	}, [products, categories]);

	if (products.length === 0) {
		return (
			<p className="rounded-xl border border-dashed border-border py-12 text-center text-foreground-muted">
				Aún no hay productos. Pulsa «Nuevo producto» para empezar.
			</p>
		);
	}

	return (
		<div className={cn('space-y-8', className)}>
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
				/>
			))}
		</div>
	);
}
