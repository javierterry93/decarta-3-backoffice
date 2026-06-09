import type { SupabaseClient } from '@supabase/supabase-js';
import type { DatabaseConnection } from '../../DatabaseConnection.ts';
import { wrapDatabaseError } from '../../DatabaseError.ts';
import type { Repository } from '../../Repository.ts';
import type { SupabaseDatabase } from './types.ts';
import { SUPABASE_TABLES } from './types.ts';
import { SupabaseRepository } from './SupabaseRepository.ts';

export type SupabaseConnectionOptions = {
	storageBucket?: string;
};

export function createSupabaseConnection(
	client: SupabaseClient<SupabaseDatabase>,
	options: SupabaseConnectionOptions = {},
): DatabaseConnection {
	return new SupabaseConnection(client, options.storageBucket ?? 'images');
}

class SupabaseConnection implements DatabaseConnection {
	private connected = false;
	private readonly repository: SupabaseRepository;

	constructor(client: SupabaseClient<SupabaseDatabase>, storageBucket: string) {
		this.repository = new SupabaseRepository(client, storageBucket);
	}

	async connect(): Promise<void> {
		if (this.connected) return;

		const { error } = await this.repository
			.getClient()
			.from(SUPABASE_TABLES.categories)
			.select('id')
			.limit(1);

		if (error) {
			throw wrapDatabaseError('No se pudo conectar con la base de datos', error);
		}

		this.connected = true;
	}

	disconnect(): Promise<void> {
		this.connected = false;
		return Promise.resolve();
	}

	isConnected(): boolean {
		return this.connected;
	}

	getRepository(): Repository {
		return this.repository;
	}
}
