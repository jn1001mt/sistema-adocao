# 🐾 Sistema de Gerenciamento de Animais para Adoção (AdotaPet)

Sistema web completo para gerenciamento e acolhimento de animais para adoção, desenvolvido com **HTML5, CSS3, JavaScript Vanilla, Node.js, Express e MySQL**.

> 🔒 **Execução 100% Local**: Este projeto foi construído para rodar estritamente no seu computador (`localhost`), sem envio de dados ou publicação na internet.

---

## 📋 Sumário
1. [Visão Geral da Arquitetura](#-visão-geral-da-arquitetura)
2. [Estrutura do Projeto](#-estrutura-do-projeto)
3. [Requisitos do Sistema](#-requisitos-do-sistema)
4. [Passo a Passo de Instalação e Execução](#-passo-a-passo-de-instalação-e-execução)
5. [Configuração do Banco de Dados](#-configuração-do-banco-de-dados)
6. [Variáveis de Ambiente (.env)](#-variáveis-de-ambiente-env)
7. [Iniciando a Aplicação](#-iniciando-a-aplicação)
8. [Como Acessar o Sistema](#-como-acessar-o-sistema)
9. [Regras de Negócio Implementadas](#-regras-de-negócio-implementadas)
10. [Documentação da API REST](#-documentação-da-api-rest)
11. [Testes Automatizados](#-testes-automatizados)

---

## 🏛️ Visão Geral da Arquitetura

O sistema é dividido em três camadas bem definidas:

- **Frontend (Vanilla JS)**: Páginas HTML sem frameworks externos (sem React, Vue ou Angular), estilização moderna em CSS3 com tema de proteção animal, design responsivo, sistema de notificações Toast e modais interativos.
- **Backend (Node.js + Express)**: API RESTful modularizada no padrão MVC/Camadas (Rotas, Controllers, Services e Configurações de Banco de Dados), com validações completas e tratamento de erros.
- **Banco de Dados (MySQL)**: Banco relacional `adocao_animais` com integridade referencial por Chave Estrangeira, índices de consulta e controle estrito de concorrência com **Transações ACID** (`BEGIN TRANSACTION`, `COMMIT`, `ROLLBACK` e `FOR UPDATE`).

---

## 📁 Estrutura do Projeto

```text
sistema-adocao/
│
├── frontend/                     # Interface do usuário (100% Vanilla JS)
│   ├── index.html                # Dashboard com métricas dinâmicas e atalhos
│   ├── animais.html              # Listagem, busca por nome e múltiplos filtros
│   ├── cadastrar-animal.html     # Formulário de acolhimento de animal
│   ├── editar-animal.html        # Edição de dados cadastrais
│   ├── adocoes.html              # Histórico de adoções formalizadas
│   ├── cadastrar-adocao.html     # Registro de adoção com confirmação visual
│   │
│   ├── css/
│   │   └── style.css             # Estilos responsivos, modais, toasts e tema
│   │
│   └── js/
│       ├── api.js                # Cliente centralizado da API e utilitários
│       ├── dashboard.js          # Lógica da tela inicial
│       ├── animais.js            # Tabela, filtros, modal e exclusão
│       ├── cadastrar-animal.js   # Validação e cadastro de animais
│       ├── editar-animal.js      # Carregamento e atualização
│       ├── adocoes.js            # Histórico de adoções
│       └── cadastrar-adocao.js   # Confirmação visual e envio transacional
│
├── backend/                      # Servidor e API REST
│   ├── server.js                 # Ponto de entrada do Express e estáticos
│   ├── package.json              # Dependências e scripts npm
│   ├── .env                      # Variáveis de ambiente (não versionado)
│   ├── .env.example              # Modelo de variáveis de ambiente
│   ├── test-api.js               # Bateria de testes automatizados ponta a ponta
│   │
│   ├── config/
│   │   ├── database.js           # Pool de conexões MySQL (mysql2/promise)
│   │   └── init-db.js            # Script automatizado de criação/recriação do banco
│   │
│   ├── routes/
│   │   ├── animais.js            # Rotas para /animais
│   │   └── adocoes.js            # Rotas para /adocoes
│   │
│   ├── controllers/
│   │   ├── animaisController.js  # Validações HTTP e respostas
│   │   └── adocoesController.js  # Validações de adoção
│   │
│   └── services/
│       ├── animaisService.js     # Regras de animais e queries SQL parametrizadas
│       └── adocoesService.js     # Transações bancárias e validações de negócio
│
├── database/
│   └── schema.sql                # Script DDL com tabelas, chaves e dados de teste
│
├── .gitignore                    # Arquivos ignorados pelo Git
└── README.md                     # Documentação completa do projeto
```

---

## 💻 Requisitos do Sistema

- **Node.js**: Versão 16.x ou superior (Recomendado v18 LTS ou superior).
- **MySQL**: Versão 8.0 ou MariaDB 10.x instalado localmente (ex: Laragon, XAMPP, MySQL Server ou Docker local).
- **Navegador**: Qualquer navegador moderno (Google Chrome, Firefox, Microsoft Edge, Opera).

---

## 🚀 Passo a Passo de Instalação e Execução

### 1. Clonar ou Abrir a Pasta do Projeto
Abra o terminal na pasta onde o projeto está localizado:
```powershell
cd C:\Users\Aluno\.gemini\antigravity\scratch\sistema-adocao
```

### 2. Instalar as Dependências do Backend
Navegue até a pasta `backend` e execute o instalador do npm:
```powershell
cd backend
npm install
```

---

## 🗄️ Configuração do Banco de Dados

### Opção A: Inicialização Automática via Node.js (Mais Fácil e Recomendada)
O projeto conta com um script nativo que lê o arquivo `database/schema.sql` e configura o MySQL com suporte completo a caracteres UTF-8:
```powershell
# Estando dentro da pasta 'backend':
npm run init-db
```

### Opção B: Execução Manual do Arquivo SQL no MySQL
Caso prefira executar manualmente pelo cliente MySQL:
```sql
mysql -u root -p < database/schema.sql
```
Ou abra o arquivo `database/schema.sql` em ferramentas visuais como **MySQL Workbench**, **HeidiSQL** ou **DBeaver** e execute todo o script.

---

## ⚙️ Variáveis de Ambiente (.env)

Dentro da pasta `backend/`, foi criado o arquivo `.env`. Caso deseje ajustar as credenciais do seu banco de dados local:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=adocao_animais
DB_PORT=3306
PORT=3000
```

> **Aviso de Segurança**: O arquivo `.env` está configurado no `.gitignore` e não deve ser compartilhado nem exposto publicamente.

---

## ▶️ Iniciando a Aplicação

Dentro da pasta `backend/`, inicie o servidor:

```powershell
npm start
```

Ou em modo de desenvolvimento com auto-reload:
```powershell
npm run dev
```

Você verá no terminal:
```text
🔄 Iniciando Sistema de Adoção de Animais...
 Conectado com sucesso ao MySQL!
 Servidor rodando com sucesso na porta 3000
 Acesse a aplicação em: http://localhost:3000
 API Animais: http://localhost:3000/animais
 API Adoções: http://localhost:3000/adocoes
```

---

## 🌐 Como Acessar o Sistema

Basta abrir o navegador web de sua preferência no endereço:

👉 **[http://localhost:3000](http://localhost:3000)**

Pelo menu superior você poderá navegar entre:
1. **Dashboard** (`/` ou `/index.html`): Cards com totais dinâmicos de animais acolhidos, disponíveis, adotados e adoções realizadas, além de ações de acesso rápido.
2. **Animais** (`/animais.html`): Lista com busca por nome, filtros combinados (Espécie, Status, Porte), botão de visualização em modal, edição, exclusão segura e atalho direto para adotar.
3. **Cadastrar Animal** (`/cadastrar-animal.html`): Cadastro de novos acolhidos com validações de campos e status automático "Disponível".
4. **Adoções** (`/adocoes.html`): Tabela com histórico detalhado e contatos dos adotantes.
5. **Registrar Adoção** (`/cadastrar-adocao.html`): Formulário onde só aparecem animais disponíveis, com tela de confirmação prévia antes de formalizar.

---

## 🔒 Regras de Negócio Implementadas

1. **Apenas animais disponíveis podem ser adotados**: A listagem de seleção do cadastro de adoção carrega apenas registros com `status = 'Disponível'`.
2. **Integridade via Transação no Banco de Dados**: A adoção ocorre dentro de uma transação MySQL segura:
   - Inicia a transação (`connection.beginTransaction()`).
   - Bloqueia e consulta o animal (`SELECT ... FOR UPDATE`).
   - Valida se o animal existe e está `Disponível`.
   - Insere o registro em `adocoes`.
   - Altera automaticamente o animal para `Adotado`.
   - Confirma a operação com `connection.commit()`.
   - Se qualquer passo falhar, reverte com `connection.rollback()`.
3. **Bloqueio de duplicidade**: Tentativas de adotar um animal já adotado retornam imediatamente código HTTP 400.
4. **Proteção de status**: O formulário de edição de animais não permite mudar o status manualmente para "Adotado"; isso só é permitido via fluxo formal de adoção.
5. **Exclusão Segura**: Animais que possuem histórico de adoção vinculados não podem ser excluídos, preservando a integridade das tabelas relacionais.

---

## 📡 Documentação da API REST

### Animais

#### `GET /animais`
Retorna todos os animais cadastrados. Suporta filtros por query parameters:
- `?status=Disponível` ou `?status=Adotado`
- `?especie=Cachorro` ou `?especie=Gato`
- `?porte=Pequeno`, `?porte=Médio`, `?porte=Grande`
- `?busca=nome`

#### `GET /animais/:id`
Retorna os dados do animal pelo ID. Retorna HTTP 404 caso não exista.

#### `POST /animais`
Cadastra um novo animal. O status é automaticamente definido como `Disponível`.

**Corpo da Requisição (JSON):**
```json
{
  "nome": "Rex",
  "especie": "Cachorro",
  "raca": "Caramelo",
  "idade": 3,
  "porte": "Médio"
}
```

**Resposta de Sucesso (HTTP 201 Created):**
```json
{
  "id": 1,
  "nome": "Rex",
  "especie": "Cachorro",
  "raca": "Caramelo",
  "idade": 3,
  "porte": "Médio",
  "status": "Disponível"
}
```

#### `PUT /animais/:id`
Atualiza dados cadastrais do animal (nome, espécie, raça, idade, porte).

#### `DELETE /animais/:id`
Remove um animal pelo identificador (caso não tenha histórico de adoções).

---

### Adoções

#### `GET /adocoes`
Retorna o histórico de todas as adoções com os dados do animal vinculado.

**Exemplo de Resposta (HTTP 200 OK):**
```json
[
  {
    "id": 1,
    "nome_adotante": "Maria Silva",
    "telefone": "(83) 99999-9999",
    "email": "maria@email.com",
    "id_animal": 1,
    "animal": "Rex",
    "especie_animal": "Cachorro",
    "data_adocao": "2026-09-29"
  }
]
```

#### `POST /adocoes`
Registra uma nova adoção e atualiza atomicamente o animal para "Adotado".

**Corpo da Requisição (JSON):**
```json
{
  "nome_adotante": "Maria Silva",
  "telefone": "(83) 99999-9999",
  "email": "maria@email.com",
  "id_animal": 2
}
```

**Resposta de Sucesso (HTTP 201 Created):**
```json
{
  "id": 4,
  "nome_adotante": "Maria Silva",
  "telefone": "(83) 99999-9999",
  "email": "maria@email.com",
  "id_animal": 2,
  "animal": "Luna",
  "mensagem": "Adoção registrada com sucesso."
}
```

---

### Estatísticas do Dashboard

#### `GET /animais/estatisticas`
Retorna os contadores consolidados em tempo real para os cards da tela inicial:
```json
{
  "totalAnimais": 9,
  "animaisDisponiveis": 6,
  "animaisAdotados": 3,
  "totalAdocoes": 3
}
```

---

## 🧪 Testes Automatizados

O projeto inclui uma suíte automatizada completa em `backend/test-api.js` que testa:
1. Obtenção de estatísticas da dashboard.
2. Cadastro de animal com status automático 'Disponível'.
3. Consulta por ID.
4. Atualização via PUT.
5. Exclusão via DELETE.
6. Registro de adoção transacional.
7. Atualização atômica do status para 'Adotado'.
8. Bloqueio de adoção duplicada (HTTP 400).
9. Bloqueio de adoção de animal inexistente (HTTP 404).
10. Consulta à lista de histórico de adoções com JOIN de animal.
11. Atualização dos indicadores consolidados.

Para rodar a suíte a qualquer momento:
```powershell
cd backend
npm test
```

---

## 🛡️ Garantias e Boas Práticas Adotadas

- **Queries Parametrizadas**: Todas as consultas utilizam prepared statements (`?`), eliminando qualquer risco de SQL Injection.
- **Transações Seguras**: Operações críticas de escrita utilizam transações com `FOR UPDATE` e bloco `try/catch/finally` para fechamento de conexões.
- **Validação Dupla**: Dados são validados tanto no frontend (UX imediata) quanto no backend (segurança mandatória).
- **Sem Dependências Externas na Nuvem**: O CSS e JS são 100% locais; fontes e ícones utilizam fallbacks do sistema e emojis universais que funcionam offline.
