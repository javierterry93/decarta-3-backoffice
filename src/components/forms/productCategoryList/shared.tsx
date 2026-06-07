import { Copy, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '../../ui/Button.tsx';
import type { Category, Product } from '../../../types/index.ts';
import { cn } from '../../../utils/cn.ts';

export type CategoryProductTableProps = {
	category: Category;
	products: Product[];
	imageMap: Record<string, string>;
	selectedIds: Set<string>;
	onSelectionChange: (ids: Set<string>) => void;
	onReorder: (categoryId: string, orderedIds: string[]) => void;
	onEdit: (productId: string) => void;
	onDuplicate: (productId: string) => void;
	onDelete: (productId: string) => void;
	reorderEnabled?: boolean;
};

export type ProductRowCallbacks = {
	onSelect: (checked: boolean) => void;
	onEdit: () => void;
	onDuplicate: () => void;
	onDelete: () => void;
};

export function useIsLgScreen() {
	const [isLg, setIsLg] = useState(() =>
		typeof window !== 'undefined'
			? window.matchMedia('(min-width: 1024px)').matches
			: false,
	);

	useEffect(() => {
		const media = window.matchMedia('(min-width: 1024px)');
		const onChange = (event: MediaQueryListEvent) => setIsLg(event.matches);
		media.addEventListener('change', onChange);
		return () => media.removeEventListener('change', onChange);
	}, []);

	return isLg;
}

export function CategorySectionHeader({
	category,
	productCount,
}: {
	category: Category;
	productCount: number;
}) {
	return (
		<div className="flex items-center justify-between gap-4">
			<h2 className="text-lg font-semibold text-foreground">
				{category.name || 'Sin nombre'}
			</h2>
			<span className="text-sm text-foreground-muted">
				{productCount} {productCount === 1 ? 'producto' : 'productos'}
			</span>
		</div>
	);
}

export function ProductVisibilityBadge({
	visible,
	compact = false,
}: {
	visible: boolean;
	compact?: boolean;
}) {
	return (
		<span
			className={cn(
				'inline-flex shrink-0 rounded-full font-medium',
				compact ? 'px-1.5 py-0.5 text-[10px] leading-none' : 'px-2 py-0.5 text-xs',
				visible ? 'bg-success/10 text-success' : 'bg-fill text-foreground-muted',
			)}>
			{visible ? 'Visible' : 'Oculto'}
		</span>
	);
}

export function ProductRowActions({
	onEdit,
	onDuplicate,
	onDelete,
}: {
	onEdit: () => void;
	onDuplicate: () => void;
	onDelete: () => void;
}) {
	return (
		<div className="flex justify-end gap-1">
			<Button
				variant="ghost"
				size="icon"
				onClick={onEdit}
				aria-label="Editar producto"
				title="Editar">
				<Pencil className="h-4 w-4" />
			</Button>
			<Button
				variant="ghost"
				size="icon"
				onClick={onDuplicate}
				aria-label="Duplicar producto"
				title="Duplicar">
				<Copy className="h-4 w-4" />
			</Button>
			<Button
				variant="ghost"
				size="icon"
				onClick={onDelete}
				aria-label="Eliminar producto"
				title="Eliminar">
				<Trash2 className="h-4 w-4 text-accent-orange" />
			</Button>
		</div>
	);
}

export function useCategorySelection(
	products: Product[],
	selectedIds: Set<string>,
	onSelectionChange: (ids: Set<string>) => void,
) {
	const allSelected =
		products.length > 0 && products.every((p) => selectedIds.has(p.id));
	const someSelected = products.some((p) => selectedIds.has(p.id));

	const toggleAll = (checked: boolean) => {
		const next = new Set(selectedIds);
		for (const product of products) {
			if (checked) next.add(product.id);
			else next.delete(product.id);
		}
		onSelectionChange(next);
	};

	const toggleOne = (productId: string, checked: boolean) => {
		const next = new Set(selectedIds);
		if (checked) next.add(productId);
		else next.delete(productId);
		onSelectionChange(next);
	};

	return { allSelected, someSelected, toggleAll, toggleOne };
}
