
-- Create comunicados table
CREATE TABLE public.comunicados (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professor_id UUID NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'Aviso Geral',
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_evento TIMESTAMP WITH TIME ZONE,
  imagem_url TEXT,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.comunicados ENABLE ROW LEVEL SECURITY;

-- Professors can do everything
CREATE POLICY "Professors can manage comunicados"
  ON public.comunicados FOR ALL
  USING (get_user_role(auth.uid()) = 'professor')
  WITH CHECK (get_user_role(auth.uid()) = 'professor');

-- Students can read
CREATE POLICY "Students can read comunicados"
  ON public.comunicados FOR SELECT
  USING (get_user_role(auth.uid()) = 'aluno');

-- Trigger for updated_at
CREATE TRIGGER update_comunicados_updated_at
  BEFORE UPDATE ON public.comunicados
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for comunicados attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('comunicados', 'comunicados', true);

-- Storage policies
CREATE POLICY "Anyone can view comunicados files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'comunicados');

CREATE POLICY "Professors can upload comunicados files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'comunicados' AND (SELECT get_user_role(auth.uid())) = 'professor');

CREATE POLICY "Professors can delete comunicados files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'comunicados' AND (SELECT get_user_role(auth.uid())) = 'professor');
