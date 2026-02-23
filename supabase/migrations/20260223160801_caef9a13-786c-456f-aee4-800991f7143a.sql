-- Drop the existing restrictive policy that limits professors to their own unit
DROP POLICY IF EXISTS "Professors can read students in their unit" ON public.usuarios;

-- Create a new policy that allows professors to read ALL students (across all units)
CREATE POLICY "Professors can read all students"
ON public.usuarios
FOR SELECT
TO authenticated
USING (
  get_user_role(auth.uid()) = 'professor'
);

-- Also update the update policy so professors can update students from any unit
DROP POLICY IF EXISTS "Professors can update students in their unit" ON public.usuarios;

CREATE POLICY "Professors can update all students"
ON public.usuarios
FOR UPDATE
TO authenticated
USING (
  get_user_role(auth.uid()) = 'professor' AND role = 'aluno'
)
WITH CHECK (
  get_user_role(auth.uid()) = 'professor' AND role = 'aluno'
);

-- Allow professors to delete students
CREATE POLICY "Professors can delete students"
ON public.usuarios
FOR DELETE
TO authenticated
USING (
  get_user_role(auth.uid()) = 'professor' AND role = 'aluno'
);