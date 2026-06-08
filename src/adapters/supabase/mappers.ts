import type {
	BusinessSettingsUpdatePatch,
	CategoryUpdatePatch,
	ProductUpdatePatch,
} from '../../database/MenuRepository.ts';
import type {
	BusinessSettings,
	Category,
	MenuImage,
	Product,
} from '../../types/index.ts';
import type {
	BusinessRow,
	CategoryRow,
	MenuImageRow,
	ProductRow,
} from '../../database/supabase/types.ts';

export function mapCategoryRow(row: CategoryRow): Category {
	return {
		id: row.id,
		name: row.name,
		order: row.sort_order,
		visible: row.visible,
	};
}

export function mapProductRow(row: ProductRow): Product {
	return {
		id: row.id,
		name: row.name,
		categoryId: row.category_id,
		order: row.sort_order,
		price: Number(row.price),
		shortDescription: row.short_description,
		visible: row.visible,
		imageId: row.image_id,
		createdAt: row.created_at,
		updatedAt: row.updated_at,
	};
}

export function mapMenuImageRow(row: MenuImageRow): MenuImage {
	return {
		id: row.id,
		name: row.name,
		createdAt: row.created_at,
		...(row.url ? { url: row.url } : {}),
		...(row.thumbnail_url ? { thumbnailUrl: row.thumbnail_url } : {}),
	};
}

export function mapBusinessRow(row: BusinessRow): BusinessSettings {
	return {
		name: row.name,
		logoImageId: row.logo_image_id,
		phone: row.phone,
		address: row.address,
		hours: row.hours,
		socialInstagram: row.social_instagram,
		socialFacebook: row.social_facebook,
		socialTwitter: row.social_twitter,
	};
}

export function toCategoryInsert(
	category: Pick<Category, 'id' | 'name' | 'order' | 'visible'>,
	businessId: string,
): CategoryRow {
	return {
		id: category.id,
		business_id: businessId,
		name: category.name,
		sort_order: category.order,
		visible: category.visible,
	};
}

export function toProductInsert(
	product: Pick<
		Product,
		| 'id'
		| 'name'
		| 'categoryId'
		| 'order'
		| 'price'
		| 'shortDescription'
		| 'visible'
		| 'imageId'
		| 'createdAt'
		| 'updatedAt'
	>,
): ProductRow {
	return {
		id: product.id,
		name: product.name,
		category_id: product.categoryId,
		sort_order: product.order,
		price: product.price,
		short_description: product.shortDescription,
		visible: product.visible,
		image_id: product.imageId,
		created_at: product.createdAt,
		updated_at: product.updatedAt,
	};
}

export function toMenuImageInsert(
	image: Pick<MenuImage, 'id' | 'name' | 'createdAt'> & {
		url?: string;
		thumbnailUrl?: string;
	},
	businessId: string,
): MenuImageRow {
	return {
		id: image.id,
		business_id: businessId,
		name: image.name,
		url: image.url ?? null,
		thumbnail_url: image.thumbnailUrl ?? null,
		created_at: image.createdAt,
	};
}

export function toProductPatch(patch: ProductUpdatePatch): Partial<ProductRow> {
	return {
		...(patch.name !== undefined ? { name: patch.name } : {}),
		...(patch.categoryId !== undefined ? { category_id: patch.categoryId } : {}),
		...(patch.order !== undefined ? { sort_order: patch.order } : {}),
		...(patch.price !== undefined ? { price: patch.price } : {}),
		...(patch.shortDescription !== undefined
			? { short_description: patch.shortDescription }
			: {}),
		...(patch.visible !== undefined ? { visible: patch.visible } : {}),
		...(patch.imageId !== undefined ? { image_id: patch.imageId } : {}),
		...(patch.updatedAt !== undefined ? { updated_at: patch.updatedAt } : {}),
	};
}

export function toCategoryPatch(
	patch: CategoryUpdatePatch,
): Partial<CategoryRow> {
	return {
		...(patch.name !== undefined ? { name: patch.name } : {}),
		...(patch.order !== undefined ? { sort_order: patch.order } : {}),
		...(patch.visible !== undefined ? { visible: patch.visible } : {}),
	};
}

export function toBusinessSettingsPatch(
	patch: BusinessSettingsUpdatePatch,
): Partial<BusinessRow> {
	return {
		...(patch.name !== undefined ? { name: patch.name } : {}),
		...(patch.logoImageId !== undefined
			? { logo_image_id: patch.logoImageId }
			: {}),
		...(patch.phone !== undefined ? { phone: patch.phone } : {}),
		...(patch.address !== undefined ? { address: patch.address } : {}),
		...(patch.hours !== undefined ? { hours: patch.hours } : {}),
		...(patch.socialInstagram !== undefined
			? { social_instagram: patch.socialInstagram }
			: {}),
		...(patch.socialFacebook !== undefined
			? { social_facebook: patch.socialFacebook }
			: {}),
		...(patch.socialTwitter !== undefined
			? { social_twitter: patch.socialTwitter }
			: {}),
		...(patch.lastModified !== undefined
			? { last_modified: patch.lastModified }
			: {}),
	};
}
