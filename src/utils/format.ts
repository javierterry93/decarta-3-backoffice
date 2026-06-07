export { formatEuroPrice as formatPrice } from './currency.ts';

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
