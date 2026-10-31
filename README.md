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

## Estrutura do repositório

```text
ObservaSRS/
|-- .github/
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

- Node.js 22 ou superior (22.12 ou superior para os testes)
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

O super administrador tambem pode desativar e reativar contas ja aprovadas, com revogacao
das sessoes anteriores. O fluxo e as protecoes estao em [docs/gestao-contas.md](docs/gestao-contas.md).

Consulte [backend/README.md](backend/README.md) para ver os demais comandos.

O passo a passo completo do PostgreSQL, pgAdmin, Prisma e Swagger está em
[docs/configuracao-postgresql.md](docs/configuracao-postgresql.md).

### Testes de Login

Na pasta `backend/`, execute:

```powershell
npm ci
npm test
```

A bateria utiliza Vitest e Supertest e apresenta exatamente cinco testes de login,
sessão e permissões administrativas. O Prisma é simulado, permitindo executar os testes
sem iniciar a API ou conectar ao PostgreSQL.

O relatório HTML é gerado em `backend/reports/tests/index.html` e pode ser aberto diretamente
no navegador. Os arquivos gerados não são incluídos no Git.

Consulte [docs/testes-login.md](docs/testes-login.md) para ver os cenários e as instruções completas.

### Setores e Indicadores

O backend possui cadastro, listagem e consulta por ID de setores e indicadores nas rotas
`/admin/setores` e `/admin/indicadores`. O acesso exige uma conta `ADMIN` ou `SUPER_ADMIN`
aprovada e ativa. Um indicador pertence a um setor existente e ativo.

Para atualizar um banco já configurado, execute `npm run db:deploy` na pasta `backend/`.
Os endpoints estão documentados no Swagger. Veja o passo a passo em
[docs/setores-indicadores.md](docs/setores-indicadores.md).

### Fontes e Registros de Indicadores

As rotas `/admin/fontes-dados` e `/admin/registros-indicadores` permitem cadastrar e consultar
a origem dos dados e os valores dos indicadores por período. O acesso segue as mesmas
permissões administrativas dos cadastros de setores e indicadores.

Os registros possuem valor decimal, data de referência e estado de publicação, com filtros
por indicador, fonte, setor, intervalo de datas e publicação. Consulte os exemplos em
[docs/fontes-registros-indicadores.md](docs/fontes-registros-indicadores.md).

Os quatro cadastros tambem possuem edicao parcial por `PATCH`. Setores e indicadores podem
ser ativados ou desativados, e registros possuem uma rota especifica para publicar ou
despublicar. Consulte [docs/edicao-publicacao.md](docs/edicao-publicacao.md) para ver os exemplos
e as regras de acesso. As rotas `/admin` permanecem protegidas.

### Consulta Publica

As rotas `/setores`, `/indicadores` e `/registros-indicadores` permitem consultar os dados
sem login, com listagem paginada e consulta por ID. Somente registros publicados, vinculados
a indicadores e setores ativos, ficam visiveis. Os filtros e exemplos estao em
[docs/consulta-publica.md](docs/consulta-publica.md).

### Relatorios e PDFs

O backend permite cadastrar e editar relatorios, anexar PDFs de ate 10 MB e controlar
sua publicacao. Rascunhos e seus arquivos exigem sessao administrativa; relatorios publicados
possuem consulta e download sem login em `/relatorios`.

Depois de atualizar o projeto, execute `npm ci` e `npm run db:deploy` na pasta `backend/`.
Os arquivos ficam em armazenamento privado e persistente, por padrao em
`backend/storage/relatorios/`, fora do Git. Consulte [docs/relatorios-pdfs.md](docs/relatorios-pdfs.md)
para ver o fluxo no Swagger e os cuidados de backup.

### Inventario PIT e Coleta dos Estabelecimentos

O inventario permite cadastrar, editar, ativar, desativar e revisar itens turisticos
em `/admin/itens-pit`, com consulta publica dos ativos em `/itens-pit`.
Os prazos de revisao podem ser consultados pela equipe, sem notificacoes automaticas.
Veja [docs/inventario-pit.md](docs/inventario-pit.md).

O formulario de coleta envia dados mensais para `POST /api/coletas`. A equipe gerencia
estabelecimentos em `/admin/estabelecimentos` e corrige, aprova, rejeita e publica envios
em `/admin/coletas`. O resumo publico em `/coletas/resumo` mostra somente totais de
coletas aprovadas e publicadas, sem dados individuais. O fluxo esta em
[docs/estabelecimentos-coletas.md](docs/estabelecimentos-coletas.md).

Na pasta `backend/`, execute `npm run db:generate` e `npm run db:deploy` antes de iniciar
a API. Os novos endpoints e exemplos estao disponiveis no Swagger.

## Frontend

O frontend está localizado na pasta `frontend/` e utiliza React, TypeScript e Tailwind CSS.
A aplicação web ainda está em configuração. As instruções de execução ficarão em
[frontend/README.md](frontend/README.md).

## Links

- Protótipo no Figma: <https://poodle-zero-14367780.figma.site/>
- Quadro no Trello: (adicionar link)
