export type CategoryRow = {
	id: string;
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

export type MenuImageRow = {
	id: string;
	name: string;
	url: string | null;
	thumbnail_url: string | null;
	created_at: string;
};

export type BusinessSettingsRow = {
	id: number;
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

export const SUPABASE_TABLES = {
	categories: 'categories',
	products: 'products',
	images: 'menu_images',
	settings: 'business_settings',
} as const;

export type SupabaseDatabase = {
	public: {
		Tables: {
			categories: {
				Row: CategoryRow;
				Insert: Partial<CategoryRow> & Pick<CategoryRow, 'id'>;
				Update: Partial<CategoryRow>;
			};
			products: {
				Row: ProductRow;
				Insert: Partial<ProductRow> & Pick<ProductRow, 'id' | 'category_id'>;
				Update: Partial<ProductRow>;
			};
			menu_images: {
				Row: MenuImageRow;
				Insert: Partial<MenuImageRow> & Pick<MenuImageRow, 'id' | 'name'>;
				Update: Partial<MenuImageRow>;
			};
			business_settings: {
				Row: BusinessSettingsRow;
				Insert: Partial<BusinessSettingsRow>;
				Update: Partial<BusinessSettingsRow>;
			};
		};
	};
};
