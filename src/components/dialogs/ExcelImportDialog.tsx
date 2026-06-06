import { useCallback, useState } from 'react';
import { Dialog } from './ConfirmDialog.tsx';
import { Button } from '../ui/Button.tsx';
import { Label } from '../ui/Label.tsx';
import { Select } from '../ui/Select.tsx';
import type { ExcelColumnMapping, Product } from '../../types/index.ts';

type ExcelPreviewRow = Record<string, string | number>;

type ExcelImportDialogProps = {
	open: boolean;
	onClose: () => void;
	parseExcelFile: (file: File) => Promise<{
		columns: string[];
		rows: ExcelPreviewRow[];
	}>;
	guessColumnMappings: (columns: string[]) => ExcelColumnMapping[];
	mapRowsToProducts: (
		rows: ExcelPreviewRow[],
		mappings: ExcelColumnMapping[],
		resolveCategoryId: (name: string) => string,
	) => Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'order'>[];
	onResolveCategoryId: (name: string) => string;
	onImport: (
		items: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'order'>[],
	) => void;
	onParseError?: () => void;
};

type Step = 'upload' | 'mapping' | 'preview';

const systemFields: {
	value: ExcelColumnMapping['systemField'];
	label: string;
}[] = [
	{ value: 'name', label: 'Nombre' },
	{ value: 'price', label: 'Precio' },
	{ value: 'category', label: 'Categoría' },
	{ value: 'description', label: 'Descripción' },
	{ value: 'skip', label: 'Ignorar' },
];

export function ExcelImportDialog({
	open,
	onClose,
	parseExcelFile,
	guessColumnMappings,
	mapRowsToProducts,
	onResolveCategoryId,
	onImport,
	onParseError,
}: ExcelImportDialogProps) {
	const [step, setStep] = useState<Step>('upload');
	const [columns, setColumns] = useState<string[]>([]);
	const [rows, setRows] = useState<ExcelPreviewRow[]>([]);
	const [mappings, setMappings] = useState<ExcelColumnMapping[]>([]);

	const reset = useCallback(() => {
		setStep('upload');
		setColumns([]);
		setRows([]);
		setMappings([]);
	}, []);

	const handleClose = useCallback(() => {
		reset();
		onClose();
	}, [onClose, reset]);

	const handleFile = useCallback(
		async (e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (!file) return;
			try {
				const result = await parseExcelFile(file);
				setColumns(result.columns);
				setRows(result.rows);
				setMappings(guessColumnMappings(result.columns));
				setStep('mapping');
			} catch {
				onParseError?.();
			}
			e.target.value = '';
		},
		[parseExcelFile, guessColumnMappings, onParseError],
	);

	const previewProducts = mapRowsToProducts(rows, mappings, onResolveCategoryId);

	const handleImport = useCallback(() => {
		onImport(previewProducts);
		handleClose();
	}, [onImport, previewProducts, handleClose]);

	return (
		<Dialog open={open} onClose={handleClose} title="Importar desde Excel">
			{step === 'upload' && (
				<div className="space-y-4">
					<p className="text-sm text-foreground-muted">
						Sube un archivo Excel (.xlsx) con tu carta. Detectaremos las columnas
						automáticamente.
					</p>
					<label className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-border bg-fill p-8">
						<input
							type="file"
							accept=".xlsx,.xls,.csv"
							className="sr-only"
							onChange={handleFile}
						/>
						<span className="text-sm font-medium text-foreground">
							Seleccionar archivo Excel
						</span>
					</label>
				</div>
			)}

			{step === 'mapping' && (
				<div className="space-y-4">
					<p className="text-sm text-foreground-muted">
						Indica qué columna de tu Excel corresponde a cada campo.
					</p>
					<div className="space-y-3">
						{columns.map((col) => {
							const mapping = mappings.find((m) => m.excelColumn === col);
							return (
								<div
									key={col}
									className="grid grid-cols-1 items-center gap-2 sm:grid-cols-2 sm:gap-4">
									<Label>{col}</Label>
									<Select
										value={mapping?.systemField ?? 'skip'}
										onChange={(v) => {
											setMappings((prev) =>
												prev.map((m) =>
													m.excelColumn === col
														? {
																...m,
																systemField: v as ExcelColumnMapping['systemField'],
															}
														: m,
												),
											);
										}}
										options={systemFields.map((f) => ({
											value: f.value,
											label: f.label,
										}))}
									/>
								</div>
							);
						})}
					</div>
					<div className="flex justify-end gap-3 pt-4">
						<Button variant="outline" onClick={handleClose}>
							Cancelar
						</Button>
						<Button onClick={() => setStep('preview')}>Vista previa</Button>
					</div>
				</div>
			)}

			{step === 'preview' && (
				<div className="space-y-4">
					<p className="text-sm text-foreground-muted">
						Se importarán {previewProducts.length} productos.
					</p>
					<div className="max-h-64 overflow-auto rounded-lg border border-separator">
						<table className="w-full text-sm">
							<thead className="sticky top-0 bg-fill">
								<tr>
									<th className="px-3 py-2 text-left">Nombre</th>
									<th className="px-3 py-2 text-left">Precio</th>
									<th className="px-3 py-2 text-left">Descripción</th>
								</tr>
							</thead>
							<tbody>
								{previewProducts.slice(0, 20).map((p, i) => (
									<tr key={i} className="border-t border-separator">
										<td className="px-3 py-2">{p.name}</td>
										<td className="px-3 py-2">{p.price}€</td>
										<td className="px-3 py-2">{p.shortDescription}</td>
									</tr>
								))}
							</tbody>
						</table>
						{previewProducts.length > 20 && (
							<p className="p-3 text-xs text-foreground-muted">
								… y {previewProducts.length - 20} más
							</p>
						)}
					</div>
					<div className="flex justify-end gap-3 pt-4">
						<Button variant="outline" onClick={() => setStep('mapping')}>
							Atrás
						</Button>
						<Button onClick={handleImport}>Importar</Button>
					</div>
				</div>
			)}
		</Dialog>
	);
}
