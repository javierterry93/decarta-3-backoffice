import { Upload } from 'lucide-react';
import { useCallback, useState } from 'react';
import { cn } from '../../utils/cn.ts';

type ImageUploaderProps = {
	onUpload: (file: File) => Promise<void>;
	className?: string;
	compact?: boolean;
};

export function ImageUploader({
	onUpload,
	className,
	compact = false,
}: ImageUploaderProps) {
	const [dragging, setDragging] = useState(false);
	const [uploading, setUploading] = useState(false);

	const processFile = useCallback(
		async (file: File) => {
			if (!file.type.startsWith('image/')) return;
			setUploading(true);
			try {
				await onUpload(file);
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
			const file = e.dataTransfer.files[0];
			if (file) void processFile(file);
		},
		[processFile],
	);

	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (file) void processFile(file);
			e.target.value = '';
		},
		[processFile],
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
			onDrop={handleDrop}
		>
			<input
				type="file"
				accept="image/*"
				className="sr-only"
				onChange={handleChange}
				disabled={uploading}
			/>
			<Upload
				className={cn(
					'text-foreground-muted',
					compact ? 'h-6 w-6' : 'h-10 w-10',
				)}
				aria-hidden
			/>
			<span className="mt-2 text-sm font-medium text-foreground">
				{uploading ? 'Subiendo…' : 'Arrastra una imagen o haz clic'}
			</span>
			<span className="mt-1 text-xs text-foreground-muted">
				Se optimiza automáticamente
			</span>
		</label>
	);
}
