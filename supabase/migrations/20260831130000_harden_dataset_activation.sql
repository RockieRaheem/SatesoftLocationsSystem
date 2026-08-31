alter table public.electoral_datasets
  add column source_sha256 text not null check (source_sha256 ~ '^[a-f0-9]{64}$');

create or replace function public.activate_electoral_dataset(p_dataset_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  target_country text;
begin
  select country_code into target_country
  from public.electoral_datasets
  where id = p_dataset_id and status not in ('importing', 'failed');

  if target_country is null then
    raise exception 'Dataset is missing or not ready for activation';
  end if;
  if not exists(select 1 from public.electoral_locations where dataset_id = p_dataset_id) then
    raise exception 'An empty dataset cannot be activated';
  end if;

  perform pg_advisory_xact_lock(hashtext(target_country));
  update public.electoral_datasets
    set active = false, status = 'archived'
    where country_code = target_country and active and id <> p_dataset_id;
  update public.electoral_datasets set active = true where id = p_dataset_id;
end;
$$;

revoke execute on function public.activate_electoral_dataset(uuid) from public, anon, authenticated;
grant execute on function public.activate_electoral_dataset(uuid) to service_role;
