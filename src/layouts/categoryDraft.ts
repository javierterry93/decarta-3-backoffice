import type { Category } from '../types/index.ts';
import type { CategoryEditDraft } from './CategoryEditLayout.tsx';

export function emptyCategoryDraft(): CategoryEditDraft {
	return {
		name: '',
		visible: true,
	};
}

export function categoryToDraft(category: Category): CategoryEditDraft {
	return {
		name: category.name ?? '',
		visible: category.visible ?? true,
	};
}

export type { CategoryEditDraft };
