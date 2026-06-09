import type { SupabaseClient } from '@supabase/supabase-js';
import type { BusinessSettingsUpdatePatch } from '../../BusinessRepository.ts';
import type { CategoryUpdatePatch } from '../../CategoryRepository.ts';
import type { ProductUpdatePatch } from '../../ProductRepository.ts';
import type { Repository } from '../../Repository.ts';
import type { Snapshot } from '../../SnapshotRepository.ts';
import { wrapDatabaseError } from '../../DatabaseError.ts';
import type { SupabaseDatabase } from './types.ts';
import { SUPABASE_TABLES } from './types.ts';
import type {
	BusinessSettings,
	Category,
	Image,
	Product,
} from '../../../types/index.ts';
import { requireBusinessId } from './businessScope.ts';
import {
	mapBusinessRow,
	mapCategoryRow,
	mapImageRow,
	mapProductRow,
	toBusinessSettingsPatch,
	toCategoryInsert,
	toCategoryPatch,
	toImageInsert,
	toProductInsert,
	toProductPatch,
} from './mappers.ts';
import type { BusinessRow } from './types.ts';

export class SupabaseRepository implements Repository {
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

	async fetchSnapshot(): Promise<Snapshot> {
		const businessId = await requireBusinessId(this.client);
		const { data, error } = await this.client
			.from(SUPABASE_TABLES.businesses)
			// images! desambigua frente a la relación del logo (logo_image_id).
			.select('*, categories(*, products(*)), images!images_business_id_fkey(*)')
			.eq('id', businessId)
			.single();

		if (error) {
			throw wrapDatabaseError('No se pudo cargar la carta', error);
		}

		const categoryRows = [...data.categories].sort(
			(a, b) => a.sort_order - b.sort_order,
		);
		const productRows = data.categories
			.flatMap((category) => category.products)
			.sort((a, b) => a.sort_order - b.sort_order);
		const imageRows = [...data.images].sort((a, b) =>
			b.created_at.localeCompare(a.created_at),
		);

		return {
			products: productRows.map((row) => mapProductRow(row)),
			categories: categoryRows.map(mapCategoryRow),
			images: imageRows.map(mapImageRow),
			settings: mapBusinessRow(data),
			lastModified: data.last_modified,
		};
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

		const { error } = await this.client
			.from(SUPABASE_TABLES.products)
			.delete()
			.in('id', ids);

		if (error) {
			throw wrapDatabaseError('No se pudieron eliminar productos', error);
		}
	}

	async reorderProducts(
		categoryId: string,
		orderedIds: string[],
	): Promise<void> {
		if (orderedIds.length === 0) return;

		const results = await Promise.all(
			orderedIds.map((id, index) =>
				this.client
					.from(SUPABASE_TABLES.products)
					.update({ sort_order: index })
					.eq('category_id', categoryId)
					.eq('id', id),
			),
		);

		const failed = results.find((result) => result.error);
		if (failed?.error) {
			throw wrapDatabaseError('No se pudo reordenar productos', failed.error);
		}
	}

	async importProducts(
		products: Omit<Product, 'createdAt' | 'updatedAt'>[],
	): Promise<void> {
		if (products.length === 0) return;

		const { error } = await this.client
			.from(SUPABASE_TABLES.products)
			.insert(products.map(toProductInsert));

		if (error) {
			throw wrapDatabaseError('No se pudieron importar productos', error);
		}
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
		// Los productos de la categoría caen por on delete cascade (schema.sql).
		const { error } = await this.client
			.from(SUPABASE_TABLES.categories)
			.delete()
			.eq('id', id);

		if (error) {
			throw wrapDatabaseError('No se pudo eliminar la categoría', error);
		}
	}

	async reorderCategories(orderedIds: string[]): Promise<void> {
		if (orderedIds.length === 0) return;

		const results = await Promise.all(
			orderedIds.map((id, index) =>
				this.client
					.from(SUPABASE_TABLES.categories)
					.update({ sort_order: index })
					.eq('id', id),
			),
		);

		const failed = results.find((result) => result.error);
		if (failed?.error) {
			throw wrapDatabaseError('No se pudo reordenar categorías', failed.error);
		}
	}

	async listImages(): Promise<Image[]> {
		const businessId = await requireBusinessId(this.client);
		const { data, error } = await this.client
			.from(SUPABASE_TABLES.images)
			.select('*')
			.eq('business_id', businessId)
			.order('created_at', { ascending: false });

		if (error) {
			throw wrapDatabaseError('No se pudieron listar imágenes', error);
		}

		return (data ?? []).map(mapImageRow);
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

	async insertImage(image: Omit<Image, 'createdAt'>): Promise<Image> {
		const businessId = await requireBusinessId(this.client);
		const { data, error } = await this.client
			.from(SUPABASE_TABLES.images)
			.insert(
				toImageInsert(
					{
						id: image.id,
						name: image.name,
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

		return mapImageRow(data);
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

		// products.image_id y businesses.logo_image_id caen a null por FK (schema.sql).
		const { error } = await this.client
			.from(SUPABASE_TABLES.images)
			.delete()
			.eq('id', id);

		if (error) {
			throw wrapDatabaseError('No se pudo eliminar la imagen', error);
		}
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
		const { data: current, error: readError } = await this.client
			.from(SUPABASE_TABLES.businesses)
			.select('last_modified')
			.eq('id', businessId)
			.single();

		if (readError) {
			throw wrapDatabaseError('No se pudo leer lastModified', readError);
		}

		const { data, error } = await this.client
			.from(SUPABASE_TABLES.businesses)
			.update({ last_modified: current.last_modified })
			.eq('id', businessId)
			.select('last_modified')
			.single();

		if (error) {
			throw wrapDatabaseError('No se pudo actualizar lastModified', error);
		}

		return data.last_modified;
	}

	async resetSnapshot(): Promise<void> {
		const businessId = await requireBusinessId(this.client);
		const images = await this.listImages();
		await this.removeImageFiles(images.map((image) => image.id));

		const categoriesDelete = await this.client
			.from(SUPABASE_TABLES.categories)
			.delete()
			.eq('business_id', businessId);

		if (categoriesDelete.error) {
			throw wrapDatabaseError(
				'No se pudo restablecer la carta',
				categoriesDelete.error,
			);
		}

		const imagesDelete = await this.client
			.from(SUPABASE_TABLES.images)
			.delete()
			.eq('business_id', businessId);

		if (imagesDelete.error) {
			throw wrapDatabaseError(
				'No se pudo restablecer la carta',
				imagesDelete.error,
			);
		}

		await this.touchLastModified(businessId);
	}
}
