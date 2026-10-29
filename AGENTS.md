# AGENTS.md: ObservaSRS

Contexto permanente para agentes de código (Antigravity, Codex, Copilot, Claude). Leia este arquivo antes de qualquer tarefa. Ele vale para o monorepo inteiro (`backend/` e `frontend/`).

## 1. O projeto

Plataforma web do Observatório do Turismo de Santa Rita do Sapucaí (OT-SRS), feita para a SMCELT (Prefeitura) na disciplina C317 do Inatel, 2026.2. Público: gestores, empreendedores, pesquisadores e população. A fonte da verdade do escopo é a proposta da Prefeitura (Edital HEIComp 2026.2), resumida na seção 9.

Equipe de 4 pessoas. O frontend é de duas pessoas (design e componentes visuais de um lado, integração com a API e testes do outro). O backend é de outras pessoas. Não mexa na pasta que não é o foco da tarefa sem a spec pedir.

## 2. Stack e estrutura

| Camada                 | Tecnologias                                                                                                     |
| ---------------------- | --------------------------------------------------------------------------------------------------------------- |
| Frontend (`frontend/`) | React 19, TypeScript, Vite, Tailwind CSS v4, React Router 8, Vitest + Testing Library                           |
| Backend (`backend/`)   | Node 22+, Express 5, TypeScript (ESM), Zod 4, Prisma 7 + PostgreSQL, JWT em cookie HttpOnly, Vitest + Supertest |

```text
backend/
  prisma/            schema.prisma, migrations/, seed.ts
  src/
    app.ts, server.ts
    config/env.ts    variáveis de ambiente validadas com Zod
    docs/            openapi.ts + swagger.ts (Swagger em /docs)
    modules/<nome>/  <nome>.routes.ts, .controller.ts, .service.ts, .schemas.ts
    shared/          database/prisma.ts, errors/app-error.ts, http/
  test/              *.test.ts (Vitest + Supertest, Prisma simulado)
frontend/
  src/
    components/      layout/, forms/, routing/, ui/ (peças reutilizáveis)
    features/<nome>/ telas e lógica por funcionalidade (+ data.ts com dados fixos)
    hooks/           hooks compartilhados
    pages/           páginas de rota
    services/        chamadas HTTP (api.ts é o cliente base)
    types/           tipos do contrato com a API
docs/                configuração, milestones, diagramas, proposta, specs
.github/workflows/   PIPELINE_BACKEND.yaml, PIPELINE_FRONTEND.yaml
```

## 3. Comandos

O time usa Windows/PowerShell. Rode os comandos dentro da pasta indicada e evite sintaxe só de bash em scripts e docs.

**Backend** (`cd backend`):

- `npm ci` instala; copie `.env.example` para `.env` (nunca versione o `.env`)
- `npm run db:setup` gera o client, aplica migrations e roda o seed
- `npm run dev` sobe a API em `http://localhost:3333` (Swagger em `/docs`)
- `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm test`, `npm run build`
- Mudou o `schema.prisma`: `npm run db:migrate` (cria migration) e commite a pasta gerada

**Frontend** (`cd frontend`):

- `npm ci`, `npm run dev` (Vite, porta 5173)
- `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm test`, `npm run build`

Antes de dar uma tarefa por concluída, rode na pasta alterada: **typecheck, lint, format:check, testes e build**. A pipeline do frontend roda lint e format; a do backend não, então rode localmente de qualquer forma. `npm run format` corrige a formatação.

## 4. Fluxo de trabalho (SDD)

Cada entrega tem uma pasta `docs/specs/<nome-da-entrega>/` com:

- `spec.md`: o quê e por quê (requisitos e critérios de aceite)
- `plan.md`: como (decisões, arquivos afetados, testes, riscos)
- `tasks.md`: tarefas pequenas em checkboxes

Regras:

1. Se existir spec para a tarefa, leia `spec.md`, `plan.md` e `tasks.md` antes de codar e siga a ordem das tasks.
2. Marque o checkbox da task ao concluir e ao verificar. Não pule tasks nem amplie o escopo.
3. Se a spec contradisser este arquivo, a spec vale para aquela tarefa. Registre a divergência em "Perguntas em aberto" da spec.
4. Faltou informação? Registre como suposição na spec em vez de parar para perguntar, a menos que o risco seja alto.
5. Dependência nova (npm) só com justificativa no `plan.md`.

## 5. Convenções gerais

- Formatação (`.editorconfig` e Prettier): UTF-8, LF, 2 espaços, aspas simples, ponto e vírgula, vírgula final, largura 100.
- TypeScript estrito. Sem `any`; use tipos do contrato. Sem `console.log` esquecido.
- Siga o padrão do arquivo e do módulo vizinho antes de criar um estilo novo.
- Nomes de domínio em português quando já for assim (`setor`, `indicador`, `registro`, `fonte`, `papel`). Textos exibidos ao usuário em pt-BR com acentuação correta.
- Datas trafegam em ISO (`AAAA-MM-DD` ou ISO completo). Valores decimais trafegam como string (ex.: `"1240.50"`) e o frontend converte para exibir.
- PRs pequenos e dentro do escopo, seguindo `.github/pull_request_template.md` (resumo, verificação, checklist).
- Nunca versione `.env`, chaves, senhas ou dados pessoais. Não altere pipelines, lockfiles ou configs de lint sem a spec pedir. Não faça commit nem push sem pedido explícito.

## 6. Backend

**Arquitetura por módulo.** Cada módulo em `src/modules/<nome>/` tem quatro arquivos: `routes` (monta middlewares e rotas), `controller` (valida entrada com Zod e monta a resposta), `service` (regra de negócio e Prisma), `schemas` (Zod e tipos inferidos). Registre o router novo em `src/app.ts`.

**Padrões existentes que devem ser mantidos:**

- Imports locais com extensão `.js` (ESM), mesmo em arquivos `.ts`.
- Handlers `async` sem try/catch: o Express 5 repassa o erro ao `errorHandler`.
- Erros de negócio: `throw new AppError(status, 'codigo_em_snake_case', 'Mensagem.')`. O formato da resposta de erro é sempre `{ error, message, details? }`; erro de validação Zod vira 400 `validation_error`.
- Respostas de sucesso: `{ message, <entidade> }` na criação (201), `{ <entidades> }` na listagem e `{ <entidade> }` na consulta.
- Mensagens da API hoje não usam acentos; mantenha o padrão do arquivo que estiver editando.
- Autenticação: `exigirAutenticacao` + `exigirAdministrador` (ADMIN e SUPER_ADMIN) ou `exigirSuperAdmin` (só aprovação de contas). Sessão em cookie HttpOnly; não devolva nem guarde token no frontend. Rotas de login e cadastro têm rate limit; mantenha para endpoints públicos que escrevem dados.
- Variáveis de ambiente novas entram em `src/config/env.ts` (Zod) e em `.env.example`.
- Todo endpoint novo ou alterado atualiza `src/docs/openapi.ts` (Swagger) e a documentação em `docs/` quando o fluxo mudar.
- Banco: toda mudança de schema vira migration Prisma. Chaves `uuid`, colunas em `snake_case` via `@map`, `onDelete: Restrict` nas relações de dados.
- **Rotas públicas** (sem login) são somente leitura e só expõem registros com `publicado = true` e itens ativos. Nunca exponha dados de usuários ou rotas `/admin/*` sem autenticação. Entrada pública de dados (coleta autônoma) nunca publica direto: fica pendente até a SMCELT validar.
- Testes ficam em `backend/test/*.test.ts`, com Supertest e o Prisma simulado via `vi.mock` (sem banco real). Cobrir: sucesso, validação (400), permissão (401/403), conflito (409) e não encontrado (404).

## 7. Frontend

- Chamadas HTTP só passam por `services/api.ts` (`credentials: 'include'`, erros tipados `ApiRequestError`/`NetworkError`). Um arquivo de serviço por domínio (`services/<dominio>.ts`), funções pequenas que devolvem tipos de `types/`. Nunca use `fetch` direto em componentes.
- Tipos do contrato ficam em `src/types/` e espelham a resposta real da API. Mudou a API: atualize `types/`, o serviço e os testes no mesmo PR.
- Lógica em hooks (`useXxx`), apresentação em componentes. Dados e regras puras em `logic.ts` ou `format.ts`, testáveis sem React.
- Toda tela que busca dados trata os quatro estados: carregando, vazio, erro e pronto.
- Dados fixos (`features/*/data.ts`, `features/home/data.ts`) são temporários. Ao integrar, a API passa a ser a fonte e os dados fixos ficam só como fallback de desenvolvimento, controlado por `VITE_USE_MOCKS`. URL da API em `VITE_API_URL` (padrão `http://localhost:3333`).
- Rotas protegidas usam `ProtectedRoute` com `allowedRoles`. Aprovação de contas é só SUPER_ADMIN; telas de dados são para ADMIN e SUPER_ADMIN.
- Estilo: Tailwind com os tokens do tema em `src/index.css`. Não use cores soltas (hex) em componentes.
- Acessibilidade: elementos semânticos, `label` em campos, `aria-*` em gráficos e botões só com ícone, foco visível, contraste suficiente. Layout responsivo (celular primeiro).
- Testes ficam ao lado do código (`*.test.ts` e `*.test.tsx`), com Vitest e Testing Library. Serviços são testados com `vi.mock('./api')`; componentes e hooks por comportamento (o que o usuário vê), não por detalhe interno.

## 8. Identidade visual (proposta da Prefeitura)

- Cor de destaque (capa, cabeçalhos, botões primários): gradiente diagonal `#0A4AAD`, `#6C5CE0`, `#C750D6`. Já existe como `bg-brand-gradient`.
- Paleta de apoio para gráficos: `#5FE6E0` (ciano), `#6C5CE0` (roxo), `#27B7FD` (azul-céu), `#B986ED` (lilás), `#F3B8F7` (lilás claro), `#FADA77` (amarelo). Tokens `brand-*` e `data-*` em `src/index.css`.
- Fundo claro no restante da interface.
- Logotipos em três níveis: (1) Observatório do Turismo e Santa Rita do Sapucaí; (2) Prefeitura, SMCELT e COMTUR (realização e apoio); (3) Caminhos da Mantiqueira e Minas (contexto regional). Usados no cabeçalho, rodapé ou materiais gerados.

## 9. Escopo e metas para chegar a 100%

Posição em 28/10/2026 (estimativa por leitura de código; **atualize esta tabela ao concluir cada item**).

**Essenciais**

| #   | Funcionalidade                                       | Hoje                                                       | Pronto quando                                                                                  |
| --- | ---------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| 1   | Indicadores (hospedagem, leitos, empresas, empregos) | Front com dados fixos; back só no admin                    | Home e página de indicadores leem da API pública; valores vêm de registros publicados          |
| 2   | Relatórios públicos em PDF                           | Front com lista fixa e sem arquivo; back inexistente       | SMCELT envia PDF pelo admin; público lista e baixa pelo site                                   |
| 3   | Dashboard visual                                     | Front pronto com dados fixos                               | Gráficos e cards usam dados da API, com a paleta oficial                                       |
| 4   | Filtros por período e setor                          | Front funciona sobre dados fixos; API filtra só no admin   | Filtros alimentados pela API pública, setores e períodos reais                                 |
| 5   | Painel administrativo                                | Front só aprova contas; API sem editar, excluir e publicar | Admin cadastra, edita e publica registros, gerencia relatórios; ADMIN acessa as telas de dados |

**Desejáveis (fase 2)**

| #   | Funcionalidade                       | Hoje                                              | Pronto quando                                                                                           |
| --- | ------------------------------------ | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| 6   | Coleta autônoma por estabelecimentos | Formulário pronto; `POST /api/coletas` não existe | Coleta é salva como pendente; SMCELT valida e só então publica                                          |
| 7   | Painel Cadastur e FNRH Digital       | Página informativa pronta                         | Conteúdo e links oficiais revisados (sem integração com sistemas federais)                              |
| 8   | Inventário Turístico (PIT)           | Front com dados fixos; back inexistente           | Cadastro e gestão no admin, leitura pública, data da última atualização e lembrete de revisão periódica |

**Rotas que existem hoje no backend:** `/status`; `/auth/registro`, `/auth/login`, `/auth/me`, `/auth/logout`; `/admin/solicitacoes` (SUPER_ADMIN); `/admin/setores`, `/admin/indicadores`, `/admin/fontes-dados`, `/admin/registros-indicadores` (ADMIN; criar, listar e consultar por id).

**Rotas propostas, ainda não existem** (não as trate como existentes; o contrato final sai da spec):

- leitura pública de indicadores publicados e de setores
- relatórios: modelo no banco, upload (multipart) e download
- edição e publicação de registros; edição de setores e indicadores
- coletas: `POST` público com rate limit; listar, aprovar e rejeitar no admin
- PIT: CRUD no admin e leitura pública

Observação para o upload de PDF: `services/api.ts` hoje fixa `Content-Type: application/json` e o `patch` não aceita corpo. Ajuste isso na task de serviços antes de implementar upload ou edição.

## 10. Regras para agentes

- Leia só o necessário. Prefira os arquivos citados na task a varrer o repositório inteiro.
- Não escreva código fora do escopo da task nem refatore por conta própria.
- Não instale dependências, rode migrations em banco compartilhado ou mexa em CI sem pedido na spec.
- Sem dado real de pessoa ou de estabelecimento em testes, seeds ou exemplos; use dados fictícios.
- Código que você não conseguiu verificar (teste ou build não rodou) deve ser dito como tal na resposta final, sem afirmar que funciona.
- Ao terminar: liste os arquivos alterados, os comandos de verificação executados e o resultado, e o que ficou pendente.
