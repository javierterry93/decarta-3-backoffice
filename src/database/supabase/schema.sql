-- Esquema Supabase (modo VITE_MENU_API=supabase)
-- Ejecutar en SQL Editor: src/database/supabase/schema.sql

-- =============================================================================
-- LIMPIEZA
-- =============================================================================

drop view if exists public.business_menu cascade;

drop table if exists public.products cascade;
drop table if exists public.categories cascade;
drop table if exists public.menu_images cascade;
drop table if exists public.businesses cascade;

-- =============================================================================
-- TABLAS
-- =============================================================================

create table public.businesses (
	id uuid primary key default gen_random_uuid(),
	owner_user_id uuid not null unique references auth.users (id) on delete cascade,
	name text not null default 'Mi Restaurante',
	logo_image_id uuid,
	phone text not null default '',
	address text not null default '',
	hours text not null default 'Lun–Dom: 12:00–23:00',
	social_instagram text not null default '',
	social_facebook text not null default '',
	social_twitter text not null default '',
	last_modified timestamptz not null default now()
);

create table public.menu_images (
	id uuid primary key,
	business_id uuid not null references public.businesses (id) on delete cascade,
	name text not null,
	url text,
	thumbnail_url text,
	created_at timestamptz not null default now()
);

alter table public.businesses
	add constraint businesses_logo_image_id_fkey
	foreign key (logo_image_id) references public.menu_images (id) on delete set null;

create table public.categories (
	id uuid primary key,
	business_id uuid not null references public.businesses (id) on delete cascade,
	name text not null default '',
	sort_order int not null default 0,
	visible boolean not null default true
);

create table public.products (
	id uuid primary key,
	name text not null default '',
	category_id uuid not null references public.categories (id) on delete cascade,
	sort_order int not null default 0,
	price numeric(10, 2) not null default 0,
	short_description text not null default '',
	visible boolean not null default true,
	image_id uuid references public.menu_images (id) on delete set null,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create index businesses_owner_user_id_idx on public.businesses (owner_user_id);
create index menu_images_business_id_idx on public.menu_images (business_id);
create index categories_business_id_idx on public.categories (business_id);
create index products_category_id_idx on public.products (category_id);

-- =============================================================================
-- VISTAS (cliente: productos visibles + categoría, filtrar por business_id)
-- =============================================================================

create view public.business_menu
with (security_invoker = false)
as
select
	c.business_id,
	p.id as product_id,
	p.name as product_name,
	p.sort_order as product_order,
	p.price,
	p.short_description,
	p.image_id,
	c.id as category_id,
	c.name as category_name,
	c.sort_order as category_order
from public.products as p
inner join public.categories as c on c.id = p.category_id
where c.visible = true
	and p.visible = true;

revoke all on public.business_menu from public;
grant select on public.business_menu to anon, authenticated;
