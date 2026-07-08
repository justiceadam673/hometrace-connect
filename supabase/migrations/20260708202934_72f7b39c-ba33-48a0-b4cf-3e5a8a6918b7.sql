
REVOKE EXECUTE ON FUNCTION public.is_developer_manager(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_developer_member(uuid, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_developer_manager(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.is_developer_member(uuid, uuid) TO service_role;
