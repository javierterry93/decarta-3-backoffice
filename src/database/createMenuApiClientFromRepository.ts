import type { MenuApiClient } from '../api/menuApiClient.ts';
import type { DatabaseConnection } from './DatabaseConnection.ts';
import type { MenuRepository } from './MenuRepository.ts';

async function withConnection<T>(
	connection: DatabaseConnection,
	fn: (repository: MenuRepository) => Promise<T>,
): Promise<T> {
	if (!connection.isConnected()) {
		await connection.connect();
	}
	return fn(connection.getMenuRepository());
}

export function createMenuApiClientFromRepository(
	connection: DatabaseConnection,
): MenuApiClient {
	return {
		getMenu: () => withConnection(connection, (repo) => repo.getMenu()),

		listProducts: () => withConnection(connection, (repo) => repo.listProducts()),
		getProduct: (id) => withConnection(connection, (repo) => repo.getProduct(id)),
		createProduct: (input) =>
			withConnection(connection, (repo) => repo.createProduct(input)),
		updateProduct: (id, input) =>
			withConnection(connection, (repo) => repo.updateProduct(id, input)),
		deleteProduct: (id) =>
			withConnection(connection, (repo) => repo.deleteProduct(id)),
		deleteProducts: (input) =>
			withConnection(connection, (repo) => repo.deleteProducts(input)),
		duplicateProduct: (id) =>
			withConnection(connection, (repo) => repo.duplicateProduct(id)),
		reorderProducts: (input) =>
			withConnection(connection, (repo) => repo.reorderProducts(input)),
		importProducts: (items) =>
			withConnection(connection, (repo) => repo.importProducts(items)),

		listCategories: () =>
			withConnection(connection, (repo) => repo.listCategories()),
		getCategory: (id) =>
			withConnection(connection, (repo) => repo.getCategory(id)),
		createCategory: (input) =>
			withConnection(connection, (repo) => repo.createCategory(input)),
		updateCategory: (id, input) =>
			withConnection(connection, (repo) => repo.updateCategory(id, input)),
		deleteCategory: (id) =>
			withConnection(connection, (repo) => repo.deleteCategory(id)),
		reorderCategories: (input) =>
			withConnection(connection, (repo) => repo.reorderCategories(input)),
		resolveCategoryId: (input) =>
			withConnection(connection, (repo) => repo.resolveCategoryId(input)),

		listImages: () => withConnection(connection, (repo) => repo.listImages()),
		getImage: (id) => withConnection(connection, (repo) => repo.getImage(id)),
		createImage: (input) =>
			withConnection(connection, (repo) => repo.createImage(input)),
		deleteImage: (id) =>
			withConnection(connection, (repo) => repo.deleteImage(id)),

		getSettings: () => withConnection(connection, (repo) => repo.getSettings()),
		updateSettings: (input) =>
			withConnection(connection, (repo) => repo.updateSettings(input)),
		resetMenu: () => withConnection(connection, (repo) => repo.resetMenu()),
	};
}
