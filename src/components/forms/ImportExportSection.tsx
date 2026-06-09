import { Download, Upload } from 'lucide-react';
import { useState } from 'react';
import { ExcelImportDialog } from '../dialogs/ExcelImportDialog.tsx';
import { Button } from '../ui/Button.tsx';
import { Card, CardDescription, CardHeader, CardTitle } from '../ui/Card.tsx';
import type {
	Category,
	ExcelColumnMapping,
	Product,
} from '../../types/index.ts';

type ExcelPreviewRow = Record<string, string | number>;

type ImportExportSectionProps = {
	categories: Category[];
	onExportExcel: () => void;
	onExportCsv: () => void;
	onImportProducts: (
		items: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'order'>[],
	) => void;
	parseExcelFile: (file: File) => Promise<{
		columns: string[];
		rows: ExcelPreviewRow[];
	}>;
	guessColumnMappings: (columns: string[]) => ExcelColumnMapping[];
	mapRowsToProducts: (
		rows: ExcelPreviewRow[],
		mappings: ExcelColumnMapping[],
		categories: Category[],
	) => Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'order'>[];
	onNotify: (message: string) => void;
};

export function ImportExportSection({
	categories,
	onExportExcel,
	onExportCsv,
	onImportProducts,
	parseExcelFile,
	guessColumnMappings,
	mapRowsToProducts,
	onNotify,
}: ImportExportSectionProps) {
	const [importOpen, setImportOpen] = useState(false);

	return (
		<>
			<Card>
				<CardHeader>
					<CardTitle>Importar / exportar</CardTitle>
					<CardDescription>Carga o descarga tu carta en Excel o CSV</CardDescription>
				</CardHeader>

				<div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
					<Button
						type="button"
						variant="outline"
						className="w-full sm:w-auto"
						onClick={() => setImportOpen(true)}>
						<Upload className="h-4 w-4" />
						Importar Excel
					</Button>
					<Button
						type="button"
						variant="outline"
						className="w-full sm:w-auto"
						onClick={() => {
							onExportExcel();
							onNotify('Carta exportada a Excel');
						}}>
						<Download className="h-4 w-4" />
						Exportar Excel
					</Button>
					<Button
						type="button"
						variant="outline"
						className="w-full sm:w-auto"
						onClick={() => {
							onExportCsv();
							onNotify('Carta exportada a CSV');
						}}>
						Exportar CSV
					</Button>
				</div>
			</Card>

			<ExcelImportDialog
				open={importOpen}
				onClose={() => setImportOpen(false)}
				categories={categories}
				parseExcelFile={parseExcelFile}
				guessColumnMappings={guessColumnMappings}
				mapRowsToProducts={mapRowsToProducts}
				onImport={(items) => {
					onImportProducts(items);
				}}
				onParseError={() => onNotify('No se pudo leer el archivo')}
			/>
		</>
	);
}
