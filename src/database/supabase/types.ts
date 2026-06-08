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

export type MenuImageRow = {
	id: string;
	business_id: string;
	name: string;
	url: string | null;
	thumbnail_url: string | null;
	created_at: string;
};

/** Fila de la vista business_menu (app cliente, filtrar por business_id) */
export type BusinessMenuRow = {
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

export const SUPABASE_VIEWS = {
	/** Solo app cliente (anon). Backoffice usa tablas. */
	businessMenu: 'business_menu',
} as const;

export const SUPABASE_TABLES = {
	businesses: 'businesses',
	categories: 'categories',
	products: 'products',
	images: 'menu_images',
} as const;

export type SupabaseDatabase = {
	public: {
		Functions: {
			ensure_business: {
				Args: Record<string, never>;
				Returns: string;
			};
			reorder_products: {
				Args: { p_category_id: string; p_ordered_ids: string[] };
				Returns: undefined;
			};
			reorder_categories: {
				Args: { p_ordered_ids: string[] };
				Returns: undefined;
			};
			delete_products: {
				Args: { p_ids: string[] };
				Returns: undefined;
			};
			delete_category: {
				Args: { p_id: string };
				Returns: undefined;
			};
			delete_menu_image: {
				Args: { p_id: string };
				Returns: undefined;
			};
			import_products: {
				Args: { p_rows: ProductRow[] };
				Returns: string;
			};
			reset_menu: {
				Args: Record<string, never>;
				Returns: undefined;
			};
		};
		Views: {
			business_menu: {
				Row: BusinessMenuRow;
			};
		};
		Tables: {
			businesses: {
				Row: BusinessRow;
				Insert: Partial<BusinessRow> &
					Pick<BusinessRow, 'owner_user_id'>;
				Update: Partial<BusinessRow>;
			};
			categories: {
				Row: CategoryRow;
				Insert: Partial<CategoryRow> &
					Pick<CategoryRow, 'id' | 'business_id'>;
				Update: Partial<CategoryRow>;
			};
			products: {
				Row: ProductRow;
				Insert: Partial<ProductRow> &
					Pick<ProductRow, 'id' | 'category_id'>;
				Update: Partial<ProductRow>;
			};
			menu_images: {
				Row: MenuImageRow;
				Insert: Partial<MenuImageRow> &
					Pick<MenuImageRow, 'id' | 'business_id' | 'name'>;
				Update: Partial<MenuImageRow>;
			};
		};
	};
};
