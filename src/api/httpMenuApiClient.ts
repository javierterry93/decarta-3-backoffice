import { apiRoutes } from './routes.ts';
import type { MenuApiClient } from './menuApiClient.ts';

export class MenuApiError extends Error {
	status: number;

	constructor(message: string, status: number) {
		super(message);
		this.name = 'MenuApiError';
		this.status = status;
	}
}

async function request<T>(
	baseUrl: string,
	path: string,
	init?: RequestInit,
): Promise<T> {
	const response = await fetch(`${baseUrl}${path}`, {
		headers: {
			'Content-Type': 'application/json',
			...init?.headers,
		},
		...init,
	});

	if (!response.ok) {
		let message = response.statusText;
		try {
			const body = (await response.json()) as { message?: string };
			if (body.message) message = body.message;
		} catch {
			// ignore parse errors
		}
		throw new MenuApiError(message, response.status);
	}

	if (response.status === 204) {
		return undefined as T;
	}

	return response.json() as Promise<T>;
}

export function createHttpMenuApiClient(baseUrl: string): MenuApiClient {
	return {
		getMenu: () => request(baseUrl, apiRoutes.menu),

		listProducts: () => request(baseUrl, apiRoutes.products),
		getProduct: (id) => request(baseUrl, apiRoutes.product(id)),
		createProduct: (input) =>
			request(baseUrl, apiRoutes.products, {
				method: 'POST',
				body: JSON.stringify(input),
			}),
		updateProduct: (id, input) =>
			request(baseUrl, apiRoutes.product(id), {
				method: 'PATCH',
				body: JSON.stringify(input),
			}),
		deleteProduct: (id) =>
			request(baseUrl, apiRoutes.product(id), { method: 'DELETE' }),
		duplicateProduct: (id) =>
			request(baseUrl, apiRoutes.productDuplicate(id), { method: 'POST' }),
		reorderProducts: (input) =>
			request(baseUrl, apiRoutes.productsReorder, {
				method: 'PUT',
				body: JSON.stringify(input),
			}),
		importProducts: (items) =>
			request(baseUrl, apiRoutes.productsImport, {
				method: 'POST',
				body: JSON.stringify({ items }),
			}),

		listCategories: () => request(baseUrl, apiRoutes.categories),
		getCategory: (id) => request(baseUrl, apiRoutes.category(id)),
		createCategory: (input) =>
			request(baseUrl, apiRoutes.categories, {
				method: 'POST',
				body: JSON.stringify(input),
			}),
		updateCategory: (id, input) =>
			request(baseUrl, apiRoutes.category(id), {
				method: 'PATCH',
				body: JSON.stringify(input),
			}),
		deleteCategory: (id) =>
			request(baseUrl, apiRoutes.category(id), { method: 'DELETE' }),
		reorderCategories: (input) =>
			request(baseUrl, apiRoutes.categoriesReorder, {
				method: 'PUT',
				body: JSON.stringify(input),
			}),
		resolveCategoryId: (input) =>
			request(baseUrl, apiRoutes.categoriesResolve, {
				method: 'POST',
				body: JSON.stringify(input),
			}),

		listImages: () => request(baseUrl, apiRoutes.images),
		getImage: (id) => request(baseUrl, apiRoutes.image(id)),
		createImage: (input) =>
			request(baseUrl, apiRoutes.images, {
				method: 'POST',
				body: JSON.stringify(input),
			}),
		deleteImage: (id) =>
			request(baseUrl, apiRoutes.image(id), { method: 'DELETE' }),

		getSettings: () => request(baseUrl, apiRoutes.settings),
		updateSettings: (input) =>
			request(baseUrl, apiRoutes.settings, {
				method: 'PATCH',
				body: JSON.stringify(input),
			}),
	};
}
