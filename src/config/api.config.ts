/**
 * Punto de ensamblado de la capa API (@Configuration / @Bean).
 * MenuService sobre el MenuRepository de Supabase (schema.sql).
 */
import { registerMenuApiClient } from '../api/getMenuApiClient.ts';
import { createMenuService } from '../api/menuService.ts';
import { connectDatabaseSync } from '../database/connectDatabase.ts';

registerMenuApiClient(() =>
	createMenuService(connectDatabaseSync().getMenuRepository()),
);
