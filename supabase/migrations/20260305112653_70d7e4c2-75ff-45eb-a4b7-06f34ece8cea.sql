
-- Create storage bucket for student documents
INSERT INTO storage.buckets (id, name, public) VALUES ('documentos', 'documentos', true);

-- Create documents table
CREATE TABLE public.documentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL DEFAULT 'carteirinha', -- 'carteirinha' or 'certificado'
  nome TEXT NOT NULL,
  arquivo_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;

-- Students can read their own documents
CREATE POLICY "Users can read own documentos"
  ON public.documentos FOR SELECT
  USING (usuario_id = auth.uid());

-- Students can insert their own documents
CREATE POLICY "Users can insert own documentos"
  ON public.documentos FOR INSERT
  WITH CHECK (usuario_id = auth.uid());

-- Students can delete their own documents
CREATE POLICY "Users can delete own documentos"
  ON public.documentos FOR DELETE
  USING (usuario_id = auth.uid());

-- Students can update their own documents
CREATE POLICY "Users can update own documentos"
  ON public.documentos FOR UPDATE
  USING (usuario_id = auth.uid());

-- Professors can read all documents
CREATE POLICY "Professors can read all documentos"
  ON public.documentos FOR SELECT
  USING (get_user_role(auth.uid()) = 'professor');

-- Storage policies for documentos bucket
CREATE POLICY "Users can upload own documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'documentos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can read own documents storage"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documentos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own documents storage"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'documentos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Professors can read all documents storage"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documentos' AND get_user_role(auth.uid()) = 'professor');
