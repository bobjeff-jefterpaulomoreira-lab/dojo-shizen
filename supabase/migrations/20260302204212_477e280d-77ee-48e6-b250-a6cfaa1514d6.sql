
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Professors can insert avaliacoes for their unit students" ON public.avaliacoes;
DROP POLICY IF EXISTS "Professors can read avaliacoes of their unit students" ON public.avaliacoes;
DROP POLICY IF EXISTS "Professors can update avaliacoes of their unit students" ON public.avaliacoes;

-- Recreate policies allowing professors to manage ALL students' evaluations
CREATE POLICY "Professors can insert avaliacoes"
ON public.avaliacoes FOR INSERT
TO authenticated
WITH CHECK (get_user_role(auth.uid()) = 'professor');

CREATE POLICY "Professors can read avaliacoes"
ON public.avaliacoes FOR SELECT
TO authenticated
USING (get_user_role(auth.uid()) = 'professor');

CREATE POLICY "Professors can update avaliacoes"
ON public.avaliacoes FOR UPDATE
TO authenticated
USING (get_user_role(auth.uid()) = 'professor');
