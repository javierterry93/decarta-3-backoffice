export type BusinessRow = {
	id: string;
	owner_user_id: string;
	name: string;
	logo_image_id: string | null;
	phone: string;
	address: string;
	hours: string;
	social_instagram: string;
	social_facebook: string;
	social_twitter: string;
	last_modified: string;
};

export type CategoryRow = {
	id: string;
	business_id: string;
	name: string;
	sort_order: number;
	visible: boolean;
};

export type ProductRow = {
	id: string;
	name: string;
	category_id: string;
	sort_order: number;
	price: number;
	short_description: string;
	visible: boolean;
	image_id: string | null;
	created_at: string;
	updated_at: string;
};

export type ImageRow = {
	id: string;
	business_id: string;
	name: string;
	url: string | null;
	thumbnail_url: string | null;
	created_at: string;
};

/** Fila de la vista pública snapshot_data (schema.sql). */
export type SnapshotDataRow = {
	business_id: string;
	product_id: string;
	product_name: string;
	product_order: number;
	price: number;
	short_description: string;
	image_id: string | null;
	category_id: string;
	category_name: string;
	category_order: number;
};

export const SUPABASE_TABLES = {
	businesses: 'businesses',
	categories: 'categories',
	products: 'products',
	images: 'images',
} as const;

export const SUPABASE_VIEWS = {
	snapshotData: 'snapshot_data',
} as const;

export type SupabaseDatabase = {
	public: {
		Enums: Record<string, never>;
		CompositeTypes: Record<string, never>;
		Views: {
			snapshot_data: {
				Row: SnapshotDataRow;
				Relationships: [];
			};
		};
		Functions: Record<string, never>;
		Tables: {
			businesses: {
				Row: BusinessRow;
				Insert: Partial<BusinessRow> & Pick<BusinessRow, 'owner_user_id'>;
				Update: Partial<BusinessRow>;
				Relationships: [
					{
						foreignKeyName: 'businesses_logo_image_id_fkey';
						columns: ['logo_image_id'];
						isOneToOne: false;
						referencedRelation: 'images';
						referencedColumns: ['id'];
					},
				];
			};
			categories: {
				Row: CategoryRow;
				Insert: Partial<CategoryRow> & Pick<CategoryRow, 'id' | 'business_id'>;
				Update: Partial<CategoryRow>;
				Relationships: [
					{
						foreignKeyName: 'categories_business_id_fkey';
						columns: ['business_id'];
						isOneToOne: false;
						referencedRelation: 'businesses';
						referencedColumns: ['id'];
					},
				];
			};
			products: {
				Row: ProductRow;
				Insert: Partial<ProductRow> & Pick<ProductRow, 'id' | 'category_id'>;
				Update: Partial<ProductRow>;
				Relationships: [
					{
						foreignKeyName: 'products_category_id_fkey';
						columns: ['category_id'];
						isOneToOne: false;
						referencedRelation: 'categories';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'products_image_id_fkey';
						columns: ['image_id'];
						isOneToOne: false;
						referencedRelation: 'images';
						referencedColumns: ['id'];
					},
				];
			};
			images: {
				Row: ImageRow;
				Insert: Partial<ImageRow> & Pick<ImageRow, 'id' | 'business_id' | 'name'>;
				Update: Partial<ImageRow>;
				Relationships: [
					{
						foreignKeyName: 'images_business_id_fkey';
						columns: ['business_id'];
						isOneToOne: false;
						referencedRelation: 'businesses';
						referencedColumns: ['id'];
					},
				];
			};
		};
	};
};
