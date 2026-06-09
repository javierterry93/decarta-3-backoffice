import type { Category } from '../types/index.ts';

export type CategoryUpdatePatch = Partial<
	Pick<Category, 'name' | 'order' | 'visible'>
>;

export interface CategoryRepository {
	listCategories(): Promise<Category[]>;
	insertCategory(category: Category): Promise<void>;
	updateCategory(id: string, patch: CategoryUpdatePatch): Promise<Category>;
	deleteCategory(id: string): Promise<void>;
	reorderCategories(orderedIds: string[]): Promise<void>;
}
