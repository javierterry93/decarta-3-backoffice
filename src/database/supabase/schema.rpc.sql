-- RPC backoffice (ejecutar después de schema.rls.sql)
-- Requiere: tablas de schema.sql + helpers is_admin/owns_* de schema.rls.sql

-- =============================================================================
-- LIMPIEZA
-- =============================================================================

drop function if exists public.reset_menu() cascade;
drop function if exists public.import_products(jsonb) cascade;
drop function if exists public.delete_menu_image(uuid) cascade;
drop function if exists public.delete_category(uuid) cascade;
drop function if exists public.delete_products(uuid[]) cascade;
drop function if exists public.reorder_categories(uuid[]) cascade;
drop function if exists public.reorder_products(uuid, uuid[]) cascade;
drop function if exists public.touch_business_modified(uuid) cascade;
drop function if exists public.ensure_business() cascade;
drop function if exists public.ensure_user_settings() cascade;
drop function if exists public.current_business_id() cascade;

-- =============================================================================
-- RPC
-- =============================================================================

create function public.current_business_id()
returns uuid
language sql
stable
security invoker
set search_path = public
as $$
	select b.id
	from public.businesses as b
	where b.owner_user_id = auth.uid()
	limit 1;
$$;

create function public.ensure_business()
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
	ts timestamptz := now();
	uid uuid := auth.uid();
	bid uuid;
begin
	if public.is_admin() then
		select b.id into bid
		from public.businesses as b
		where b.owner_user_id = uid;

		return bid;
	end if;

	insert into public.businesses (owner_user_id, last_modified)
	values (uid, ts)
	on conflict (owner_user_id) do nothing;

	select b.id into bid
	from public.businesses as b
	where b.owner_user_id = uid;

	return bid;
end;
$$;

create function public.touch_business_modified(p_business_id uuid default null)
returns timestamptz
language plpgsql
security invoker
set search_path = public
as $$
declare
	ts timestamptz := now();
	bid uuid := coalesce(p_business_id, public.current_business_id());
begin
	if bid is null then
		return ts;
	end if;

	update public.businesses
	set last_modified = ts
	where id = bid
		and (public.is_admin() or owner_user_id = auth.uid());

	return ts;
end;
$$;

create function public.reorder_products(
	p_category_id uuid,
	p_ordered_ids uuid[]
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
	ts timestamptz := now();
	bid uuid;
begin
	select c.business_id
	into bid
	from public.categories as c
	where c.id = p_category_id;

	update public.products as p
	set
		sort_order = ord.idx,
		updated_at = ts
	from unnest(p_ordered_ids) with ordinality as ord(id, idx)
	where p.id = ord.id
		and p.category_id = p_category_id
		and (
			public.is_admin()
			or public.owns_category(p_category_id)
		);

	perform public.touch_business_modified(bid);
end;
$$;

create function public.reorder_categories(p_ordered_ids uuid[])
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
	bid uuid;
begin
	select c.business_id
	into bid
	from public.categories as c
	where c.id = p_ordered_ids[1];

	update public.categories as c
	set sort_order = ord.idx
	from unnest(p_ordered_ids) with ordinality as ord(id, idx)
	where c.id = ord.id
		and (
			public.is_admin()
			or public.owns_business(c.business_id)
		);

	perform public.touch_business_modified(bid);
end;
$$;

create function public.delete_products(p_ids uuid[])
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
	bid uuid;
begin
	select c.business_id
	into bid
	from public.products as p
	inner join public.categories as c on c.id = p.category_id
	where p.id = p_ids[1];

	delete from public.products as p
	where p.id = any (p_ids)
		and (
			public.is_admin()
			or public.owns_category(p.category_id)
		);

	perform public.touch_business_modified(bid);
end;
$$;

create function public.delete_category(p_id uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
	ts timestamptz := now();
	bid uuid;
	fallback uuid;
begin
	select c.business_id
	into bid
	from public.categories as c
	where c.id = p_id;

	select c.id
	into fallback
	from public.categories as c
	where c.id <> p_id
		and c.business_id = bid
	order by c.sort_order
	limit 1;

	if fallback is not null then
		update public.products as p
		set
			category_id = fallback,
			updated_at = ts
		where p.category_id = p_id
			and (
				public.is_admin()
				or public.owns_category(p_id)
			);
	end if;

	delete from public.categories as c
	where c.id = p_id
		and (
			public.is_admin()
			or public.owns_business(c.business_id)
		);

	perform public.touch_business_modified(bid);
end;
$$;

create function public.delete_menu_image(p_id uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
	ts timestamptz := now();
	bid uuid;
begin
	select i.business_id
	into bid
	from public.menu_images as i
	where i.id = p_id;

	update public.products as p
	set
		image_id = null,
		updated_at = ts
	where p.image_id = p_id
		and (
			public.is_admin()
			or exists (
				select 1
				from public.categories as c
				inner join public.businesses as b on b.id = c.business_id
				where c.id = p.category_id
					and b.owner_user_id = auth.uid()
			)
		);

	delete from public.menu_images as i
	where i.id = p_id
		and (
			public.is_admin()
			or public.owns_business(i.business_id)
		);

	perform public.touch_business_modified(bid);
end;
$$;

create function public.import_products(p_rows jsonb)
returns timestamptz
language plpgsql
security invoker
set search_path = public
as $$
declare
	ts timestamptz := now();
	bid uuid;
begin
	select c.business_id
	into bid
	from public.categories as c
	where c.id = (p_rows -> 0 ->> 'category_id')::uuid;

	insert into public.products (
		id,
		name,
		category_id,
		sort_order,
		price,
		short_description,
		visible,
		image_id,
		created_at,
		updated_at
	)
	select
		(r ->> 'id')::uuid,
		coalesce(r ->> 'name', ''),
		(r ->> 'category_id')::uuid,
		coalesce((r ->> 'sort_order')::int, 0),
		coalesce((r ->> 'price')::numeric, 0),
		coalesce(r ->> 'short_description', ''),
		coalesce((r ->> 'visible')::boolean, true),
		nullif(r ->> 'image_id', '')::uuid,
		coalesce((r ->> 'created_at')::timestamptz, ts),
		coalesce((r ->> 'updated_at')::timestamptz, ts)
	from jsonb_array_elements(p_rows) as r
	where public.is_admin()
		or public.owns_category((r ->> 'category_id')::uuid);

	return public.touch_business_modified(bid);
end;
$$;

create function public.reset_menu()
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
	ts timestamptz := now();
	bid uuid := public.current_business_id();
begin
	if bid is null then
		return;
	end if;

	delete from public.products as p
	where p.category_id in (
		select c.id from public.categories as c where c.business_id = bid
	);

	delete from public.menu_images as i
	where i.business_id = bid;

	delete from public.categories as c
	where c.business_id = bid;

	update public.businesses
	set
		name = 'Mi Restaurante',
		logo_image_id = null,
		phone = '',
		address = '',
		hours = 'Lun–Dom: 12:00–23:00',
		social_instagram = '',
		social_facebook = '',
		social_twitter = '',
		last_modified = ts
	where id = bid
		and (public.is_admin() or owner_user_id = auth.uid());
end;
$$;

grant execute on function public.current_business_id() to authenticated;
grant execute on function public.ensure_business() to authenticated;
grant execute on function public.touch_business_modified(uuid) to authenticated;
grant execute on function public.reorder_products(uuid, uuid[]) to authenticated;
grant execute on function public.reorder_categories(uuid[]) to authenticated;
grant execute on function public.delete_products(uuid[]) to authenticated;
grant execute on function public.delete_category(uuid) to authenticated;
grant execute on function public.delete_menu_image(uuid) to authenticated;
grant execute on function public.import_products(jsonb) to authenticated;
grant execute on function public.reset_menu() to authenticated;
