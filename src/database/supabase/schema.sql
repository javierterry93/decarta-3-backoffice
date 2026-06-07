-- Esquema inicial para el motor Supabase (modo VITE_MENU_API=database)
-- Ejecutar en el SQL Editor del proyecto Supabase.

create table if not exists public.menu_images (
	id uuid primary key,
	name text not null,
	url text,
	thumbnail_url text,
	created_at timestamptz not null default now()
);

create table if not exists public.categories (
	id uuid primary key,
	name text not null default '',
	sort_order int not null default 0,
	visible boolean not null default true
);

create table if not exists public.products (
	id uuid primary key,
	name text not null default '',
	category_id uuid not null references public.categories(id) on delete cascade,
	sort_order int not null default 0,
	price numeric(10, 2) not null default 0,
	short_description text not null default '',
	visible boolean not null default true,
	image_id uuid references public.menu_images(id) on delete set null,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create table if not exists public.business_settings (
	id int primary key default 1 check (id = 1),
	name text not null default 'Mi Restaurante',
	logo_image_id uuid references public.menu_images(id) on delete set null,
	phone text not null default '',
	address text not null default '',
	hours text not null default 'Lun–Dom: 12:00–23:00',
	social_instagram text not null default '',
	social_facebook text not null default '',
	social_twitter text not null default '',
	last_modified timestamptz not null default now()
);

insert into public.business_settings (id)
values (1)
on conflict (id) do nothing;

-- Bucket de Storage (crear también desde el panel: menu-images, público)
-- insert into storage.buckets (id, name, public) values ('menu-images', 'menu-images', true);
