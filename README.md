# 🥋 Shizen Dojo - Sistema de Gestão de Artes Marciais

Sistema web para gestão de academias de artes marciais, permitindo controle de alunos, registro de presença e acompanhamento de atividades em tempo real.

O projeto simula um ambiente real de Dojo, com fluxos práticos para administração e interação dos alunos.

---

## 🚀 Tecnologias Utilizadas

* **Frontend:** React.js com TypeScript
* **Build Tool:** Vite
* **Estilização:** Tailwind CSS
* **Componentes:** Shadcn/UI
* **Backend & Banco de Dados:** Supabase (PostgreSQL)

---

## 🛠️ Funcionalidades Principais

### 🛡️ Módulo Administrativo (Sensei)
* Cadastro e gerenciamento de alunos
* Geração de QR Code dinâmico para controle de presença
* Visualização básica de dados e organização de turmas

### 🥋 Módulo do Aluno
* Interface de acompanhamento
* Leitura de QR Code para registro de presença (entrada e saída)

---

## 🔄 Fluxo de Presença (QR Code)

O sistema implementa um fluxo completo de controle de presença:

1. O administrador gera um QR Code único para a aula  
2. O aluno realiza a leitura pela interface  
3. O sistema registra automaticamente a presença no banco de dados  

Este processo reduz a necessidade de controle manual e simula um cenário real de academias.

---

## 🔐 Acesso para Demonstração

O sistema possui autenticação e rotas protegidas. Para fins de teste, utilize:

- **Perfil Sensei**
  - Email: sensei@dojo.com  
  - Senha: sensei123  

- **Perfil Aluno**
  - Email: aluno@dojo.com  
  - Senha: aluno123  

> ⚠️ Credenciais destinadas exclusivamente para ambiente de demonstração, sem dados sensíveis.

---

## 💻 Como Rodar o Projeto

```bash
# Clone o repositório
git clone https://github.com/bobjeff-jefterpaulomoreira-lab/dojo-shizen.git

# Acesse a pasta
cd dojo-shizen

# Instale as dependências
npm install

# Execute o projeto
npm run dev
## 🌐 Acesse o projeto
Produção: https://shizen-dojo-web.vercel.app/
