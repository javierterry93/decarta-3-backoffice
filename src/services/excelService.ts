import * as XLSX from 'xlsx';
import type { Category, ExcelColumnMapping, Product } from '../types/index.ts';
import { createCategoryImportResolver } from '../utils/categoryImport.ts';

export type ExcelPreviewRow = Record<string, string | number>;

export function parseExcelFile(file: File): Promise<{
	columns: string[];
	rows: ExcelPreviewRow[];
}> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const data = new Uint8Array(e.target?.result as ArrayBuffer);
				const workbook = XLSX.read(data, { type: 'array' });
				const sheet = workbook.Sheets[workbook.SheetNames[0] ?? ''];
				if (!sheet) {
					reject(new Error('Hoja vacía'));
					return;
				}
				const json = XLSX.utils.sheet_to_json<ExcelPreviewRow>(sheet, {
					defval: '',
				});
				const columns = json.length > 0 ? Object.keys(json[0] ?? {}) : [];
				resolve({ columns, rows: json });
			} catch {
				reject(new Error('No se pudo leer el archivo'));
			}
		};
		reader.onerror = () => reject(new Error('Error al leer el archivo'));
		reader.readAsArrayBuffer(file);
	});
}

export function guessColumnMappings(columns: string[]): ExcelColumnMapping[] {
	const patterns: Record<ExcelColumnMapping['systemField'], RegExp[]> = {
		name: [/nombre/i, /producto/i, /name/i, /plato/i],
		price: [/precio/i, /price/i, /pvp/i],
		category: [/categor/i, /tipo/i, /sección/i, /section/i],
		description: [/descrip/i, /desc/i],
		skip: [],
	};

	return columns.map((col) => {
		for (const [field, regexes] of Object.entries(patterns)) {
			if (field === 'skip') continue;
			if (regexes.some((r) => r.test(col))) {
				return {
					excelColumn: col,
					systemField: field as ExcelColumnMapping['systemField'],
				};
			}
		}
		return { excelColumn: col, systemField: 'skip' };
	});
}

export function mapRowsToProducts(
	rows: ExcelPreviewRow[],
	mappings: ExcelColumnMapping[],
	categories: Category[],
): Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'order'>[] {
	const fieldMap = Object.fromEntries(
		mappings.map((m) => [m.systemField, m.excelColumn]),
	);
	const resolveCategoryId = createCategoryImportResolver(categories);

	return rows
		.filter((row) => {
			const nameCol = fieldMap.name;
			return nameCol && String(row[nameCol] ?? '').trim();
		})
		.map((row) => {
			const name = String(row[fieldMap.name ?? ''] ?? '').trim();
			const priceRaw = row[fieldMap.price ?? ''];
			const price = parseFloat(String(priceRaw).replace(',', '.')) || 0;
			const categoryName = String(row[fieldMap.category ?? ''] ?? '').trim();
			const shortDescription = String(
				row[fieldMap.description ?? ''] ?? '',
			).trim();

			return {
				name,
				price,
				categoryId: resolveCategoryId(categoryName),
				shortDescription,
				visible: true,
				imageId: null,
			};
		});
}

export function exportToExcel(
	products: Product[],
	categories: { id: string; name: string }[],
): void {
	const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));
	const data = products.map((p) => ({
		Nombre: p.name,
		Categoría: categoryMap[p.categoryId] ?? '',
		Precio: p.price,
		Descripción: p.shortDescription,
		Visible: p.visible ? 'Sí' : 'No',
	}));
	const ws = XLSX.utils.json_to_sheet(data);
	const wb = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(wb, ws, 'Carta');
	XLSX.writeFile(wb, 'carta.xlsx');
}

export function exportToCsv(
	products: Product[],
	categories: { id: string; name: string }[],
): void {
	const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));
	const data = products.map((p) => ({
		Nombre: p.name,
		Categoría: categoryMap[p.categoryId] ?? '',
		Precio: p.price,
		Descripción: p.shortDescription,
		Visible: p.visible ? 'Sí' : 'No',
	}));
	const ws = XLSX.utils.json_to_sheet(data);
	const csv = XLSX.utils.sheet_to_csv(ws);
	const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = 'carta.csv';
	link.click();
	URL.revokeObjectURL(url);
}
