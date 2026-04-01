

## Auditoria Completa E2E - Dojo Shizen

### Problemas Encontrados

---

#### 1. BUG DE BUILD (Bloqueante)

**Arquivo:** `supabase/functions/register-student/index.ts` (linha 83)
- `err` tipado como `unknown` no catch, mas acessa `.message` diretamente
- **Correção:** Usar `(err as Error).message` ou `String(err)`

---

#### 2. BUGS DE LOGICA

**a) QRCodePage.tsx (linha 148)** - Usa `.single()` ao buscar aula existente, o que lanca erro se nenhuma aula for encontrada (deveria ser `.maybeSingle()`)

**b) AttendanceReport.tsx (linhas 64-71)** - Query usa `usuarios!inner(nome, faixa)` como join na tabela `presencas`, mas `presencas` nao tem foreign key para `usuarios` no schema gerado. Isso pode falhar silenciosamente dependendo de como o PostgREST resolve a relacao. Funciona porque existe FK `presencas_aluno_id_fkey` referenciando `usuarios`, mas o alias `usuarios!inner` depende do PostgREST inferir isso corretamente -- fragil.

**c) NotificationBell.tsx** - Busca TODAS as notificacoes sem filtro de destinatario. Alunos veem contagem de notificacoes que nao sao para eles (RLS filtra no banco, mas a logica de contagem no front assume que tudo retornado e relevante -- isso funciona CORRETAMENTE gracas ao RLS, porem depende totalmente do RLS estar configurado certo).

**d) StudentDashboard.tsx (linha 52)** - `unreadCount` usa a contagem de comunicados como badge de notificacoes, o que e semanticamente incorreto (mostra quantidade de comunicados recentes, nao notificacoes nao lidas).

**e) Assessment.tsx (linha 151)** - Usa `as any` para inserir avaliacao, contornando tipagem. A tabela `avaliacoes` nao tem campo `categoria`, mas o filtro tenta acessar `(av as any).categoria`. Filtro de categoria nunca funciona corretamente.

---

#### 3. SEGURANCA

**a) `usuarios` tabela sem INSERT policy** - A criacao de usuarios depende exclusivamente do trigger `handle_new_user`. Se o trigger falhar, o usuario fica sem perfil. Nao ha policy de INSERT para auto-criacao, o que e correto para seguranca, mas nao ha fallback.

**b) `comunicados` RLS usa `{public}` em vez de `{authenticated}`** - Permite que usuarios anonimos potencialmente acessem se tiverem o anon key (embora `get_user_role` retornaria null para anonimos, e seguro mas nao e best practice).

**c) Exclusao de alunos (`StudentList.tsx`)** - Exclui da tabela `usuarios` mas NAO exclui o usuario do auth.users. O usuario continua existindo no auth e pode relogar, porem sem perfil, causando erro.

---

#### 4. ARQUITETURA / QUALIDADE DE CODIGO

**a) Dados duplicados em constantes** - `TECNICAS_POR_CATEGORIA` esta duplicado em `Assessment.tsx` e `Evolution.tsx` com formatos diferentes (um com array de strings, outro com objetos `{nome, desc}`). Deveria ser um unico arquivo compartilhado.

**b) `BELT_COLORS` definido em 4 arquivos** (`StudentDashboard.tsx`, `Assessment.tsx`, `Evolution.tsx`, `StudentList.tsx`) com valores ligeiramente diferentes.

**c) Tipo `Usuario` definido manualmente** em `auth.tsx` em vez de usar os tipos gerados do Supabase.

**d) `useEffect` sem dependencias corretas** - `RegisterStudent.tsx` (linha 35) e `NotificationBell.tsx` com `fetchCount` nao estavel.

**e) `as any` casts excessivos** - Em `Assessment.tsx`, `AttendanceReport.tsx`, `Notificacoes.tsx`.

---

#### 5. UI/UX

**a) Responsividade do MobileLayout** - O `BottomNav` tem `max-w-[430px]` no mobile mas o conteudo usa `fullWidth`, criando desalinhamento visual onde o nav e mais estreito que o conteudo.

**b) Falta de loading states** - `Assessment.tsx`, `StudentList.tsx`, `Notificacoes.tsx` nao mostram skeleton/spinner enquanto carregam dados.

**c) Falta de reset de password** - Nao existe fluxo de recuperacao de senha.

---

### Plano de Correcoes (por prioridade)

**Passo 1 - Fix Build Error**
- Corrigir `err.message` em `register-student/index.ts` para `(err as Error).message`

**Passo 2 - Corrigir .single() para .maybeSingle()**
- `QRCodePage.tsx` linha 148: trocar `.single()` por `.maybeSingle()`

**Passo 3 - Extrair constantes compartilhadas**
- Criar `src/lib/constants.ts` com `BELT_COLORS` e `TECNICAS_POR_CATEGORIA` unificados
- Atualizar imports em todos os arquivos que usam essas constantes

**Passo 4 - Corrigir badge do StudentDashboard**
- Usar contagem real de notificacoes nao lidas em vez de contagem de comunicados

**Passo 5 - Corrigir filtro de categoria no Assessment**
- Armazenar categoria junto com a avaliacao ou extrair da tecnica selecionada

**Passo 6 - Adicionar loading states**
- Adicionar skeletons em `Assessment.tsx`, `StudentList.tsx`, `Notificacoes.tsx`

**Passo 7 - Melhorar RLS policies**
- Trocar `{public}` por `{authenticated}` nas policies de `comunicados` e `documentos`

**Passo 8 - Corrigir BottomNav width**
- Remover `max-w-[430px]` do BottomNav quando `fullWidth` e usado

