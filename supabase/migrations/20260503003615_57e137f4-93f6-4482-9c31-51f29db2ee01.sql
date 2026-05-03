-- Revoke EXECUTE from anon for SECURITY DEFINER functions that require an authenticated user
REVOKE EXECUTE ON FUNCTION public.adjust_wallet_balance(integer, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.adjust_arena_wallet(integer, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.adjust_race_wallet(integer, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.adjust_ripz_wallet(integer, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.verify_chat_age(date) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM anon, public;

GRANT EXECUTE ON FUNCTION public.adjust_wallet_balance(integer, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.adjust_arena_wallet(integer, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.adjust_race_wallet(integer, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.adjust_ripz_wallet(integer, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_chat_age(date) TO authenticated;