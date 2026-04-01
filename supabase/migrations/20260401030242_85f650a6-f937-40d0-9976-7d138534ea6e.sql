
-- Fix comunicados: change {public} to {authenticated}
DROP POLICY IF EXISTS "Professors can manage comunicados" ON public.comunicados;
CREATE POLICY "Professors can manage comunicados" ON public.comunicados FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) = 'professor')
  WITH CHECK (get_user_role(auth.uid()) = 'professor');

DROP POLICY IF EXISTS "Students can read comunicados" ON public.comunicados;
CREATE POLICY "Students can read comunicados" ON public.comunicados FOR SELECT TO authenticated
  USING (get_user_role(auth.uid()) = 'aluno');

-- Fix documentos: change {public} to {authenticated}
DROP POLICY IF EXISTS "Professors can read all documentos" ON public.documentos;
CREATE POLICY "Professors can read all documentos" ON public.documentos FOR SELECT TO authenticated
  USING (get_user_role(auth.uid()) = 'professor');

DROP POLICY IF EXISTS "Users can delete own documentos" ON public.documentos;
CREATE POLICY "Users can delete own documentos" ON public.documentos FOR DELETE TO authenticated
  USING (usuario_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own documentos" ON public.documentos;
CREATE POLICY "Users can insert own documentos" ON public.documentos FOR INSERT TO authenticated
  WITH CHECK (usuario_id = auth.uid());

DROP POLICY IF EXISTS "Users can read own documentos" ON public.documentos;
CREATE POLICY "Users can read own documentos" ON public.documentos FOR SELECT TO authenticated
  USING (usuario_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own documentos" ON public.documentos;
CREATE POLICY "Users can update own documentos" ON public.documentos FOR UPDATE TO authenticated
  USING (usuario_id = auth.uid());
