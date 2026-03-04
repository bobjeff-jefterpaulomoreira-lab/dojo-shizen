
-- Notifications table
CREATE TABLE public.notificacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'geral',
  professor_id UUID NOT NULL,
  destinatario_tipo TEXT NOT NULL DEFAULT 'todos',
  destinatario_filtro JSONB DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Notification reads (tracks which users have read which notifications)
CREATE TABLE public.notificacao_leituras (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  notificacao_id UUID NOT NULL REFERENCES public.notificacoes(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL,
  lida_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(notificacao_id, usuario_id)
);

-- Enable RLS
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacao_leituras ENABLE ROW LEVEL SECURITY;

-- Professors can manage notifications
CREATE POLICY "Professors can insert notificacoes"
ON public.notificacoes FOR INSERT TO authenticated
WITH CHECK (get_user_role(auth.uid()) = 'professor');

CREATE POLICY "Professors can read all notificacoes"
ON public.notificacoes FOR SELECT TO authenticated
USING (get_user_role(auth.uid()) = 'professor');

CREATE POLICY "Professors can delete notificacoes"
ON public.notificacoes FOR DELETE TO authenticated
USING (get_user_role(auth.uid()) = 'professor');

-- Students can read notifications targeted to them
CREATE POLICY "Students can read targeted notificacoes"
ON public.notificacoes FOR SELECT TO authenticated
USING (
  get_user_role(auth.uid()) = 'aluno'
  AND (
    destinatario_tipo = 'todos'
    OR (destinatario_tipo = 'unidade' AND destinatario_filtro->>'unidade_id' = get_user_unidade_id(auth.uid())::text)
    OR (destinatario_tipo = 'faixa' AND destinatario_filtro->>'faixa' = (SELECT faixa FROM public.usuarios WHERE id = auth.uid()))
    OR (destinatario_tipo = 'aluno' AND destinatario_filtro->>'aluno_id' = auth.uid()::text)
  )
);

-- Users can manage their own read receipts
CREATE POLICY "Users can insert own leituras"
ON public.notificacao_leituras FOR INSERT TO authenticated
WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Users can read own leituras"
ON public.notificacao_leituras FOR SELECT TO authenticated
USING (usuario_id = auth.uid());

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notificacoes;
