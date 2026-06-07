export class DatabaseError extends Error {
	cause?: unknown;

	constructor(message: string, cause?: unknown) {
		super(message);
		this.name = 'DatabaseError';
		this.cause = cause;
	}
}

export function wrapDatabaseError(message: string, error: unknown): DatabaseError {
	if (error instanceof DatabaseError) return error;
	const detail =
		error && typeof error === 'object' && 'message' in error
			? String((error as { message: unknown }).message)
			: String(error);
	return new DatabaseError(`${message}: ${detail}`, error);
}
