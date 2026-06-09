import type { BusinessRepository } from './BusinessRepository.ts';
import type { CategoryRepository } from './CategoryRepository.ts';
import type { ImageRepository } from './ImageRepository.ts';
import type { ProductRepository } from './ProductRepository.ts';
import type { SnapshotRepository } from './SnapshotRepository.ts';

/** Composición de los repositorios por entidad. */
export interface Repository
	extends
		BusinessRepository,
		ProductRepository,
		CategoryRepository,
		ImageRepository,
		SnapshotRepository {}
