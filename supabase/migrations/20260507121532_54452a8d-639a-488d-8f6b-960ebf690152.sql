
-- 1) Privilege escalation: replace permissive UPDATE policy with column-level guard
DROP POLICY IF EXISTS "Users can update own profile" ON public.usuarios;

CREATE POLICY "Users can update own profile (safe fields)"
ON public.usuarios
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (
  id = auth.uid()
  AND (
    public.get_user_role(auth.uid()) = 'professor'
    OR (
      role = (SELECT u.role FROM public.usuarios u WHERE u.id = auth.uid())
      AND unidade_id = (SELECT u.unidade_id FROM public.usuarios u WHERE u.id = auth.uid())
      AND faixa = (SELECT u.faixa FROM public.usuarios u WHERE u.id = auth.uid())
    )
  )
);

-- 2) Storage UPDATE policy for documentos bucket
DROP POLICY IF EXISTS "documentos_update_own_or_professor" ON storage.objects;
CREATE POLICY "documentos_update_own_or_professor"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documentos'
  AND (
    owner = auth.uid()
    OR public.get_user_role(auth.uid()) = 'professor'
  )
)
WITH CHECK (
  bucket_id = 'documentos'
  AND (
    owner = auth.uid()
    OR public.get_user_role(auth.uid()) = 'professor'
  )
);

-- 3) Realtime channel-level authorization
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "realtime_authenticated_can_connect" ON realtime.messages;
CREATE POLICY "realtime_authenticated_can_connect"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  -- Professors can subscribe to anything
  public.get_user_role(auth.uid()) = 'professor'
  OR
  -- Students: only their own presence/notification topics
  topic LIKE 'user:' || auth.uid()::text || ':%'
  OR topic = 'broadcast:public'
);

-- 4) Lock down SECURITY DEFINER functions from anonymous execution
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_user_unidade_id(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, public, authenticated;
REVOKE EXECUTE ON FUNCTION public.prevent_role_escalation() FROM anon, public, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, public, authenticated;

GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_unidade_id(uuid) TO authenticated;
