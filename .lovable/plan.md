

## Fluxo de Check-in e Check-out via QR Code

Excelente ideia! Atualmente o QR Code só serve para **abrir a aula e registrar presença**. A proposta é adicionar um segundo momento: o **check-out**, onde o aluno escaneia novamente para registrar sua saída.

### Como funcionaria

1. **Sensei abre a aula** → QR Code é gerado (como já funciona)
2. **Aluno chega** → escaneia o QR → registra **check-in** (hora de entrada)
3. **Aula termina** → Sensei gera um novo QR de encerramento (ou mantém o mesmo)
4. **Aluno escaneia novamente** → registra **check-out** (hora de saída)
5. Se o aluno não fizer check-out, o sistema fecha automaticamente quando o sensei encerra a aula

### Mudanças necessárias

**Banco de dados:**
- Adicionar colunas `hora_entrada` e `hora_saida` na tabela `presencas`
- Adicionar coluna `status` na tabela `aulas` (aberta/fechada)

**Tela do Sensei (QRCodePage):**
- Botão "Encerrar Aula" que muda o status da aula
- O QR Code continua válido enquanto a aula estiver aberta
- Ao encerrar, alunos que não fizeram check-out recebem hora de saída automática

**Tela do Aluno (ScanQRCode):**
- Se o aluno já tem check-in naquela aula, o escaneamento registra check-out
- Feedback visual diferente: "Entrada registrada ✓" vs "Saída registrada ✓"

**Impressão:**
- O QR impresso continua funcionando para ambos os fluxos (entrada e saída)

### Benefícios
- Sensei não precisa dar baixa manual em cada aluno
- Registro de tempo de permanência na aula
- Aluno atrasado escaneia o QR impresso na academia e sai quando quiser

