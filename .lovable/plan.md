

## Plano: Adicionar Screenshots Reais do App na Landing Page

### Abordagem

Vou capturar screenshots das principais telas do app (Dashboard do Professor, QR Code, Lista de Alunos, Avaliações, etc.) usando as ferramentas do navegador, salvar como imagens estáticas no projeto, e incorporá-las na landing page dentro de mockups de celular — criando uma seção visual "Veja o app em ação".

### Etapas

1. **Capturar screenshots** das telas principais do app via browser tools:
   - Dashboard do Professor (`/teacher`)
   - Scan QR Code (`/scan-qr`)
   - Lista de Alunos (`/students`)
   - Calendário (`/calendario`)
   - Dashboard do Aluno (`/student`)

2. **Salvar as imagens** como assets no projeto (`src/assets/screenshots/`)

3. **Criar seção "Veja o App"** na landing page entre a seção de funcionalidades e os planos, com:
   - Carrossel ou grid de screenshots dentro de molduras de celular (CSS mockup)
   - Legendas descritivas para cada tela
   - Animações de entrada com framer-motion

4. **Também substituir** a imagem genérica do dojo na seção "Problema/Solução" por um screenshot real do app

### Resultado

A landing page terá prova visual real do produto, aumentando a confiança e conversão dos visitantes.

