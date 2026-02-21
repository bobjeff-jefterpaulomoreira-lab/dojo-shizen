
-- Create unidades table
CREATE TABLE public.unidades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE
);

ALTER TABLE public.unidades ENABLE ROW LEVEL SECURITY;

-- Seed units
INSERT INTO public.unidades (nome) VALUES ('Rochedo'), ('Sion');

-- Create usuarios table (linked to auth.users)
CREATE TABLE public.usuarios (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'aluno' CHECK (role IN ('aluno', 'professor')),
  unidade_id UUID NOT NULL REFERENCES public.unidades(id),
  faixa TEXT NOT NULL DEFAULT 'Branca',
  progresso_faixa INTEGER NOT NULL DEFAULT 0 CHECK (progresso_faixa >= 0 AND progresso_faixa <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Create presencas table
CREATE TABLE public.presencas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aluno_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  unidade_id UUID NOT NULL REFERENCES public.unidades(id),
  presente BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.presencas ENABLE ROW LEVEL SECURITY;

-- Create avaliacoes table
CREATE TABLE public.avaliacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aluno_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  tecnica TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'nao_iniciado' CHECK (status IN ('aprovado', 'acompanhamento', 'nao_iniciado')),
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;

-- Create aulas table for QR code sessions
CREATE TABLE public.aulas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professor_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  unidade_id UUID NOT NULL REFERENCES public.unidades(id),
  token TEXT NOT NULL UNIQUE,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.aulas ENABLE ROW LEVEL SECURITY;

-- Helper functions (SECURITY DEFINER to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.usuarios WHERE id = _user_id
$$;

CREATE OR REPLACE FUNCTION public.get_user_unidade_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT unidade_id FROM public.usuarios WHERE id = _user_id
$$;

-- RLS Policies for unidades
CREATE POLICY "Authenticated users can read unidades"
ON public.unidades FOR SELECT TO authenticated USING (true);

-- RLS Policies for usuarios
CREATE POLICY "Users can read own profile"
ON public.usuarios FOR SELECT TO authenticated
USING (id = auth.uid());

CREATE POLICY "Professors can read students in their unit"
ON public.usuarios FOR SELECT TO authenticated
USING (
  public.get_user_role(auth.uid()) = 'professor'
  AND unidade_id = public.get_user_unidade_id(auth.uid())
);

CREATE POLICY "Users can update own profile"
ON public.usuarios FOR UPDATE TO authenticated
USING (id = auth.uid());

CREATE POLICY "Professors can update students in their unit"
ON public.usuarios FOR UPDATE TO authenticated
USING (
  public.get_user_role(auth.uid()) = 'professor'
  AND unidade_id = public.get_user_unidade_id(auth.uid())
  AND role = 'aluno'
);

-- RLS Policies for presencas
CREATE POLICY "Students can read own presencas"
ON public.presencas FOR SELECT TO authenticated
USING (aluno_id = auth.uid());

CREATE POLICY "Professors can read presencas of their unit"
ON public.presencas FOR SELECT TO authenticated
USING (
  public.get_user_role(auth.uid()) = 'professor'
  AND unidade_id = public.get_user_unidade_id(auth.uid())
);

CREATE POLICY "Students can insert own presenca"
ON public.presencas FOR INSERT TO authenticated
WITH CHECK (aluno_id = auth.uid());

CREATE POLICY "Professors can insert presencas for their unit"
ON public.presencas FOR INSERT TO authenticated
WITH CHECK (
  public.get_user_role(auth.uid()) = 'professor'
  AND unidade_id = public.get_user_unidade_id(auth.uid())
);

-- RLS Policies for avaliacoes
CREATE POLICY "Students can read own avaliacoes"
ON public.avaliacoes FOR SELECT TO authenticated
USING (aluno_id = auth.uid());

CREATE POLICY "Professors can read avaliacoes of their unit students"
ON public.avaliacoes FOR SELECT TO authenticated
USING (
  public.get_user_role(auth.uid()) = 'professor'
  AND (SELECT unidade_id FROM public.usuarios WHERE id = aluno_id) = public.get_user_unidade_id(auth.uid())
);

CREATE POLICY "Professors can insert avaliacoes for their unit students"
ON public.avaliacoes FOR INSERT TO authenticated
WITH CHECK (
  public.get_user_role(auth.uid()) = 'professor'
  AND (SELECT unidade_id FROM public.usuarios WHERE id = aluno_id) = public.get_user_unidade_id(auth.uid())
);

CREATE POLICY "Professors can update avaliacoes of their unit students"
ON public.avaliacoes FOR UPDATE TO authenticated
USING (
  public.get_user_role(auth.uid()) = 'professor'
  AND (SELECT unidade_id FROM public.usuarios WHERE id = aluno_id) = public.get_user_unidade_id(auth.uid())
);

-- RLS Policies for aulas
CREATE POLICY "Professors can manage their own aulas"
ON public.aulas FOR ALL TO authenticated
USING (professor_id = auth.uid());

CREATE POLICY "Students can read aulas of their unit"
ON public.aulas FOR SELECT TO authenticated
USING (unidade_id = public.get_user_unidade_id(auth.uid()));

-- Trigger to create usuario profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.usuarios (id, nome, email, role, unidade_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'aluno'),
    COALESCE(
      (NEW.raw_user_meta_data->>'unidade_id')::UUID,
      (SELECT id FROM public.unidades LIMIT 1)
    )
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_avaliacoes_updated_at
BEFORE UPDATE ON public.avaliacoes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
