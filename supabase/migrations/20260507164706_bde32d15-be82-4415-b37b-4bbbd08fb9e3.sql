
-- Mensalidades
CREATE TABLE public.mensalidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID NOT NULL,
  unidade_id UUID NOT NULL,
  mes_referencia DATE NOT NULL,
  valor NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pendente',
  data_pagamento DATE,
  forma_pagamento TEXT,
  observacao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (aluno_id, mes_referencia)
);
CREATE INDEX idx_mensalidades_unidade_mes ON public.mensalidades(unidade_id, mes_referencia);
CREATE INDEX idx_mensalidades_status ON public.mensalidades(status);

ALTER TABLE public.mensalidades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professors manage mensalidades"
  ON public.mensalidades FOR ALL
  TO authenticated
  USING (public.get_user_role(auth.uid()) = 'professor')
  WITH CHECK (public.get_user_role(auth.uid()) = 'professor');

CREATE TRIGGER mensalidades_updated_at
  BEFORE UPDATE ON public.mensalidades
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Despesas / receitas avulsas
CREATE TABLE public.despesas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unidade_id UUID NOT NULL,
  professor_id UUID NOT NULL,
  categoria TEXT NOT NULL,
  descricao TEXT,
  valor NUMERIC(10,2) NOT NULL DEFAULT 0,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  tipo TEXT NOT NULL DEFAULT 'despesa',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_despesas_unidade_data ON public.despesas(unidade_id, data);

ALTER TABLE public.despesas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professors manage despesas"
  ON public.despesas FOR ALL
  TO authenticated
  USING (public.get_user_role(auth.uid()) = 'professor')
  WITH CHECK (public.get_user_role(auth.uid()) = 'professor');

CREATE TRIGGER despesas_updated_at
  BEFORE UPDATE ON public.despesas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Config financeiro por unidade
CREATE TABLE public.config_financeiro (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unidade_id UUID NOT NULL UNIQUE,
  valor_mensalidade_padrao NUMERIC(10,2) NOT NULL DEFAULT 0,
  dia_vencimento INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.config_financeiro ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professors manage config_financeiro"
  ON public.config_financeiro FOR ALL
  TO authenticated
  USING (public.get_user_role(auth.uid()) = 'professor')
  WITH CHECK (public.get_user_role(auth.uid()) = 'professor');

CREATE TRIGGER config_financeiro_updated_at
  BEFORE UPDATE ON public.config_financeiro
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
