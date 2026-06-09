import type {
	BusinessSettings,
	Category,
	Image,
	Product,
} from '../types/index.ts';

/** Unidad mínima de lectura: todos los datos del negocio (la carta completa). */
export type Snapshot = {
	products: Product[];
	categories: Category[];
	images: Image[];
	settings: BusinessSettings;
	lastModified: string;
};

export interface SnapshotRepository {
	/** Snapshot completo en una sola consulta. */
	fetchSnapshot(): Promise<Snapshot>;
	resetSnapshot(): Promise<void>;
}
