revoke execute on function public.is_registry_admin() from public, anon;
revoke execute on function public.electoral_options(text, text, text, text) from public, anon;
revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.protect_profile_identity() from public, anon, authenticated;
revoke execute on function public.write_audit_log() from public, anon, authenticated;

grant execute on function public.is_registry_admin() to authenticated;
grant execute on function public.electoral_options(text, text, text, text) to authenticated;
