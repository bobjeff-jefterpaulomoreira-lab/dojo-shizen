
## Situação Atual

O sistema de presença funciona assim:
- **Alunos**: Podem escanear QR Code para registrar presença e ver seu próprio relatório em `/presenca/relatorio`
- **Professores**: Podem gerar QR Code para aula, mas **não têm acesso visual** para verificar as presenças dos alunos

### Problema Identificado

Embora exista uma rota `/sensei/relatorio` que usa o componente `AttendanceReport`, este componente:
1. **Só mostra presenças do próprio usuário logado** (então professor veria apenas suas próprias presenças)
2. **Não há botão no painel do professor** para acessar relatórios de presença
3. **Não há navegação** para essa funcionalidade

## Solução Proposta

### 1. **Criar Página de Relatório de Presença para Professores**
- Modificar `AttendanceReport.tsx` para detectar se o usuário é professor
- Se for professor: mostrar presenças de **todos os alunos da unidade**
- Se for aluno: continuar mostrando apenas as próprias presenças

### 2. **Adicionar Navegação no Painel do Professor**
- Incluir botão "Relatório de Presença" no `TeacherDashboard.tsx`
- Adicionar ícone de calendário/relatório na navegação inferior (BottomNav)

### 3. **Funcionalidades do Relatório para Professor**
- **Lista de alunos** com presenças do mês atual
- **Navegação por mês** (já existe no componente)
- **Filtros por aluno** ou **status** (presente/ausente)
- **Estatísticas** de presença por aluno
- **Exportar dados** (opcional)

### Estrutura da Nova Funcionalidade

```text
/sensei/relatorio
├── Cabeçalho "Relatório de Presença"
├── Navegação de mês (◀ Março 2026 ▶)
├── Lista de alunos com presenças:
│   ├── João Silva - 18/20 presenças ✅
│   ├── Maria Santos - 15/20 presenças ✅
│   └── Pedro Costa - 8/20 presenças ❌
└── Detalhes por aluno (expandível)
```

### Alterações Necessárias

1. **`src/pages/AttendanceReport.tsx`**:
   - Detectar role do usuário
   - Query diferente para professor (buscar todos alunos da unidade)
   - Interface adaptada para mostrar múltiplos alunos

2. **`src/pages/TeacherDashboard.tsx`**:
   - Adicionar botão "Relatório de Presença"

3. **`src/components/BottomNav.tsx`**:
   - Considerar substituir uma das opções atuais por "Relatório"

### Query para Professor
```sql
SELECT p.*, u.nome as aluno_nome, u.faixa
FROM presencas p 
JOIN usuarios u ON p.aluno_id = u.id 
WHERE p.unidade_id = [professor_unidade_id]
AND p.data >= [start_of_month]
AND p.data <= [end_of_month]
ORDER BY u.nome, p.data
```

### Benefícios
- Professor pode **acompanhar frequência** dos alunos
- **Identificar alunos** com baixa presença
- **Relatórios mensais** organizados
- **Interface intuitiva** no mobile
