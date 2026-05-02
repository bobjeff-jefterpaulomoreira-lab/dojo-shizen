-- Allow students to read any open class regardless of unit (cross-unit training)
DROP POLICY IF EXISTS "Students can read aulas of their unit" ON public.aulas;

CREATE POLICY "Authenticated users can read aulas"
ON public.aulas
FOR SELECT
TO authenticated
USING (true);