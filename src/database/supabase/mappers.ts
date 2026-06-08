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
} from './types.ts';

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

export function toBusinessUpdate(
	settings: Partial<BusinessSettings>,
): Partial<BusinessRow> {
	return {
		...(settings.name !== undefined ? { name: settings.name } : {}),
		...(settings.logoImageId !== undefined
			? { logo_image_id: settings.logoImageId }
			: {}),
		...(settings.phone !== undefined ? { phone: settings.phone } : {}),
		...(settings.address !== undefined ? { address: settings.address } : {}),
		...(settings.hours !== undefined ? { hours: settings.hours } : {}),
		...(settings.socialInstagram !== undefined
			? { social_instagram: settings.socialInstagram }
			: {}),
		...(settings.socialFacebook !== undefined
			? { social_facebook: settings.socialFacebook }
			: {}),
		...(settings.socialTwitter !== undefined
			? { social_twitter: settings.socialTwitter }
			: {}),
	};
}
