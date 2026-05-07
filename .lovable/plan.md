## Diagnóstico — Verificação do App

### O que está funcionando bem
- **Banco de dados saudável**: 5 usuários (1 sensei + 4 alunos), 78 aulas no histórico, 6 presenças registradas. Sem erros recentes nos logs do Postgres ou de autenticação.
- **Multi-unidade**: 2 unidades com alunos distribuídos. Cross-unit check-in funcionando após últimas correções.
- **PWA / Frontend**: Sem erros no console (apenas warning interno do Lovable, irrelevante).
- **Fluxo de QR Code**: Lógica de check-in/check-out por toggle e fechamento automático no `fecharAula` está correta.

### Pontos de atenção encontrados
1. **Não há aulas ativas no momento** (todas as 78 aulas estão expiradas). Esperado fora do horário de treino.
2. **Findings de segurança críticos pendentes** — apesar de termos corrigido recentemente, o scanner ainda aponta:
   - `PRIVILEGE_ESCALATION` — política de UPDATE em `usuarios` ainda permite que aluno mude `role`/`unidade_id`/`faixa` no nível RLS (o trigger bloqueia, mas a policy continua permissiva — defesa em profundidade falhando).
   - `EXPOSED_SENSITIVE_DATA` — bucket `documentos` ainda marcado como público (a migration anterior não chegou a torná-lo private de fato, ou o flag não pegou).
   - `REALTIME_MISSING_AUTHORIZATION` — qualquer usuário autenticado pode escutar todas as mudanças de `presencas` e `notificacoes` via Realtime, vazando presenças e notificações de outros alunos.
   - `MISSING_STORAGE_UPDATE_POLICY` — sem política UPDATE no bucket `documentos`.
3. **Linter Supabase**: 9 funções `SECURITY DEFINER` executáveis por anon/authenticated sem necessidade + Leaked Password Protection desabilitado.

---

## Plano de correções

### 1. Travar privilege escalation no nível RLS (não só trigger)
Substituir a policy `Users can update own profile` em `public.usuarios` por uma policy que bloqueie alteração de `role`, `unidade_id` e `faixa` por alunos via `WITH CHECK` comparando com a linha existente (usando `has_role` para permitir professor).

### 2. Tornar bucket `documentos` privado de verdade
- `UPDATE storage.buckets SET public = false WHERE id = 'documentos'`
- Adicionar policy de UPDATE no bucket (dono ou professor).
- Validar que `MeusDocumentos.tsx` já usa signed URLs (já está, conforme última iteração).

### 3. Restringir Realtime de `presencas` e `notificacoes`
Criar políticas RLS em `realtime.messages` para que cada usuário só receba broadcasts dos próprios registros:
- `presencas`: filtrar por `aluno_id = auth.uid()` (professor recebe tudo).
- `notificacoes`: filtrar por `usuario_id = auth.uid()` ou `usuario_id IS NULL` (broadcast geral).

### 4. Reduzir superfície de SECURITY DEFINER
Revogar `EXECUTE` em funções `SECURITY DEFINER` do schema `public` para `anon` (e para `authenticated` quando aplicável), mantendo apenas o necessário (ex: `has_role` precisa ser executável por authenticated).

### 5. Habilitar Leaked Password Protection
Ativar via configuração de auth do Cloud (`cloud--configure_auth`).

### 6. Atualizar `@security-memory`
Documentar as decisões e remover orientações obsoletas das iterações anteriores.

---

## Detalhes técnicos

- Migration única consolidando: nova policy UPDATE em `usuarios` com checagem coluna-a-coluna; `storage.buckets` private; políticas em `storage.objects` para UPDATE/DELETE no bucket documentos; políticas em `realtime.messages`; revogações de EXECUTE.
- Sem mudanças de código frontend necessárias (signed URLs já implementadas; queries de presença já filtram por `aluno_id`).
- Após aplicar, rodar `security--run_security_scan` para confirmar zero findings críticos.

## Fora do escopo
- Mudanças de UX no fluxo de QR/aula (já alinhado nas iterações anteriores).
- Novas features.
