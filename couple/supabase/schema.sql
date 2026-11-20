create table if not exists public.couple_members (
  user_id uuid primary key references auth.users (id) on delete cascade
);

alter table public.couple_members enable row level security;
revoke all on public.couple_members from public, anon, authenticated;

create or replace function public.is_couple_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.couple_members
    where user_id = auth.uid()
  );
$$;

revoke all on function public.is_couple_member() from public, anon, authenticated;
grant execute on function public.is_couple_member() to authenticated;

create table if not exists public.app_data (
  path text primary key check (
    path ~ '^(pins|gallery|letters|messages|gifts|critters|garden|questions)/[^/]+$'
    or path ~ '^profiles/[0-9a-fA-F-]{36}$'
    or path = 'couple/settings'
    or path ~ '^data/users/[0-9a-fA-F-]{36}/seen$'
  ),
  data jsonb not null check (jsonb_typeof(data) = 'object'),
  updated_at timestamptz not null default now()
);

alter table public.app_data enable row level security;
alter table public.app_data replica identity full;
revoke all on public.app_data from public, anon, authenticated;
grant select, insert, update, delete on public.app_data to authenticated;

drop policy if exists "Couple members can read app data" on public.app_data;
create policy "Couple members can read app data"
on public.app_data for select to authenticated
using (
  public.is_couple_member()
  and (
    path not like 'data/users/%/seen'
    or path = 'data/users/' || auth.uid()::text || '/seen'
  )
);

drop policy if exists "Couple members can insert app data" on public.app_data;
create policy "Couple members can insert app data"
on public.app_data for insert to authenticated
with check (
  public.is_couple_member()
  and (
    (path not like 'profiles/%' and path not like 'data/users/%')
    or path = 'profiles/' || auth.uid()::text
    or path = 'data/users/' || auth.uid()::text || '/seen'
  )
);

drop policy if exists "Couple members can update app data" on public.app_data;
create policy "Couple members can update app data"
on public.app_data for update to authenticated
using (
  public.is_couple_member()
  and (
    (path not like 'profiles/%' and path not like 'data/users/%')
    or path = 'profiles/' || auth.uid()::text
    or path = 'data/users/' || auth.uid()::text || '/seen'
  )
)
with check (
  public.is_couple_member()
  and (
    (path not like 'profiles/%' and path not like 'data/users/%')
    or path = 'profiles/' || auth.uid()::text
    or path = 'data/users/' || auth.uid()::text || '/seen'
  )
);

drop policy if exists "Couple members can delete app data" on public.app_data;
create policy "Couple members can delete app data"
on public.app_data for delete to authenticated
using (
  public.is_couple_member()
  and (
    (path not like 'profiles/%' and path not like 'data/users/%')
    or path = 'profiles/' || auth.uid()::text
    or path = 'data/users/' || auth.uid()::text || '/seen'
  )
);

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
    and not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'app_data'
    ) then
    alter publication supabase_realtime add table public.app_data;
  end if;
end
$$;
