import type {
	BusinessSettings,
	Category,
	Image,
	Product,
} from '../types/index.ts';

/** Unidad mínima de lectura: la carta completa del negocio. */
export type Snapshot = {
	products: Product[];
	categories: Category[];
	images: Image[];
	settings: BusinessSettings;
	lastModified: string;
};

export type ProductCreateInput = {
	name?: string;
	categoryId?: string;
	price?: number;
	shortDescription?: string;
	visible?: boolean;
	imageId?: string | null;
};

export type ProductUpdateInput = Partial<
	Pick<
		Product,
		| 'name'
		| 'categoryId'
		| 'order'
		| 'price'
		| 'shortDescription'
		| 'visible'
		| 'imageId'
	>
>;

export type ProductImportItem = Omit<
	Product,
	'id' | 'createdAt' | 'updatedAt' | 'order'
>;

export type ProductImportResponse = {
	importedCount: number;
};

export type ProductReorderInput = {
	categoryId: string;
	orderedIds: string[];
};

export type ProductBulkDeleteInput = {
	ids: string[];
};

export type CategoryCreateInput = {
	name?: string;
};

export type CategoryUpdateInput = Partial<
	Pick<Category, 'name' | 'order' | 'visible'>
>;

export type CategoryReorderInput = {
	orderedIds: string[];
};

export type CategoryResolveInput = {
	name?: string;
};

export type ImageCreateInput = {
	name: string;
	url?: string;
	thumbnailUrl?: string;
	fullBlob?: Blob;
	thumbBlob?: Blob;
};

export type BusinessSettingsUpdateInput = Partial<BusinessSettings>;

export type EntityIdResponse = {
	id: string;
};
