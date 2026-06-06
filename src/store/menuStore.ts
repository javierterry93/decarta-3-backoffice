import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
	BusinessSettings,
	Category,
	MenuImage,
	Product,
} from '../types/index.ts';
import { generateId } from '../utils/format.ts';

const now = () => new Date().toISOString();

const defaultCategories: Category[] = [
	{ id: 'cat-1', name: 'Entrantes', order: 1, visible: true },
	{ id: 'cat-2', name: 'Carnes', order: 2, visible: true },
	{ id: 'cat-3', name: 'Postres', order: 3, visible: true },
];

const defaultProducts: Product[] = [
	{
		id: 'prod-1',
		name: 'Patatas Bravas',
		categoryId: 'cat-1',
		price: 5.5,
		shortDescription: 'Con salsa brava casera',
		visible: true,
		imageId: null,
		createdAt: now(),
		updatedAt: now(),
	},
	{
		id: 'prod-2',
		name: 'Hamburguesa Completa',
		categoryId: 'cat-2',
		price: 12.5,
		shortDescription: 'Carne, queso, bacon y huevo',
		visible: true,
		imageId: null,
		createdAt: now(),
		updatedAt: now(),
	},
];

const defaultSettings: BusinessSettings = {
	name: 'Mi Restaurante',
	logoUrl: null,
	phone: '',
	address: '',
	hours: 'Lun–Dom: 12:00–23:00',
	socialInstagram: '',
	socialFacebook: '',
	socialTwitter: '',
};

type MenuState = {
	products: Product[];
	categories: Category[];
	images: MenuImage[];
	settings: BusinessSettings;
	lastModified: string;
	addProduct: (product?: Partial<Product>) => string;
	updateProduct: (id: string, data: Partial<Product>) => void;
	duplicateProduct: (id: string) => string;
	deleteProduct: (id: string) => void;
	addCategory: (name?: string) => string;
	updateCategory: (id: string, data: Partial<Category>) => void;
	deleteCategory: (id: string) => void;
	reorderCategories: (orderedIds: string[]) => void;
	addImage: (image: Omit<MenuImage, 'id' | 'createdAt'>) => string;
	deleteImage: (id: string) => void;
	updateSettings: (data: Partial<BusinessSettings>) => void;
	importProducts: (items: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[]) => void;
};

export const useMenuStore = create<MenuState>()(
	persist(
		(set, get) => ({
			products: defaultProducts,
			categories: defaultCategories,
			images: [],
			settings: defaultSettings,
			lastModified: now(),

			addProduct: (partial = {}) => {
				const id = generateId();
				const timestamp = now();
				const firstCategory = get().categories[0]?.id ?? '';
				const product: Product = {
					id,
					name: '',
					categoryId: firstCategory,
					price: 0,
					shortDescription: '',
					visible: true,
					imageId: null,
					createdAt: timestamp,
					updatedAt: timestamp,
					...partial,
				};
				set((state) => ({
					products: [...state.products, product],
					lastModified: timestamp,
				}));
				return id;
			},

			updateProduct: (id, data) => {
				const timestamp = now();
				set((state) => ({
					products: state.products.map((p) =>
						p.id === id ? { ...p, ...data, updatedAt: timestamp } : p,
					),
					lastModified: timestamp,
				}));
			},

			duplicateProduct: (id) => {
				const source = get().products.find((p) => p.id === id);
				if (!source) return '';
				const newId = generateId();
				const timestamp = now();
				const copy: Product = {
					...source,
					id: newId,
					name: `${source.name} (copia)`,
					createdAt: timestamp,
					updatedAt: timestamp,
				};
				set((state) => ({
					products: [...state.products, copy],
					lastModified: timestamp,
				}));
				return newId;
			},

			deleteProduct: (id) => {
				set((state) => ({
					products: state.products.filter((p) => p.id !== id),
					lastModified: now(),
				}));
			},

			addCategory: (name = '') => {
				const id = generateId();
				const order =
					Math.max(0, ...get().categories.map((c) => c.order)) + 1;
				const category: Category = { id, name, order, visible: true };
				set((state) => ({
					categories: [...state.categories, category],
					lastModified: now(),
				}));
				return id;
			},

			updateCategory: (id, data) => {
				set((state) => ({
					categories: state.categories.map((c) =>
						c.id === id ? { ...c, ...data } : c,
					),
					lastModified: now(),
				}));
			},

			deleteCategory: (id) => {
				set((state) => ({
					categories: state.categories.filter((c) => c.id !== id),
					products: state.products.map((p) =>
						p.categoryId === id
							? { ...p, categoryId: state.categories[0]?.id ?? '' }
							: p,
					),
					lastModified: now(),
				}));
			},

			reorderCategories: (orderedIds) => {
				set((state) => ({
					categories: state.categories
						.map((c) => {
							const index = orderedIds.indexOf(c.id);
							return index >= 0 ? { ...c, order: index + 1 } : c;
						})
						.sort((a, b) => a.order - b.order),
					lastModified: now(),
				}));
			},

			addImage: (image) => {
				const id = generateId();
				const menuImage: MenuImage = {
					...image,
					id,
					createdAt: now(),
				};
				set((state) => ({
					images: [...state.images, menuImage],
					lastModified: now(),
				}));
				return id;
			},

			deleteImage: (id) => {
				set((state) => ({
					images: state.images.filter((i) => i.id !== id),
					products: state.products.map((p) =>
						p.imageId === id ? { ...p, imageId: null } : p,
					),
					lastModified: now(),
				}));
			},

			updateSettings: (data) => {
				set((state) => ({
					settings: { ...state.settings, ...data },
					lastModified: now(),
				}));
			},

			importProducts: (items) => {
				const timestamp = now();
				const newProducts: Product[] = items.map((item) => ({
					...item,
					id: generateId(),
					createdAt: timestamp,
					updatedAt: timestamp,
				}));
				set((state) => ({
					products: [...state.products, ...newProducts],
					lastModified: timestamp,
				}));
			},
		}),
		{ name: 'decarta-menu-store' },
	),
);
