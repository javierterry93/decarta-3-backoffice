import type { SupabaseClient } from '@supabase/supabase-js';
import type { DatabaseConnection } from '../DatabaseConnection.ts';
import { wrapDatabaseError } from '../DatabaseError.ts';
import type { MenuApiClient } from '../../api/menuApiClient.ts';
import { SupabaseMenuRepository } from './SupabaseMenuRepository.ts';
import type { SupabaseDatabase } from './types.ts';
import { SUPABASE_TABLES } from './types.ts';

export type SupabaseConnectionOptions = {
	storageBucket?: string;
};

export function createSupabaseConnection(
	client: SupabaseClient<SupabaseDatabase>,
	options: SupabaseConnectionOptions = {},
): DatabaseConnection {
	return new SupabaseConnection(client, options.storageBucket ?? 'menu-images');
}

class SupabaseConnection implements DatabaseConnection {
	private connected = false;
	private readonly repository: SupabaseMenuRepository;

	constructor(client: SupabaseClient<SupabaseDatabase>, storageBucket: string) {
		this.repository = new SupabaseMenuRepository(client, storageBucket);
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

	getMenuClient(): MenuApiClient {
		return this.repository;
	}
}
