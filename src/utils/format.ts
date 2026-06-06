export function formatPrice(value: number): string {
	return new Intl.NumberFormat('es-ES', {
		style: 'currency',
		currency: 'EUR',
	}).format(value);
}

export function formatDate(date: string): string {
	return new Intl.DateTimeFormat('es-ES', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	}).format(new Date(date));
}

export function generateId(): string {
	return crypto.randomUUID();
}
