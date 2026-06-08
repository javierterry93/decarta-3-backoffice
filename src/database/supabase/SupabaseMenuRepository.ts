import type { SupabaseClient } from '@supabase/supabase-js';
import type {
	BusinessSettingsUpdateInput,
	CategoryCreateInput,
	CategoryReorderInput,
	CategoryResolveInput,
	CategoryUpdateInput,
	ImageCreateInput,
	ProductBulkDeleteInput,
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
import { requireBusinessId } from './businessScope.ts';
import {
	mapBusinessRow,
	mapCategoryRow,
	mapMenuImageRow,
	mapProductRow,
	toBusinessUpdate,
	toCategoryInsert,
	toMenuImageInsert,
	toProductInsert,
} from './mappers.ts';
import { callSupabaseRpc } from './rpc.ts';
import type { BusinessRow, SupabaseDatabase } from './types.ts';
import { SUPABASE_TABLES } from './types.ts';

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

	private async touchLastModified(businessId: string): Promise<string> {
		const timestamp = now();
		const { error } = await this.client
			.from(SUPABASE_TABLES.businesses)
			.update({ last_modified: timestamp })
			.eq('id', businessId);

		if (error) {
			throw wrapDatabaseError('No se pudo actualizar lastModified', error);
		}

		return timestamp;
	}

	private async fetchLastModified(businessId: string): Promise<string> {
		const { data, error } = await this.client
			.from(SUPABASE_TABLES.businesses)
			.select('last_modified')
			.eq('id', businessId)
			.maybeSingle();

		if (error) {
			throw wrapDatabaseError('No se pudo leer lastModified', error);
		}

		return data?.last_modified ?? now();
	}

	async getMenu() {
		const businessId = await requireBusinessId(this.client);
		const [products, categories, images, settings, lastModified] =
			await Promise.all([
				this.listProducts(),
				this.listCategories(),
				this.listImages(),
				this.getSettings(),
				this.fetchLastModified(businessId),
			]);

		return { products, categories, images, settings, lastModified };
	}

	async listProducts(): Promise<Product[]> {
		const businessId = await requireBusinessId(this.client);
		const { data, error } = await this.client
			.from(SUPABASE_TABLES.products)
			.select('*, categories!inner(business_id)')
			.eq('categories.business_id', businessId)
			.order('sort_order', { ascending: true });

		if (error) {
			throw wrapDatabaseError('No se pudieron listar productos', error);
		}

		return (data ?? []).map((row) => mapProductRow(row));
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
		const businessId = await requireBusinessId(this.client);
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

		await this.touchLastModified(businessId);
		return { id };
	}

	async updateProduct(id: string, input: ProductUpdateInput): Promise<Product> {
		const businessId = await requireBusinessId(this.client);
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

		await this.touchLastModified(businessId);
		return mapProductRow(data);
	}

	async deleteProduct(id: string): Promise<void> {
		await this.deleteProducts({ ids: [id] });
	}

	async deleteProducts({ ids }: ProductBulkDeleteInput): Promise<void> {
		if (ids.length === 0) return;

		await callSupabaseRpc(
			this.client,
			'delete_products',
			{ p_ids: ids },
			'No se pudieron eliminar productos',
		);
	}

	async duplicateProduct(id: string) {
		const businessId = await requireBusinessId(this.client);
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

		await this.touchLastModified(businessId);
		return { id: newId };
	}

	async reorderProducts({
		categoryId,
		orderedIds,
	}: ProductReorderInput): Promise<void> {
		if (orderedIds.length === 0) return;

		await callSupabaseRpc(
			this.client,
			'reorder_products',
			{ p_category_id: categoryId, p_ordered_ids: orderedIds },
			'No se pudo reordenar productos',
		);
	}

	async importProducts(items: ProductImportItem[]) {
		const businessId = await requireBusinessId(this.client);
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

		if (rows.length === 0) {
			return {
				importedCount: 0,
				lastModified: await this.fetchLastModified(businessId),
			};
		}

		const lastModified = await callSupabaseRpc<string>(
			this.client,
			'import_products',
			{ p_rows: rows },
			'No se pudieron importar productos',
		);

		return { importedCount: items.length, lastModified };
	}

	async listCategories(): Promise<Category[]> {
		const businessId = await requireBusinessId(this.client);
		const { data, error } = await this.client
			.from(SUPABASE_TABLES.categories)
			.select('*')
			.eq('business_id', businessId)
			.order('sort_order', { ascending: true });

		if (error) {
			throw wrapDatabaseError('No se pudieron listar categorías', error);
		}

		return (data ?? []).map(mapCategoryRow);
	}

	async getCategory(id: string): Promise<Category> {
		const businessId = await requireBusinessId(this.client);
		const { data, error } = await this.client
			.from(SUPABASE_TABLES.categories)
			.select('*')
			.eq('business_id', businessId)
			.eq('id', id)
			.single();

		if (error) {
			throw wrapDatabaseError(`Categoría no encontrada: ${id}`, error);
		}

		return mapCategoryRow(data);
	}

	async createCategory(input: CategoryCreateInput) {
		const businessId = await requireBusinessId(this.client);
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
			.insert(toCategoryInsert(category, businessId));

		if (error) {
			throw wrapDatabaseError('No se pudo crear la categoría', error);
		}

		await this.touchLastModified(businessId);
		return { id };
	}

	async updateCategory(
		id: string,
		input: CategoryUpdateInput,
	): Promise<Category> {
		const businessId = await requireBusinessId(this.client);
		const patch = {
			...(input.name !== undefined ? { name: input.name } : {}),
			...(input.order !== undefined ? { sort_order: input.order } : {}),
			...(input.visible !== undefined ? { visible: input.visible } : {}),
		};

		const { data, error } = await this.client
			.from(SUPABASE_TABLES.categories)
			.update(patch)
			.eq('business_id', businessId)
			.eq('id', id)
			.select('*')
			.single();

		if (error) {
			throw wrapDatabaseError('No se pudo actualizar la categoría', error);
		}

		await this.touchLastModified(businessId);
		return mapCategoryRow(data);
	}

	async deleteCategory(id: string): Promise<void> {
		await callSupabaseRpc(
			this.client,
			'delete_category',
			{ p_id: id },
			'No se pudo eliminar la categoría',
		);
	}

	async reorderCategories({ orderedIds }: CategoryReorderInput): Promise<void> {
		if (orderedIds.length === 0) return;

		await callSupabaseRpc(
			this.client,
			'reorder_categories',
			{ p_ordered_ids: orderedIds },
			'No se pudo reordenar categorías',
		);
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
		const businessId = await requireBusinessId(this.client);
		const { data, error } = await this.client
			.from(SUPABASE_TABLES.images)
			.select('*')
			.eq('business_id', businessId)
			.order('created_at', { ascending: false });

		if (error) {
			throw wrapDatabaseError('No se pudieron listar imágenes', error);
		}

		return (data ?? []).map(mapMenuImageRow);
	}

	async getImage(id: string): Promise<MenuImage> {
		const businessId = await requireBusinessId(this.client);
		const { data, error } = await this.client
			.from(SUPABASE_TABLES.images)
			.select('*')
			.eq('business_id', businessId)
			.eq('id', id)
			.single();

		if (error) {
			throw wrapDatabaseError(`Imagen no encontrada: ${id}`, error);
		}

		return mapMenuImageRow(data);
	}

	async createImage(input: ImageCreateInput): Promise<MenuImage> {
		const businessId = await requireBusinessId(this.client);
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

		const { data, error } = await this.client
			.from(SUPABASE_TABLES.images)
			.insert(
				toMenuImageInsert(
					{
						id,
						name: input.name,
						createdAt: timestamp,
						url,
						thumbnailUrl,
					},
					businessId,
				),
			)
			.select('*')
			.single();

		if (error) {
			throw wrapDatabaseError('No se pudo crear la imagen', error);
		}

		await this.touchLastModified(businessId);
		return mapMenuImageRow(data);
	}

	async deleteImage(id: string): Promise<void> {
		const { error: storageError } = await this.client.storage
			.from(this.storageBucket)
			.remove([`${id}/full`, `${id}/thumb`]);

		if (storageError) {
			throw wrapDatabaseError(
				'No se pudieron eliminar los archivos de la imagen',
				storageError,
			);
		}

		await callSupabaseRpc(
			this.client,
			'delete_menu_image',
			{ p_id: id },
			'No se pudo eliminar la imagen',
		);
	}

	async getSettings(): Promise<BusinessSettings> {
		const businessId = await requireBusinessId(this.client);

		const { data, error } = await this.client
			.from(SUPABASE_TABLES.businesses)
			.select('*')
			.eq('id', businessId)
			.single();

		if (error) {
			throw wrapDatabaseError('No se pudieron leer los ajustes', error);
		}

		return mapBusinessRow(data as BusinessRow);
	}

	async updateSettings(
		input: BusinessSettingsUpdateInput,
	): Promise<BusinessSettings> {
		const businessId = await requireBusinessId(this.client);
		const timestamp = now();
		const patch = {
			...toBusinessUpdate(input),
			last_modified: timestamp,
		};

		const { data, error } = await this.client
			.from(SUPABASE_TABLES.businesses)
			.update(patch)
			.eq('id', businessId)
			.select('*')
			.single();

		if (error) {
			throw wrapDatabaseError('No se pudieron actualizar los ajustes', error);
		}

		return mapBusinessRow(data);
	}

	async resetMenu(): Promise<void> {
		const images = await this.listImages();

		if (images.length > 0) {
			const storagePaths = images.flatMap((image) => [
				`${image.id}/full`,
				`${image.id}/thumb`,
			]);
			const { error: storageError } = await this.client.storage
				.from(this.storageBucket)
				.remove(storagePaths);

			if (storageError) {
				throw wrapDatabaseError(
					'No se pudieron eliminar los archivos de imágenes',
					storageError,
				);
			}
		}

		await callSupabaseRpc(
			this.client,
			'reset_menu',
			{},
			'No se pudo restablecer la carta',
		);
	}
}
