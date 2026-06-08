import type { SupabaseClient } from '@supabase/supabase-js';
import type {
	BusinessSettingsUpdatePatch,
	CategoryUpdatePatch,
	MenuRepository,
	ProductUpdatePatch,
} from '../../database/MenuRepository.ts';
import { wrapDatabaseError } from '../../database/DatabaseError.ts';
import type { SupabaseDatabase } from '../../database/supabase/types.ts';
import { SUPABASE_TABLES } from '../../database/supabase/types.ts';
import type {
	BusinessSettings,
	Category,
	MenuImage,
	Product,
} from '../../types/index.ts';
import { requireBusinessId } from './businessScope.ts';
import {
	mapBusinessRow,
	mapCategoryRow,
	mapMenuImageRow,
	mapProductRow,
	toBusinessSettingsPatch,
	toCategoryInsert,
	toCategoryPatch,
	toMenuImageInsert,
	toProductInsert,
	toProductPatch,
} from './mappers.ts';
import { callSupabaseRpc } from './supabaseRpc.ts';
import type { BusinessRow } from '../../database/supabase/types.ts';

function now(): string {
	return new Date().toISOString();
}

export class SupabaseMenuRepository implements MenuRepository {
	private readonly client: SupabaseClient<SupabaseDatabase>;
	private readonly storageBucket: string;

	constructor(client: SupabaseClient<SupabaseDatabase>, storageBucket: string) {
		this.client = client;
		this.storageBucket = storageBucket;
	}

	getClient(): SupabaseClient<SupabaseDatabase> {
		return this.client;
	}

	requireBusinessId(): Promise<string> {
		return requireBusinessId(this.client);
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

	async insertProduct(product: Product): Promise<void> {
		const { error } = await this.client
			.from(SUPABASE_TABLES.products)
			.insert(toProductInsert(product));

		if (error) {
			throw wrapDatabaseError('No se pudo crear el producto', error);
		}
	}

	async updateProduct(id: string, patch: ProductUpdatePatch): Promise<Product> {
		const { data, error } = await this.client
			.from(SUPABASE_TABLES.products)
			.update(toProductPatch(patch))
			.eq('id', id)
			.select('*')
			.single();

		if (error) {
			throw wrapDatabaseError('No se pudo actualizar el producto', error);
		}

		return mapProductRow(data);
	}

	async deleteProducts(ids: string[]): Promise<void> {
		if (ids.length === 0) return;

		await callSupabaseRpc(
			this.client,
			'delete_products',
			{ p_ids: ids },
			'No se pudieron eliminar productos',
		);
	}

	async reorderProducts(
		categoryId: string,
		orderedIds: string[],
	): Promise<void> {
		if (orderedIds.length === 0) return;

		await callSupabaseRpc(
			this.client,
			'reorder_products',
			{ p_category_id: categoryId, p_ordered_ids: orderedIds },
			'No se pudo reordenar productos',
		);
	}

	async importProducts(products: Product[]): Promise<string> {
		const rows = products.map(toProductInsert);
		return callSupabaseRpc<string>(
			this.client,
			'import_products',
			{ p_rows: rows },
			'No se pudieron importar productos',
		);
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

	async insertCategory(category: Category): Promise<void> {
		const businessId = await requireBusinessId(this.client);
		const { error } = await this.client
			.from(SUPABASE_TABLES.categories)
			.insert(toCategoryInsert(category, businessId));

		if (error) {
			throw wrapDatabaseError('No se pudo crear la categoría', error);
		}
	}

	async updateCategory(
		id: string,
		patch: CategoryUpdatePatch,
	): Promise<Category> {
		const businessId = await requireBusinessId(this.client);
		const { data, error } = await this.client
			.from(SUPABASE_TABLES.categories)
			.update(toCategoryPatch(patch))
			.eq('business_id', businessId)
			.eq('id', id)
			.select('*')
			.single();

		if (error) {
			throw wrapDatabaseError('No se pudo actualizar la categoría', error);
		}

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

	async reorderCategories(orderedIds: string[]): Promise<void> {
		if (orderedIds.length === 0) return;

		await callSupabaseRpc(
			this.client,
			'reorder_categories',
			{ p_ordered_ids: orderedIds },
			'No se pudo reordenar categorías',
		);
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

	async uploadImageFiles(
		id: string,
		fullBlob: Blob,
		thumbBlob: Blob,
	): Promise<{ url: string; thumbnailUrl: string }> {
		const fullPath = `${id}/full`;
		const thumbPath = `${id}/thumb`;

		const [fullUpload, thumbUpload] = await Promise.all([
			this.client.storage
				.from(this.storageBucket)
				.upload(fullPath, fullBlob, { upsert: true }),
			this.client.storage
				.from(this.storageBucket)
				.upload(thumbPath, thumbBlob, { upsert: true }),
		]);

		if (fullUpload.error) {
			throw wrapDatabaseError('No se pudo subir la imagen', fullUpload.error);
		}
		if (thumbUpload.error) {
			throw wrapDatabaseError('No se pudo subir la miniatura', thumbUpload.error);
		}

		return {
			url: this.client.storage.from(this.storageBucket).getPublicUrl(fullPath).data
				.publicUrl,
			thumbnailUrl: this.client.storage
				.from(this.storageBucket)
				.getPublicUrl(thumbPath).data.publicUrl,
		};
	}

	async insertImage(image: MenuImage): Promise<MenuImage> {
		const businessId = await requireBusinessId(this.client);
		const { data, error } = await this.client
			.from(SUPABASE_TABLES.images)
			.insert(
				toMenuImageInsert(
					{
						id: image.id,
						name: image.name,
						createdAt: image.createdAt,
						url: image.url,
						thumbnailUrl: image.thumbnailUrl,
					},
					businessId,
				),
			)
			.select('*')
			.single();

		if (error) {
			throw wrapDatabaseError('No se pudo crear la imagen', error);
		}

		return mapMenuImageRow(data);
	}

	async removeImageFiles(ids: string[]): Promise<void> {
		if (ids.length === 0) return;

		const storagePaths = ids.flatMap((id) => [`${id}/full`, `${id}/thumb`]);
		const { error } = await this.client.storage
			.from(this.storageBucket)
			.remove(storagePaths);

		if (error) {
			throw wrapDatabaseError(
				'No se pudieron eliminar los archivos de imágenes',
				error,
			);
		}
	}

	async deleteMenuImage(id: string): Promise<void> {
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

	async fetchLastModified(businessId: string): Promise<string> {
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

	async updateBusinessSettings(
		businessId: string,
		patch: BusinessSettingsUpdatePatch,
	): Promise<BusinessSettings> {
		const { data, error } = await this.client
			.from(SUPABASE_TABLES.businesses)
			.update(toBusinessSettingsPatch(patch))
			.eq('id', businessId)
			.select('*')
			.single();

		if (error) {
			throw wrapDatabaseError('No se pudieron actualizar los ajustes', error);
		}

		return mapBusinessRow(data);
	}

	async touchLastModified(businessId: string): Promise<string> {
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

	async resetMenu(): Promise<void> {
		const images = await this.listImages();
		await this.removeImageFiles(images.map((image) => image.id));

		await callSupabaseRpc(
			this.client,
			'reset_menu',
			{},
			'No se pudo restablecer la carta',
		);
	}
}
