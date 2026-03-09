
-- Add check-in/check-out columns to presencas
ALTER TABLE public.presencas 
  ADD COLUMN hora_entrada timestamptz DEFAULT now(),
  ADD COLUMN hora_saida timestamptz DEFAULT NULL,
  ADD COLUMN aula_id uuid REFERENCES public.aulas(id) DEFAULT NULL;

-- Add status column to aulas
ALTER TABLE public.aulas 
  ADD COLUMN status text NOT NULL DEFAULT 'aberta';

-- Allow students to update their own presenca (for check-out)
CREATE POLICY "Students can update own presenca"
  ON public.presencas
  FOR UPDATE
  TO authenticated
  USING (aluno_id = auth.uid())
  WITH CHECK (aluno_id = auth.uid());

-- Allow professors to update presencas of their unit (for auto-checkout)
CREATE POLICY "Professors can update presencas of their unit"
  ON public.presencas
  FOR UPDATE
  TO authenticated
  USING (
    get_user_role(auth.uid()) = 'professor' 
    AND unidade_id = get_user_unidade_id(auth.uid())
  )
  WITH CHECK (
    get_user_role(auth.uid()) = 'professor' 
    AND unidade_id = get_user_unidade_id(auth.uid())
  );
