import { Upload } from 'lucide-react';
import { useCallback, useState } from 'react';
import { cn } from '../../utils/cn.ts';

type ImageUploaderProps = {
	onUpload: (files: File[]) => Promise<void>;
	className?: string;
	compact?: boolean;
	multiple?: boolean;
};

export function ImageUploader({
	onUpload,
	className,
	compact = false,
	multiple = true,
}: ImageUploaderProps) {
	const [dragging, setDragging] = useState(false);
	const [uploading, setUploading] = useState(false);

	const processFiles = useCallback(
		async (fileList: FileList | File[]) => {
			const files = [...fileList].filter((file) => file.type.startsWith('image/'));
			if (files.length === 0) return;
			setUploading(true);
			try {
				await onUpload(files);
			} finally {
				setUploading(false);
			}
		},
		[onUpload],
	);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			setDragging(false);
			void processFiles(e.dataTransfer.files);
		},
		[processFiles],
	);

	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			if (e.target.files) void processFiles(e.target.files);
			e.target.value = '';
		},
		[processFiles],
	);

	return (
		<label
			className={cn(
				'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-fill transition-colors',
				dragging && 'border-primary bg-primary/5',
				compact ? 'p-4' : 'p-8',
				className,
			)}
			onDragOver={(e) => {
				e.preventDefault();
				setDragging(true);
			}}
			onDragLeave={() => setDragging(false)}
			onDrop={handleDrop}>
			<input
				type="file"
				accept="image/*"
				multiple={multiple}
				className="sr-only"
				onChange={handleChange}
				disabled={uploading}
			/>
			<Upload
				className={cn('text-foreground-muted', compact ? 'h-6 w-6' : 'h-10 w-10')}
				aria-hidden
			/>
			<span className="mt-2 text-sm font-medium text-foreground">
				{uploading ? 'Subiendo…' : 'Arrastra imágenes o haz clic'}
			</span>
			<span className="mt-1 text-xs text-foreground-muted">
				{multiple
					? 'Puedes subir varias a la vez · Se optimizan automáticamente'
					: 'Se optimiza automáticamente'}
			</span>
		</label>
	);
}
