

## Plano: Otimizar Landing Page com Screenshots Reais e Melhorias Visuais

### Situação Atual
A landing page já tem 5 screenshots e mockups com frame de celular. As melhorias a seguir vão elevar a qualidade visual e autenticidade.

### O que será feito

**1. Capturar screenshots reais do app**
- Usar o browser para navegar nas telas do app (dashboard professor, dashboard aluno, calendário, notificações, QR code, lista de alunos) e tirar prints reais
- Salvar como novos assets em `src/assets/screenshots/`
- Adicionar screenshots de telas que faltam: **Notificações** e **Dashboard do Professor**

**2. Melhorar apresentação visual dos mockups**
- Adicionar animação de **carousel/auto-rotate** nos screenshots secundários para mostrar mais telas em menos espaço
- Melhorar o efeito de sombra e reflexo nos frames de celular
- Adicionar **indicadores de navegação** (dots) abaixo do carousel

**3. Melhorias gerais na landing page**
- Adicionar **seção de contagem** (números animados): ex. "6 funcionalidades", "Controle total", "100% digital"
- Melhorar responsividade dos mockups em telas pequenas
- Otimizar lazy loading das imagens para performance

### Arquivos modificados
- `src/pages/LandingPage.tsx` — novas seções, carousel, screenshots adicionais
- `src/assets/screenshots/` — novos screenshots reais capturados do app

### Estimativa
~2-3 edições para capturar screenshots e atualizar o componente.

