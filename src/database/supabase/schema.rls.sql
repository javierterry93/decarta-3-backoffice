-- RLS + Storage (ejecutar después de schema.sql)
-- Orden: schema.sql → schema.rls.sql → schema.rpc.sql

-- =============================================================================
-- LIMPIEZA
-- =============================================================================

drop policy if exists admin_all_businesses on public.businesses;
drop policy if exists business_read_own_businesses on public.businesses;
drop policy if exists business_write_own_businesses on public.businesses;
drop policy if exists business_update_own_businesses on public.businesses;

drop policy if exists admin_all_menu_images on public.menu_images;
drop policy if exists business_own_menu_images on public.menu_images;

drop policy if exists admin_all_categories on public.categories;
drop policy if exists business_own_categories on public.categories;

drop policy if exists admin_all_products on public.products;
drop policy if exists business_own_products on public.products;

drop policy if exists anon_read_menu_images on storage.objects;
drop policy if exists backoffice_all_menu_images_storage on storage.objects;
drop policy if exists backoffice_write_menu_images_storage on storage.objects;
drop policy if exists backoffice_read_menu_images_storage on storage.objects;
drop policy if exists backoffice_update_menu_images_storage on storage.objects;
drop policy if exists backoffice_delete_menu_images_storage on storage.objects;

drop function if exists public.owns_category(uuid) cascade;
drop function if exists public.owns_business(uuid) cascade;
drop function if exists public.is_admin() cascade;

-- =============================================================================
-- HELPERS (usados por RLS y RPC)
-- Roles: app_metadata.role = "admin" | dueño vía owner_user_id
-- =============================================================================

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
	select coalesce(
		(auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
		false
	);
$$;

create function public.owns_business(p_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
	select exists (
		select 1
		from public.businesses as b
		where b.id = p_business_id
			and b.owner_user_id = auth.uid()
	);
$$;

create function public.owns_category(p_category_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
	select exists (
		select 1
		from public.categories as c
		inner join public.businesses as b on b.id = c.business_id
		where c.id = p_category_id
			and b.owner_user_id = auth.uid()
	);
$$;

-- =============================================================================
-- RLS TABLAS (backoffice autenticado; cliente solo vista business_menu)
-- =============================================================================

alter table public.businesses enable row level security;
alter table public.menu_images enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;

revoke all on table public.businesses from anon;
revoke all on table public.menu_images from anon;
revoke all on table public.categories from anon;
revoke all on table public.products from anon;

create policy admin_all_businesses on public.businesses
	for all to authenticated
	using (public.is_admin())
	with check (public.is_admin());

create policy business_read_own_businesses on public.businesses
	for select to authenticated
	using (owner_user_id = auth.uid());

create policy business_write_own_businesses on public.businesses
	for insert to authenticated
	with check (owner_user_id = auth.uid());

create policy business_update_own_businesses on public.businesses
	for update to authenticated
	using (owner_user_id = auth.uid())
	with check (owner_user_id = auth.uid());

create policy admin_all_menu_images on public.menu_images
	for all to authenticated
	using (public.is_admin())
	with check (public.is_admin());

create policy business_own_menu_images on public.menu_images
	for all to authenticated
	using (public.owns_business(business_id))
	with check (public.owns_business(business_id));

create policy admin_all_categories on public.categories
	for all to authenticated
	using (public.is_admin())
	with check (public.is_admin());

create policy business_own_categories on public.categories
	for all to authenticated
	using (public.owns_business(business_id))
	with check (public.owns_business(business_id));

create policy admin_all_products on public.products
	for all to authenticated
	using (public.is_admin())
	with check (public.is_admin());

create policy business_own_products on public.products
	for all to authenticated
	using (public.owns_category(category_id))
	with check (public.owns_category(category_id));

-- =============================================================================
-- STORAGE
-- =============================================================================

insert into storage.buckets (id, name, public)
values ('menu-images', 'menu-images', true)
on conflict (id) do update set public = true;

alter table storage.objects enable row level security;

create policy anon_read_menu_images on storage.objects
	for select to anon using (bucket_id = 'menu-images');

create policy backoffice_read_menu_images_storage on storage.objects
	for select to authenticated
	using (bucket_id = 'menu-images');

create policy backoffice_write_menu_images_storage on storage.objects
	for insert to authenticated
	with check (bucket_id = 'menu-images');

create policy backoffice_update_menu_images_storage on storage.objects
	for update to authenticated
	using (bucket_id = 'menu-images')
	with check (bucket_id = 'menu-images');

create policy backoffice_delete_menu_images_storage on storage.objects
	for delete to authenticated
	using (bucket_id = 'menu-images');

grant execute on function public.is_admin() to authenticated;
grant execute on function public.owns_business(uuid) to authenticated;
grant execute on function public.owns_category(uuid) to authenticated;
