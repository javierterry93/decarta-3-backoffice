export const API_BASE = '/api';

export const apiRoutes = {
	menu: `${API_BASE}/menu`,
	products: `${API_BASE}/products`,
	product: (id: string) => `${API_BASE}/products/${id}`,
	productDuplicate: (id: string) => `${API_BASE}/products/${id}/duplicate`,
	productsReorder: `${API_BASE}/products/reorder`,
	productsImport: `${API_BASE}/products/import`,
	categories: `${API_BASE}/categories`,
	category: (id: string) => `${API_BASE}/categories/${id}`,
	categoriesReorder: `${API_BASE}/categories/reorder`,
	categoriesResolve: `${API_BASE}/categories/resolve`,
	images: `${API_BASE}/images`,
	image: (id: string) => `${API_BASE}/images/${id}`,
	settings: `${API_BASE}/settings`,
} as const;
