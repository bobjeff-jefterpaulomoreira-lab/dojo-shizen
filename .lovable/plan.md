# Plano: Área Financeira do Sensei

Módulo simples de controle financeiro, acessível **apenas pelo professor**. Nada do app do aluno é alterado — sem mudanças em dashboard, check-in, QR, avaliações ou notificações.

## O que o Sensei poderá fazer

1. **Mensalidades dos alunos**
   - Definir o valor mensal por aluno (ou um valor padrão da unidade)
   - Marcar pagamentos como **Pago / Pendente / Atrasado**
   - Registrar data de pagamento, forma (Pix, dinheiro, cartão) e observação
   - Ver lista mensal: quem pagou, quem está em atraso

2. **Despesas da academia**
   - Cadastrar despesas (aluguel, equipamentos, eventos, etc.) com categoria, valor e data
   - Cadastrar outras receitas avulsas (uniformes, exames de faixa, eventos)

3. **Relatório financeiro**
   - Resumo do mês: receita total, despesas, saldo
   - Gráfico simples de receita x despesa (últimos 6 meses)
   - Lista de inadimplentes
   - Exportar em CSV/PDF

## Onde ficará no app

Nova aba/card no dashboard do Sensei: **"Financeiro"** → leva para `/sensei/financeiro` com 3 sub-páginas:
- `/sensei/financeiro` (visão geral + gráficos)
- `/sensei/financeiro/mensalidades` (lista de alunos + status do mês)
- `/sensei/financeiro/despesas` (CRUD de despesas/receitas)

A `BottomNav` do professor já tem 5 itens; o acesso ficará pelo dashboard (card) para não sobrecarregar a navegação. Layout segue o padrão japonês existente (vermelho #8B0000, cards translúcidos, `pb-24`).

## Mudanças no banco (3 tabelas novas, isoladas)

```text
mensalidades
  id, aluno_id, unidade_id, mes_referencia (date),
  valor, status (pago|pendente|atrasado),
  data_pagamento, forma_pagamento, observacao, created_at

despesas
  id, unidade_id, categoria, descricao, valor,
  data, tipo (despesa|receita_avulsa), created_at, professor_id

config_financeiro
  id, unidade_id, valor_mensalidade_padrao, dia_vencimento
```

**RLS estrita**: somente `get_user_role(auth.uid()) = 'professor'` pode SELECT/INSERT/UPDATE/DELETE nas 3 tabelas. Aluno **não tem nenhum acesso** — não vê valores, não vê status próprio (a menos que você queira no futuro). Nada do schema atual é alterado.

## Garantias de não-quebra

- Nenhum arquivo existente é modificado, exceto:
  - `src/pages/TeacherDashboard.tsx`: adicionar 1 card "Financeiro" (sem mexer no grid 2x2 frozen — adicionado abaixo dele)
  - `src/App.tsx`: registrar 3 rotas novas
- Dashboard do aluno, BottomNav do aluno, QR, presenças, avaliações, notificações: **intocados**
- Nenhuma migração altera tabelas existentes — só cria novas
- Tipos do Supabase regeneram automaticamente sem afetar telas atuais

## Fora do escopo (pode entrar depois)

- Geração automática de cobrança mensal (cron)
- Integração com Pix/cartão real (Paddle/Stripe)
- Notificação push de vencimento ao aluno
- Tela do aluno mostrando seu próprio histórico financeiro

## Arquivos a criar

- `supabase/migrations/<timestamp>_financeiro.sql`
- `src/pages/Financeiro/Overview.tsx`
- `src/pages/Financeiro/Mensalidades.tsx`
- `src/pages/Financeiro/Despesas.tsx`
- `src/lib/financeiro.ts` (helpers de cálculo + export CSV)

Aprovando, eu implemento o schema + as 3 telas + o card no dashboard do Sensei.
