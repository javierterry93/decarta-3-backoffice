import type { SupabaseClient } from '@supabase/supabase-js';
import type {
	BusinessSettingsUpdateInput,
	CategoryCreateInput,
	CategoryReorderInput,
	CategoryResolveInput,
	CategoryUpdateInput,
	ImageCreateInput,
	ProductCreateInput,
	ProductImportItem,
	ProductReorderInput,
	ProductUpdateInput,
} from '../../api/types.ts';
import type {
	BusinessSettings,
	Category,
	MenuImage,
	Product,
} from '../../types/index.ts';
import {
	findCategoryByName,
	formatCategoryName,
} from '../../utils/categoryImport.ts';
import { generateId } from '../../utils/format.ts';
import { wrapDatabaseError } from '../DatabaseError.ts';
import type { MenuRepository } from '../MenuRepository.ts';
import {
	mapBusinessSettingsRow,
	mapCategoryRow,
	mapMenuImageRow,
	mapProductRow,
	toBusinessSettingsUpdate,
	toCategoryInsert,
	toMenuImageInsert,
	toProductInsert,
} from './mappers.ts';
import type { BusinessSettingsRow, SupabaseDatabase } from './types.ts';
import { SUPABASE_TABLES } from './types.ts';

const SETTINGS_ROW_ID = 1;

const defaultSettings: BusinessSettings = {
	name: 'Mi Restaurante',
	logoImageId: null,
	phone: '',
	address: '',
	hours: 'Lun–Dom: 12:00–23:00',
	socialInstagram: '',
	socialFacebook: '',
	socialTwitter: '',
};

function now(): string {
	return new Date().toISOString();
}

function nextOrderInCategory(products: Product[], categoryId: string): number {
	return (
		Math.max(
			0,
			...products.filter((p) => p.categoryId === categoryId).map((p) => p.order),
		) + 1
	);
}

export class SupabaseMenuRepository implements MenuRepository {
	constructor(
		private readonly client: SupabaseClient<SupabaseDatabase>,
		private readonly storageBucket: string,
	) {}

	getClient(): SupabaseClient<SupabaseDatabase> {
		return this.client;
	}

	private async touchLastModified(): Promise<string> {
		const timestamp = now();
		const { error } = await this.client
			.from(SUPABASE_TABLES.settings)
			.update({ last_modified: timestamp })
			.eq('id', SETTINGS_ROW_ID);

		if (error) {
			throw wrapDatabaseError('No se pudo actualizar lastModified', error);
		}

		return timestamp;
	}

	private async fetchLastModified(): Promise<string> {
		const { data, error } = await this.client
			.from(SUPABASE_TABLES.settings)
			.select('last_modified')
			.eq('id', SETTINGS_ROW_ID)
			.maybeSingle();

		if (error) {
			throw wrapDatabaseError('No se pudo leer lastModified', error);
		}

		return data?.last_modified ?? now();
	}

	async getMenu() {
		const [products, categories, images, settings, lastModified] =
			await Promise.all([
				this.listProducts(),
				this.listCategories(),
				this.listImages(),
				this.getSettings(),
				this.fetchLastModified(),
			]);

		return { products, categories, images, settings, lastModified };
	}

	async listProducts(): Promise<Product[]> {
		const { data, error } = await this.client
			.from(SUPABASE_TABLES.products)
			.select('*')
			.order('sort_order', { ascending: true });

		if (error) {
			throw wrapDatabaseError('No se pudieron listar productos', error);
		}

		return (data ?? []).map(mapProductRow);
	}

	async getProduct(id: string): Promise<Product> {
		const { data, error } = await this.client
			.from(SUPABASE_TABLES.products)
			.select('*')
			.eq('id', id)
			.single();

		if (error) {
			throw wrapDatabaseError(`Producto no encontrado: ${id}`, error);
		}

		return mapProductRow(data);
	}

	async createProduct(input: ProductCreateInput) {
		const categories = await this.listCategories();
		const products = await this.listProducts();
		const id = generateId();
		const timestamp = now();
		const categoryId = input.categoryId ?? categories[0]?.id ?? '';

		const product: Product = {
			id,
			name: input.name ?? '',
			categoryId,
			order: nextOrderInCategory(products, categoryId),
			price: input.price ?? 0,
			shortDescription: input.shortDescription ?? '',
			visible: input.visible ?? true,
			imageId: input.imageId ?? null,
			createdAt: timestamp,
			updatedAt: timestamp,
		};

		const { error } = await this.client
			.from(SUPABASE_TABLES.products)
			.insert(toProductInsert(product));

		if (error) {
			throw wrapDatabaseError('No se pudo crear el producto', error);
		}

		await this.touchLastModified();
		return { id };
	}

	async updateProduct(id: string, input: ProductUpdateInput): Promise<Product> {
		const current = await this.getProduct(id);
		const timestamp = now();
		let nextOrder = input.order ?? current.order;

		if (input.categoryId && input.categoryId !== current.categoryId) {
			const products = (await this.listProducts()).filter((p) => p.id !== id);
			nextOrder = nextOrderInCategory(products, input.categoryId);
		}

		const patch = {
			...(input.name !== undefined ? { name: input.name } : {}),
			...(input.categoryId !== undefined ? { category_id: input.categoryId } : {}),
			...(input.order !== undefined || input.categoryId !== undefined
				? { sort_order: nextOrder }
				: {}),
			...(input.price !== undefined ? { price: input.price } : {}),
			...(input.shortDescription !== undefined
				? { short_description: input.shortDescription }
				: {}),
			...(input.visible !== undefined ? { visible: input.visible } : {}),
			...(input.imageId !== undefined ? { image_id: input.imageId } : {}),
			updated_at: timestamp,
		};

		const { data, error } = await this.client
			.from(SUPABASE_TABLES.products)
			.update(patch)
			.eq('id', id)
			.select('*')
			.single();

		if (error) {
			throw wrapDatabaseError('No se pudo actualizar el producto', error);
		}

		await this.touchLastModified();
		return mapProductRow(data);
	}

	async deleteProduct(id: string): Promise<void> {
		const { error } = await this.client
			.from(SUPABASE_TABLES.products)
			.delete()
			.eq('id', id);

		if (error) {
			throw wrapDatabaseError('No se pudo eliminar el producto', error);
		}

		await this.touchLastModified();
	}

	async duplicateProduct(id: string) {
		const source = await this.getProduct(id);
		const products = await this.listProducts();
		const newId = generateId();
		const timestamp = now();

		const copy: Product = {
			...source,
			id: newId,
			name: `${source.name} (copia)`,
			order: nextOrderInCategory(products, source.categoryId),
			createdAt: timestamp,
			updatedAt: timestamp,
		};

		const { error } = await this.client
			.from(SUPABASE_TABLES.products)
			.insert(toProductInsert(copy));

		if (error) {
			throw wrapDatabaseError('No se pudo duplicar el producto', error);
		}

		await this.touchLastModified();
		return { id: newId };
	}

	async reorderProducts({
		categoryId,
		orderedIds,
	}: ProductReorderInput): Promise<void> {
		const timestamp = now();

		await Promise.all(
			orderedIds.map((productId, index) =>
				this.client
					.from(SUPABASE_TABLES.products)
					.update({ sort_order: index + 1, updated_at: timestamp })
					.eq('id', productId)
					.eq('category_id', categoryId),
			),
		);

		await this.touchLastModified();
	}

	async importProducts(items: ProductImportItem[]) {
		const timestamp = now();
		const runningProducts = await this.listProducts();
		const rows = items.map((item) => {
			const order = nextOrderInCategory(runningProducts, item.categoryId);
			const product: Product = {
				...item,
				id: generateId(),
				order,
				createdAt: timestamp,
				updatedAt: timestamp,
			};
			runningProducts.push(product);
			return toProductInsert(product);
		});

		if (rows.length > 0) {
			const { error } = await this.client
				.from(SUPABASE_TABLES.products)
				.insert(rows);
			if (error) {
				throw wrapDatabaseError('No se pudieron importar productos', error);
			}
		}

		const lastModified = await this.touchLastModified();
		return { importedCount: items.length, lastModified };
	}

	async listCategories(): Promise<Category[]> {
		const { data, error } = await this.client
			.from(SUPABASE_TABLES.categories)
			.select('*')
			.order('sort_order', { ascending: true });

		if (error) {
			throw wrapDatabaseError('No se pudieron listar categorías', error);
		}

		return (data ?? []).map(mapCategoryRow);
	}

	async getCategory(id: string): Promise<Category> {
		const { data, error } = await this.client
			.from(SUPABASE_TABLES.categories)
			.select('*')
			.eq('id', id)
			.single();

		if (error) {
			throw wrapDatabaseError(`Categoría no encontrada: ${id}`, error);
		}

		return mapCategoryRow(data);
	}

	async createCategory(input: CategoryCreateInput) {
		const categories = await this.listCategories();
		const id = generateId();
		const category: Category = {
			id,
			name: input.name ?? '',
			order: Math.max(0, ...categories.map((c) => c.order)) + 1,
			visible: true,
		};

		const { error } = await this.client
			.from(SUPABASE_TABLES.categories)
			.insert(toCategoryInsert(category));

		if (error) {
			throw wrapDatabaseError('No se pudo crear la categoría', error);
		}

		await this.touchLastModified();
		return { id };
	}

	async updateCategory(
		id: string,
		input: CategoryUpdateInput,
	): Promise<Category> {
		const patch = {
			...(input.name !== undefined ? { name: input.name } : {}),
			...(input.order !== undefined ? { sort_order: input.order } : {}),
			...(input.visible !== undefined ? { visible: input.visible } : {}),
		};

		const { data, error } = await this.client
			.from(SUPABASE_TABLES.categories)
			.update(patch)
			.eq('id', id)
			.select('*')
			.single();

		if (error) {
			throw wrapDatabaseError('No se pudo actualizar la categoría', error);
		}

		await this.touchLastModified();
		return mapCategoryRow(data);
	}

	async deleteCategory(id: string): Promise<void> {
		const categories = await this.listCategories();
		const fallbackCategoryId = categories.find((c) => c.id !== id)?.id ?? '';

		if (fallbackCategoryId) {
			const { error: reassignError } = await this.client
				.from(SUPABASE_TABLES.products)
				.update({ category_id: fallbackCategoryId, updated_at: now() })
				.eq('category_id', id);

			if (reassignError) {
				throw wrapDatabaseError(
					'No se pudieron reasignar productos',
					reassignError,
				);
			}
		}

		const { error } = await this.client
			.from(SUPABASE_TABLES.categories)
			.delete()
			.eq('id', id);

		if (error) {
			throw wrapDatabaseError('No se pudo eliminar la categoría', error);
		}

		await this.touchLastModified();
	}

	async reorderCategories({ orderedIds }: CategoryReorderInput): Promise<void> {
		await Promise.all(
			orderedIds.map((categoryId, index) =>
				this.client
					.from(SUPABASE_TABLES.categories)
					.update({ sort_order: index + 1 })
					.eq('id', categoryId),
			),
		);

		await this.touchLastModified();
	}

	async resolveCategoryId({ name = '' }: CategoryResolveInput) {
		const categories = await this.listCategories();
		const formatted = formatCategoryName(name);
		if (!formatted) return { id: categories[0]?.id ?? '' };

		const existing = findCategoryByName(categories, formatted);
		if (existing) return { id: existing.id };

		return this.createCategory({ name: formatted });
	}

	async listImages(): Promise<MenuImage[]> {
		const { data, error } = await this.client
			.from(SUPABASE_TABLES.images)
			.select('*')
			.order('created_at', { ascending: false });

		if (error) {
			throw wrapDatabaseError('No se pudieron listar imágenes', error);
		}

		return (data ?? []).map(mapMenuImageRow);
	}

	async getImage(id: string): Promise<MenuImage> {
		const { data, error } = await this.client
			.from(SUPABASE_TABLES.images)
			.select('*')
			.eq('id', id)
			.single();

		if (error) {
			throw wrapDatabaseError(`Imagen no encontrada: ${id}`, error);
		}

		return mapMenuImageRow(data);
	}

	async createImage(input: ImageCreateInput): Promise<MenuImage> {
		const id = generateId();
		const timestamp = now();
		let url = input.url;
		let thumbnailUrl = input.thumbnailUrl;

		if (input.fullBlob && input.thumbBlob) {
			const fullPath = `${id}/full`;
			const thumbPath = `${id}/thumb`;

			const [fullUpload, thumbUpload] = await Promise.all([
				this.client.storage
					.from(this.storageBucket)
					.upload(fullPath, input.fullBlob, { upsert: true }),
				this.client.storage
					.from(this.storageBucket)
					.upload(thumbPath, input.thumbBlob, { upsert: true }),
			]);

			if (fullUpload.error) {
				throw wrapDatabaseError('No se pudo subir la imagen', fullUpload.error);
			}
			if (thumbUpload.error) {
				throw wrapDatabaseError('No se pudo subir la miniatura', thumbUpload.error);
			}

			url = this.client.storage.from(this.storageBucket).getPublicUrl(fullPath)
				.data.publicUrl;
			thumbnailUrl = this.client.storage
				.from(this.storageBucket)
				.getPublicUrl(thumbPath).data.publicUrl;
		}

		const row = toMenuImageInsert({
			id,
			name: input.name,
			createdAt: timestamp,
			url,
			thumbnailUrl,
		});

		const { data, error } = await this.client
			.from(SUPABASE_TABLES.images)
			.insert(row)
			.select('*')
			.single();

		if (error) {
			throw wrapDatabaseError('No se pudo crear la imagen', error);
		}

		await this.touchLastModified();
		return mapMenuImageRow(data);
	}

	async deleteImage(id: string): Promise<void> {
		await this.client.storage
			.from(this.storageBucket)
			.remove([`${id}/full`, `${id}/thumb`]);

		const { error: clearProductsError } = await this.client
			.from(SUPABASE_TABLES.products)
			.update({ image_id: null, updated_at: now() })
			.eq('image_id', id);

		if (clearProductsError) {
			throw wrapDatabaseError(
				'No se pudo desvincular la imagen de productos',
				clearProductsError,
			);
		}

		const { error } = await this.client
			.from(SUPABASE_TABLES.images)
			.delete()
			.eq('id', id);

		if (error) {
			throw wrapDatabaseError('No se pudo eliminar la imagen', error);
		}

		await this.touchLastModified();
	}

	async getSettings(): Promise<BusinessSettings> {
		const { data, error } = await this.client
			.from(SUPABASE_TABLES.settings)
			.select('*')
			.eq('id', SETTINGS_ROW_ID)
			.maybeSingle();

		if (error) {
			throw wrapDatabaseError('No se pudieron leer los ajustes', error);
		}

		if (!data) return { ...defaultSettings };
		return mapBusinessSettingsRow(data as BusinessSettingsRow);
	}

	async updateSettings(
		input: BusinessSettingsUpdateInput,
	): Promise<BusinessSettings> {
		const timestamp = now();
		const patch = {
			...toBusinessSettingsUpdate(input),
			last_modified: timestamp,
		};

		const { data, error } = await this.client
			.from(SUPABASE_TABLES.settings)
			.update(patch)
			.eq('id', SETTINGS_ROW_ID)
			.select('*')
			.single();

		if (error) {
			throw wrapDatabaseError('No se pudieron actualizar los ajustes', error);
		}

		return mapBusinessSettingsRow(data);
	}

	async resetMenu(): Promise<void> {
		const [products, images, categories] = await Promise.all([
			this.listProducts(),
			this.listImages(),
			this.listCategories(),
		]);

		if (products.length > 0) {
			const { error } = await this.client
				.from(SUPABASE_TABLES.products)
				.delete()
				.in(
					'id',
					products.map((product) => product.id),
				);
			if (error) {
				throw wrapDatabaseError('No se pudieron eliminar productos', error);
			}
		}

		if (images.length > 0) {
			await Promise.all(
				images.map((image) =>
					this.client.storage
						.from(this.storageBucket)
						.remove([`${image.id}/full`, `${image.id}/thumb`]),
				),
			);

			const { error } = await this.client
				.from(SUPABASE_TABLES.images)
				.delete()
				.in(
					'id',
					images.map((image) => image.id),
				);
			if (error) {
				throw wrapDatabaseError('No se pudieron eliminar imágenes', error);
			}
		}

		if (categories.length > 0) {
			const { error } = await this.client
				.from(SUPABASE_TABLES.categories)
				.delete()
				.in(
					'id',
					categories.map((category) => category.id),
				);
			if (error) {
				throw wrapDatabaseError('No se pudieron eliminar categorías', error);
			}
		}

		const { error } = await this.client
			.from(SUPABASE_TABLES.settings)
			.update({
				...toBusinessSettingsUpdate(defaultSettings),
				logo_image_id: null,
				last_modified: now(),
			})
			.eq('id', SETTINGS_ROW_ID);

		if (error) {
			throw wrapDatabaseError('No se pudo restablecer la carta', error);
		}
	}
}
