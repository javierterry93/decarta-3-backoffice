type PageLoadingProps = {
	message?: string;
};

export function PageLoading({ message = 'Cargando…' }: PageLoadingProps) {
	return (
		<p className="py-12 text-center text-sm text-foreground-muted">{message}</p>
	);
}

type PageErrorProps = {
	message?: string;
};

export function PageError({
	message = 'No se pudieron cargar los datos.',
}: PageErrorProps) {
	return (
		<p className="py-12 text-center text-sm text-accent-orange">{message}</p>
	);
}
