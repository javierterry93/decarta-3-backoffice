import type { CategoryRepository } from '../../database/index.ts';
import {
	findCategoryByName,
	formatCategoryName,
} from '../../utils/categoryImport.ts';
import { generateId } from '../../utils/format.ts';
import type { ApiClient } from '../ApiClient.ts';
import type {
	CategoryCreateInput,
	CategoryReorderInput,
	CategoryResolveInput,
	CategoryUpdateInput,
} from '../types.ts';

export type CategoryApi = Pick<
	ApiClient,
	| 'listCategories'
	| 'createCategory'
	| 'updateCategory'
	| 'deleteCategory'
	| 'reorderCategories'
	| 'resolveCategoryId'
>;

export function createCategoryApi(repository: CategoryRepository): CategoryApi {
	return {
		async listCategories() {
			return repository.listCategories();
		},

		async createCategory(input: CategoryCreateInput) {
			const categories = await repository.listCategories();
			const id = generateId();
			const category = {
				id,
				name: input.name ?? '',
				order: Math.max(0, ...categories.map((c) => c.order)) + 1,
				visible: true,
			};

			await repository.insertCategory(category);
			return { id };
		},

		async updateCategory(id: string, input: CategoryUpdateInput) {
			return repository.updateCategory(id, {
				...(input.name !== undefined ? { name: input.name } : {}),
				...(input.order !== undefined ? { order: input.order } : {}),
				...(input.visible !== undefined ? { visible: input.visible } : {}),
			});
		},

		async deleteCategory(id: string) {
			await repository.deleteCategory(id);
		},

		async reorderCategories({ orderedIds }: CategoryReorderInput) {
			await repository.reorderCategories(orderedIds);
		},

		async resolveCategoryId({ name = '' }: CategoryResolveInput) {
			const categories = await repository.listCategories();
			const formatted = formatCategoryName(name);
			if (!formatted) return { id: categories[0]?.id ?? '' };

			const existing = findCategoryByName(categories, formatted);
			if (existing) return { id: existing.id };

			const id = generateId();
			const category = {
				id,
				name: formatted,
				order: Math.max(0, ...categories.map((c) => c.order)) + 1,
				visible: true,
			};

			await repository.insertCategory(category);
			return { id };
		},
	};
}
