/**
 * Punto de ensamblado de la capa API (@Configuration / @Bean).
 * ApiClient sobre el Repository de Supabase (schema.sql).
 */
import { registerApiClient, createApiClient } from '../api/index.ts';
import { connectDatabaseSync } from '../database/index.ts';

registerApiClient(() => createApiClient(connectDatabaseSync().getRepository()));
