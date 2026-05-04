
-- 1. Prevent privilege escalation on usuarios table
-- Block non-professors from changing role or unidade_id on their own row
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only professors can change role or unidade_id
  IF (NEW.role IS DISTINCT FROM OLD.role) OR (NEW.unidade_id IS DISTINCT FROM OLD.unidade_id) THEN
    IF public.get_user_role(auth.uid()) <> 'professor' THEN
      RAISE EXCEPTION 'Not allowed to change role or unidade_id';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.usuarios;
CREATE TRIGGER trg_prevent_role_escalation
BEFORE UPDATE ON public.usuarios
FOR EACH ROW
EXECUTE FUNCTION public.prevent_role_escalation();

-- 2. Make documentos bucket private
UPDATE storage.buckets SET public = false WHERE id = 'documentos';

-- 3. Storage policies for documentos bucket (path convention: <user_id>/<filename>)
DROP POLICY IF EXISTS "Users can read own documents storage" ON storage.objects;
DROP POLICY IF EXISTS "Professors can read all documents storage" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own documents storage" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own documents storage" ON storage.objects;

CREATE POLICY "Users can read own documents storage"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documentos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Professors can read all documents storage"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documentos' AND public.get_user_role(auth.uid()) = 'professor');

CREATE POLICY "Users can upload own documents storage"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documentos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own documents storage"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documentos' AND auth.uid()::text = (storage.foldername(name))[1]);
