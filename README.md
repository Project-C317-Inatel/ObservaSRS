# ObservaSRS

Plataforma web desenvolvida para o Observatório do Turismo de Santa Rita do Sapucaí (OT-SRS), em parceria com a Secretaria Municipal de Cultura, Esporte, Lazer e Turismo (SMCELT). O sistema disponibiliza indicadores turísticos, relatórios e visualizações de dados, além de funcionalidades administrativas para gerenciamento das informações utilizadas pelo observatório.

## Equipe

Breno Carvalho · Lilyan Oliveira · Lucas David · Rodrigo Armengol

INATEL | C317 | 2026.2

## Funcionalidades

**Escopo essencial**

- Indicadores turísticos (hospedagem, leitos, empresas e empregos)
- Relatórios públicos em PDF
- Dashboard visual com gráficos e cards
- Filtros por período e setor
- Painel administrativo

**Desejável**

- Coleta autônoma de dados por estabelecimentos, com validação da SMCELT
- Painel informativo Cadastur e FNRH Digital
- Módulo de Inventário Turístico (PIT)

## Tecnologias

| Camada       | Tecnologias                       |
| ------------ | --------------------------------- |
| Frontend     | React, TypeScript, Tailwind CSS   |
| Backend      | Node.js, Express, TypeScript, Zod |
| Persistência | PostgreSQL, Prisma                |
| Automação    | GitHub Actions                    |

## Estrutura do repositório

```text
ObservaSRS/
|-- .github/
|   |-- workflows/ci.yml
|   `-- pull_request_template.md
|-- docs/
|   |-- milestones/
|   |-- diagramas/
|   `-- proposta/
|-- frontend/
|   |-- public/
|   `-- src/
|       |-- assets/
|       |-- components/
|       |   |-- layout/
|       |   `-- ui/
|       |-- features/
|       |-- pages/
|       |-- services/
|       `-- types/
|-- backend/   API e persistência
|-- .gitignore
`-- README.md
```

As duas aplicações são independentes. Cada pasta possui suas próprias dependências e instruções,
evitando que o desenvolvimento do frontend e do backend interfiram um no outro.

## Backend

### Requisitos

- Node.js 22 ou superior
- npm 10 ou superior
- PostgreSQL local

### Executar a API

```powershell
cd backend
npm ci
Copy-Item .env.example .env
npm run db:setup
npm run dev
```

Antes de executar `db:setup`, crie o banco `observasrs` no PostgreSQL e configure a senha local
em `backend/.env`. O comando também prepara o primeiro super administrador, responsável por aprovar
ou rejeitar as solicitações de acesso da equipe da SMCELT.

A API ficará disponível em `http://localhost:3333`. Para confirmar que o ambiente está
funcionando, acesse `GET http://localhost:3333/status`.

### Usar o Swagger

1. Prepare o banco e inicie a API:

   ```powershell
   cd backend
   npm run db:setup
   npm run dev
   ```

2. Abra `http://localhost:3333/docs` no navegador.
3. Expanda uma rota, clique em **Try it out**, preencha os campos e clique em **Execute**.
4. Comece por `GET /status` para confirmar que a API está funcionando.
5. Use `POST /auth/registro` para criar uma solicitação de acesso.
6. Use `POST /auth/login` com o super administrador configurado no `.env`.
7. Depois do login, teste as rotas `/admin/solicitacoes` para listar, aprovar ou rejeitar contas.

O login grava a sessão automaticamente em um cookie `HttpOnly`. Não é necessário copiar um token
ou preencher manualmente o botão **Authorize**.

Consulte [backend/README.md](backend/README.md) para ver os demais comandos.

O passo a passo completo do PostgreSQL, pgAdmin, Prisma e Swagger está em
[docs/configuracao-postgresql.md](docs/configuracao-postgresql.md).

## Frontend

O frontend está localizado na pasta `frontend/` e utiliza React, TypeScript e Tailwind CSS.
A aplicação web ainda está em configuração. As instruções de execução ficarão em
[frontend/README.md](frontend/README.md).

## Links

- Protótipo no Figma: <https://poodle-zero-14367780.figma.site/>
- Quadro no Trello: (adicionar link)
