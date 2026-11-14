# Planejamento de Testes E2E

## 1. Objetivo

Este documento define a estratégia, a arquitetura, as etapas de implementação e os
critérios de aceitação dos testes end-to-end (E2E) do ObservaSRS.

Os testes E2E devem validar os fluxos completos do sistema, utilizando:

- navegador real;
- frontend real;
- backend real;
- banco PostgreSQL real;
- autenticação por cookie;
- dados persistidos por meio das migrations e dos serviços da aplicação.

O objetivo não é substituir os testes unitários existentes. Os testes unitários
continuarão verificando regras isoladas, componentes e serviços. Os testes E2E
verificarão se as camadas funcionam corretamente em conjunto, reproduzindo as
ações de uma pessoa usuária.

## 2. Estado atual do repositório

Atualmente, o repositório possui:

- frontend em React, TypeScript, Vite e Tailwind CSS;
- backend em Node.js, Express, TypeScript, Zod e Prisma;
- PostgreSQL como banco de dados;
- testes de frontend com Vitest, React Testing Library e `jsdom`;
- testes de backend com Vitest e Supertest;
- testes de autenticação no backend com Prisma mockado;
- pipelines separadas para frontend e backend;
- execução de build, lint, typecheck e testes unitários no CI.

Atualmente, o repositório não possui:

- Playwright, Cypress ou outro framework E2E;
- diretório dedicado a testes E2E;
- configuração para iniciar frontend e backend automaticamente nos testes;
- banco PostgreSQL dedicado aos testes E2E;
- fixtures de usuários e dados de negócio;
- workflow de CI que execute uma jornada completa pelo navegador;
- publicação de screenshots, traces ou vídeos de testes E2E.

O teste `backend/test/auth.test.ts` valida requisições HTTP com Supertest, mas
não é um teste E2E completo, pois utiliza Prisma mockado e não passa pelo frontend.

## 3. Escopo

### 3.1. Escopo incluído

Serão cobertos os fluxos de maior risco e valor de negócio:

1. abertura e navegação pelas páginas públicas;
2. comunicação entre frontend e backend;
3. login e manutenção da sessão;
4. logout;
5. proteção de rotas;
6. autorização por papel de usuário;
7. criação e avaliação de solicitações de acesso;
8. envio e processamento de coleta autônoma;
9. consulta pública de indicadores;
10. consulta pública do inventário PIT;
11. publicação e download de relatórios PDF;
12. estados de carregamento, vazio e erro;
13. execução local e no GitHub Actions.

### 3.2. Escopo não incluído inicialmente

Não fará parte da primeira versão:

- cobertura de todos os estados visuais de cada componente;
- teste de todas as combinações possíveis de filtros;
- teste de performance, carga ou stress;
- teste de segurança automatizado completo;
- compatibilidade com todos os navegadores;
- testes visuais pixel a pixel;
- substituição dos testes unitários existentes;
- validação de detalhes internos de implementação do React;
- execução contra o banco de desenvolvimento de uma pessoa desenvolvedora.

Esses itens poderão ser adicionados em etapas posteriores, caso exista necessidade
de produto ou risco técnico que justifique o custo adicional.

## 4. Decisões técnicas

### 4.1. Framework: Playwright

O Playwright será utilizado como framework principal dos testes E2E.

Motivos da escolha:

- suporte nativo a TypeScript;
- integração com aplicações Vite;
- suporte a Chromium, Firefox e WebKit;
- possibilidade de iniciar serviços automaticamente com `webServer`;
- suporte a múltiplos contextos de navegador;
- manipulação de cookies e sessões;
- suporte a upload e download de arquivos;
- `APIRequestContext` para preparação e limpeza de dados;
- screenshots, vídeos e traces;
- execução headless adequada para CI;
- execução visual com `--ui` durante o desenvolvimento.

O Playwright será usado para dirigir o navegador. As chamadas HTTP auxiliares
serão usadas apenas para preparar dados, limpar o ambiente ou verificar contratos
que não precisam de interação visual.

### 4.2. Testes com integração real

Os cenários principais devem usar:

```text
VITE_USE_MOCKS=false
VITE_API_URL=http://localhost:3333
```

Não será permitido utilizar os dados mockados do frontend nos fluxos E2E
principais. O uso de mocks poderia mascarar:

- URLs incorretas;
- problemas de CORS;
- cookies não enviados;
- falhas de autenticação;
- divergências entre contratos do frontend e backend;
- falhas de migrations;
- problemas de persistência;
- erros de autorização.

Mocks poderão ser usados somente em testes específicos de indisponibilidade
externa, caso esse cenário seja necessário futuramente.

### 4.3. Banco dedicado

Os testes devem utilizar um banco separado do ambiente local de desenvolvimento.

Exemplo:

```text
observasrs_e2e
```

Motivos:

- impedir que os testes alterem dados reais de desenvolvimento;
- permitir limpeza e recriação dos dados;
- evitar dependência da ordem de execução;
- tornar a execução reproduzível;
- permitir execução paralela no CI sem compartilhar estado com outras etapas.

### 4.4. Dados determinísticos

Os testes não devem depender de dados criados manualmente por uma pessoa.

O ambiente deverá ser preparado por:

1. aplicação das migrations;
2. execução de um seed próprio para E2E;
3. criação de dados mínimos necessários;
4. limpeza ou recriação do banco antes de uma nova execução completa.

Os dados de teste devem ter nomes e e-mails identificáveis, por exemplo:

```text
e2e-super-admin@observasrs.local
e2e-admin@observasrs.local
e2e-pendente@observasrs.local
```

As credenciais devem vir de variáveis de ambiente do ambiente de testes. Não
devem ser utilizadas credenciais reais nem segredos commitados.

### 4.5. Seletores

Os testes devem preferir seletores semânticos, nesta ordem:

1. `getByRole`;
2. `getByLabel`;
3. `getByPlaceholder`;
4. `getByText`, quando o texto for estável;
5. `data-testid`, quando não houver uma alternativa semântica confiável.

Não devem ser utilizados:

- seletores baseados em classes Tailwind;
- seletores baseados em posição no DOM;
- seletores longos com vários níveis de descendentes;
- textos de mensagens técnicas que podem mudar sem alterar o comportamento;
- IDs gerados dinamicamente.

`data-testid` poderá ser adicionado somente em elementos difíceis de selecionar,
como:

- tabela administrativa;
- mensagens de feedback;
- indicador de carregamento;
- controle gráfico;
- botão de download de PDF;
- elementos que representam estados vazios ou de erro.

### 4.6. Independência entre testes

Cada teste deve poder ser executado isoladamente.

Para isso:

- não depender da ordem dos testes;
- não reutilizar estado implícito de outro teste;
- criar dados específicos quando houver alteração;
- utilizar contextos de navegador isolados;
- limpar dados criados pelo teste quando necessário;
- evitar datas relativas sem controle de fuso;
- evitar espera fixa com `waitForTimeout`.

As esperas devem ser baseadas em condições observáveis, como:

- elemento visível;
- resposta de uma requisição;
- mudança de URL;
- mensagem de sucesso;
- conclusão de carregamento;
- aparecimento ou desaparecimento de um estado.

## 5. Arquitetura planejada

Estrutura sugerida:

```text
e2e/
├── fixtures/
│   ├── auth.fixture.ts
│   ├── database.fixture.ts
│   └── test.fixture.ts
├── pages/
│   ├── admin-page.ts
│   ├── home-page.ts
│   ├── login-page.ts
│   ├── reports-page.ts
│   └── request-access-page.ts
├── specs/
│   ├── public.spec.ts
│   ├── authentication.spec.ts
│   ├── authorization.spec.ts
│   ├── access-requests.spec.ts
│   ├── collection.spec.ts
│   ├── indicators.spec.ts
│   ├── pit.spec.ts
│   └── reports.spec.ts
├── support/
│   ├── api-client.ts
│   ├── test-data.ts
│   └── wait-for-api.ts
├── files/
│   └── sample-report.pdf
└── playwright.config.ts
```

Os nomes podem ser ajustados durante a implementação, mas a separação entre
fixtures, Page Objects, specs e utilitários deve ser preservada.

### 5.1. Page Objects

Page Objects serão utilizados somente para telas que possuam comportamento
repetido ou significativo, como:

- login;
- painel administrativo;
- solicitação de acesso;
- relatórios.

Não deve ser criado um Page Object para cada componente simples. A abstração
deve reduzir repetição sem esconder o comportamento importante do teste.

### 5.2. Fixtures

As fixtures devem encapsular:

- criação de contexto de navegador;
- login como `ADMIN`;
- login como `SUPER_ADMIN`;
- criação de usuário de teste;
- limpeza de dados;
- verificação de disponibilidade da API;
- preparação de arquivos para upload.

Exemplo conceitual de usos:

```ts
test('super administrador acessa solicitações', async ({
  superAdminPage,
}) => {
  await superAdminPage.goto();
  await expect(superAdminPage.heading).toBeVisible();
});
```

As fixtures não devem esconder todas as etapas do negócio. O teste ainda deve
ser compreensível para quem estiver investigando uma falha.

## 6. Modelo de ambiente

### 6.1. Serviços

O ambiente E2E deverá possuir:

| Serviço | Porta | Função |
| --- | ---: | --- |
| PostgreSQL | 5433 ou porta dedicada | Persistência dos dados E2E |
| Backend | 3333 | API do ObservaSRS |
| Frontend | 5173 | Aplicação web |

O backend atualmente utiliza `3333` e o frontend utiliza `5173`. A configuração
do CORS deverá permitir que o frontend E2E acesse a API.

### 6.2. Variáveis de ambiente

Exemplo para o backend:

```env
NODE_ENV=test
PORT=3333
CORS_ORIGIN=http://localhost:5173
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/observasrs_e2e
JWT_SECRET=chave-exclusiva-do-ambiente-e2e-com-mais-de-32-caracteres
JWT_EXPIRES_IN_SECONDS=3600
AUTH_COOKIE_NAME=observasrs_sessao
RELATORIOS_STORAGE_DIR=storage/e2e-relatorios
SUPER_ADMIN_SEED_NOME=E2E Super Administrador
SUPER_ADMIN_SEED_EMAIL=e2e-super-admin@observasrs.local
SUPER_ADMIN_SEED_SENHA=senha-e2e-super-admin
```

Exemplo para o frontend:

```env
VITE_API_URL=http://localhost:3333
VITE_USE_MOCKS=false
```

Os valores de senha devem ser fornecidos pelo ambiente do CI ou por arquivos
locais ignorados pelo Git. Nunca devem ser adicionados ao repositório.

### 6.3. Inicialização local

O fluxo local esperado será:

```powershell
docker compose up -d postgres

cd backend
npm ci
npm run db:generate
npm run db:deploy
npm run db:seed

cd ..\frontend
npm ci
```

Em seguida, os serviços serão iniciados em terminais separados:

```powershell
cd backend
npm run dev
```

```powershell
cd frontend
npm run dev
```

Depois disso, os testes E2E poderão ser executados a partir da pasta que
concentrar a configuração do Playwright.

O fluxo deverá ser automatizado posteriormente para evitar que a pessoa
desenvolvedora precise iniciar os serviços manualmente.

## 7. Etapas de implementação

### Etapa 0 — Verificação do ambiente atual

Antes de criar os testes:

1. executar `npm ci` no backend;
2. executar `npm ci` no frontend;
3. confirmar que dependências declaradas estão presentes;
4. corrigir o problema local observado de `multer` ausente;
5. verificar se as suítes Vitest encerram corretamente;
6. validar `npm run typecheck`;
7. validar `npm run build`;
8. confirmar o funcionamento do PostgreSQL;
9. confirmar `GET /status`;
10. confirmar a abertura do frontend.

Essa etapa é obrigatória porque uma infraestrutura de testes E2E não deve ser
construída sobre um ambiente local inconsistente.

### Etapa 1 — Instalação do Playwright

Adicionar o Playwright como dependência de desenvolvimento no local definido
para os testes E2E.

Configurar:

- TypeScript;
- navegador Chromium inicialmente;
- execução headless no CI;
- execução com UI local;
- timeout padrão;
- retries apenas no CI;
- diretório de artefatos;
- screenshots em falhas;
- trace na primeira repetição;
- vídeos somente quando necessário.

Scripts esperados:

```json
{
  "e2e": "playwright test",
  "e2e:ui": "playwright test --ui",
  "e2e:debug": "playwright test --debug",
  "e2e:report": "playwright show-report"
}
```

Os scripts devem ser colocados no `package.json` correspondente ao local onde
a configuração E2E for centralizada.

### Etapa 2 — Configuração de inicialização dos serviços

Configurar o Playwright para:

1. iniciar o backend;
2. aguardar a API responder;
3. iniciar o frontend;
4. aguardar a aplicação estar disponível;
5. executar os testes;
6. encerrar os processos ao final.

A configuração deve usar uma URL base única, por exemplo:

```text
http://localhost:5173
```

O backend deverá estar acessível pelo frontend em:

```text
http://localhost:3333
```

A verificação de disponibilidade deve usar uma condição real, como `GET /status`,
em vez de apenas aguardar uma quantidade fixa de segundos.

### Etapa 3 — Banco e seed E2E

Criar um mecanismo de preparação do banco:

1. criar o banco E2E;
2. aplicar migrations;
3. executar o seed inicial;
4. inserir usuários;
5. inserir setores e indicadores;
6. inserir registros publicados e não publicados;
7. inserir itens PIT;
8. inserir relatório publicado;
9. verificar que os dados estão prontos.

O seed deverá ser idempotente ou o banco deverá ser recriado antes da execução.

O banco deve conter, no mínimo:

| Tipo | Estado |
| --- | --- |
| Super administrador | aprovado e ativo |
| Administrador | aprovado e ativo |
| Solicitação | pendente |
| Solicitação | rejeitada |
| Setor | ativo |
| Setor | inativo |
| Indicador | ativo |
| Registro | publicado |
| Registro | não publicado |
| Item PIT | ativo |
| Item PIT | inativo |
| Relatório | publicado |
| Relatório | rascunho |

### Etapa 4 — Smoke test

Criar o primeiro teste E2E com o menor número possível de dependências:

1. abrir a home;
2. verificar o título principal;
3. verificar que a página não apresenta erro global;
4. acessar uma rota pública;
5. confirmar uma resposta bem-sucedida da API;
6. confirmar que o frontend recebe dados do backend.

O smoke test será executado em todos os Pull Requests e deverá ser rápido.

### Etapa 5 — Navegação pública

Criar cenários para:

- abertura da home;
- navegação para indicadores;
- navegação para relatórios;
- navegação para inventário PIT;
- navegação para Cadastur/FNRH;
- navegação para coleta;
- abertura direta de cada URL;
- redirecionamento de URL desconhecida;
- menu responsivo em viewport mobile;
- retorno visual adequado quando não houver dados;
- mensagem de erro quando a API estiver indisponível, quando o cenário for
  suportado pela aplicação.

O objetivo desta etapa é garantir que as rotas reais do `App.tsx` funcionem
com o ambiente integrado.

### Etapa 6 — Autenticação

Criar cenários para:

#### Login válido

1. abrir `/login`;
2. preencher e-mail e senha;
3. enviar o formulário;
4. verificar feedback de sucesso;
5. confirmar redirecionamento;
6. confirmar que a sessão foi criada;
7. acessar uma rota protegida.

#### Login inválido

1. informar senha incorreta;
2. verificar status de erro;
3. confirmar que nenhuma sessão foi criada;
4. confirmar que a pessoa permanece fora do painel.

#### Conta pendente ou rejeitada

1. utilizar uma conta com status não aprovado;
2. tentar entrar;
3. verificar a mensagem correta;
4. confirmar que a sessão não foi criada.

#### Logout

1. entrar no painel;
2. clicar em sair;
3. confirmar redirecionamento para login;
4. tentar voltar para uma rota protegida;
5. confirmar que o acesso foi negado.

#### Sessão

1. fazer login;
2. recarregar a página;
3. confirmar que a sessão permanece válida;
4. invalidar ou alterar a versão da sessão;
5. confirmar que o frontend trata a sessão inválida.

### Etapa 7 — Autorização por papel

Criar testes separados para cada papel.

#### Usuário anônimo

- não acessa `/admin`;
- não acessa `/admin/solicitacoes`;
- é redirecionado para `/login`.

#### `ADMIN`

- acessa `/admin`;
- visualiza o painel inicial;
- não visualiza o link de solicitações;
- não acessa `/admin/solicitacoes`;
- recebe resposta de autorização negada na API quando tentar executar uma ação
  exclusiva do super administrador.

#### `SUPER_ADMIN`

- acessa `/admin`;
- visualiza o link de solicitações;
- acessa `/admin/solicitacoes`;
- lista solicitações;
- aprova solicitações;
- rejeita solicitações.

O teste deve validar a proteção no frontend e também no backend. Esconder um
link não é suficiente para comprovar autorização.

### Etapa 8 — Solicitações de acesso

Fluxo de aprovação:

1. abrir a tela de cadastro público;
2. preencher nome, e-mail e senha;
3. enviar a solicitação;
4. confirmar mensagem de sucesso;
5. entrar como `SUPER_ADMIN`;
6. abrir solicitações;
7. filtrar por `PENDENTE`;
8. localizar a solicitação criada;
9. abrir os detalhes;
10. aprovar;
11. confirmar a atualização visual;
12. sair;
13. entrar com o usuário aprovado;
14. confirmar o acesso autorizado.

Fluxo de rejeição:

1. criar uma nova solicitação;
2. entrar como `SUPER_ADMIN`;
3. localizar a solicitação;
4. rejeitar;
5. confirmar o novo status;
6. tentar entrar com a conta rejeitada;
7. confirmar a resposta de conta rejeitada.

Também devem ser validados:

- filtro por status;
- lista vazia;
- cancelamento de uma ação de confirmação;
- tentativa de acesso com usuário sem permissão;
- tratamento de sessão expirada durante a operação.

### Etapa 9 — Coleta autônoma

Criar cenários para:

1. abrir a página de coleta;
2. enviar o formulário vazio;
3. verificar os erros de campos obrigatórios;
4. informar CNPJ inválido;
5. informar período futuro;
6. informar número negativo de leitos;
7. preencher dados válidos;
8. enviar a coleta;
9. confirmar mensagem de sucesso;
10. confirmar limpeza ou redefinição do formulário;
11. localizar a coleta no painel administrativo;
12. aprovar a coleta;
13. rejeitar uma coleta;
14. publicar ou despublicar quando aplicável;
15. confirmar o comportamento público do dado.

O teste deve verificar as validações do frontend e a resposta real da API.

### Etapa 10 — Indicadores

Criar cenários para:

- carregar dados publicados pela API;
- exibir cards e gráficos;
- aplicar filtro por período;
- aplicar filtro por setor;
- combinar filtros;
- limpar filtros;
- exibir estado vazio;
- ocultar registros não publicados;
- não exibir dados ligados a setores inativos;
- tratar falha da API;
- preservar a navegação ao alternar a visualização.

Os dados devem ser preparados no banco com períodos diferentes para que os
filtros tenham efeito verificável.

### Etapa 11 — Inventário PIT

Criar cenários para:

- carregar itens públicos;
- filtrar por categoria;
- exibir datas formatadas;
- ocultar item inativo;
- exibir estado vazio;
- tratar erro da API;
- criar item como usuário autorizado;
- editar item;
- desativar item;
- reativar item;
- impedir alteração por usuário não autorizado.

### Etapa 12 — Relatórios PDF

Criar cenários para:

1. listar relatórios publicados;
2. confirmar que rascunhos não aparecem publicamente;
3. abrir o link de download;
4. confirmar que o download retorna um PDF;
5. entrar como usuário autorizado;
6. cadastrar os metadados do relatório;
7. fazer upload de um PDF válido;
8. rejeitar arquivo inválido;
9. rejeitar arquivo acima do limite;
10. publicar o relatório;
11. confirmar a publicação no painel;
12. confirmar a disponibilidade pública;
13. despublicar;
14. confirmar que o relatório deixou de aparecer publicamente.

O arquivo de teste deve ser pequeno, versionado somente se não houver conteúdo
sensível e armazenado em `e2e/files/`.

### Etapa 13 — Estados de erro e disponibilidade

Criar cenários específicos para:

- backend indisponível;
- endpoint retornando erro;
- resposta vazia;
- sessão expirada;
- usuário sem permissão;
- arquivo inválido;
- registro inexistente;
- rota inexistente;
- erro de rede durante o envio.

Esses testes devem ser usados com moderação. O objetivo é validar o comportamento
do produto, não criar uma suíte excessivamente dependente de interceptações.

## 8. Matriz de cenários prioritários

| Prioridade | Área | Cenário | Tipo |
| --- | --- | --- | --- |
| P0 | Infraestrutura | Frontend e backend iniciam | Smoke |
| P0 | Infraestrutura | API responde em `/status` | Smoke |
| P0 | Público | Home carrega dados reais | E2E |
| P0 | Autenticação | Login válido cria sessão | E2E |
| P0 | Autenticação | Login inválido é rejeitado | E2E |
| P0 | Autorização | Anônimo não acessa painel | E2E |
| P0 | Autorização | `ADMIN` não acessa solicitações | E2E |
| P0 | Autorização | `SUPER_ADMIN` acessa solicitações | E2E |
| P0 | Administração | Aprovação de usuário | E2E |
| P0 | Administração | Rejeição de usuário | E2E |
| P1 | Público | Indicadores carregam e filtram | E2E |
| P1 | Público | Inventário PIT carrega e filtra | E2E |
| P1 | Coleta | Envio válido de coleta | E2E |
| P1 | Coleta | Validações do formulário | E2E |
| P1 | Relatórios | Download de relatório publicado | E2E |
| P1 | Relatórios | Upload e publicação de PDF | E2E |
| P2 | Administração | Edição e ativação de registros | E2E |
| P2 | Resiliência | API indisponível | E2E |
| P2 | Responsividade | Menu mobile e navegação | E2E |

P0 representa os fluxos mínimos para bloquear uma regressão crítica. P1 representa
funcionalidades importantes de negócio. P2 representa cenários complementares ou
mais caros de manter.

## 9. CI/CD

### 9.1. Pipeline de Pull Request

A pipeline E2E deverá executar:

1. checkout;
2. configuração do Node.js 22;
3. configuração do PostgreSQL;
4. instalação do backend com `npm ci`;
5. instalação do frontend com `npm ci`;
6. instalação dos navegadores Playwright;
7. aplicação das migrations;
8. execução do seed E2E;
9. inicialização do backend;
10. inicialização do frontend;
11. execução dos testes P0;
12. publicação de relatório e artefatos;
13. encerramento dos serviços.

O PostgreSQL poderá ser disponibilizado por:

- serviço do GitHub Actions; ou
- `docker compose` dedicado ao ambiente E2E.

O `docker-compose.yml` atual poderá continuar sendo usado para desenvolvimento,
mas a configuração E2E deve impedir conflitos com volumes e bancos locais.

### 9.2. Execução completa

Após estabilizar os testes P0, a pipeline poderá executar:

- todos os testes P0 e P1 em Pull Requests;
- P2 em execução agendada;
- Chromium inicialmente;
- Firefox e WebKit em uma etapa posterior.

### 9.3. Artefatos

Em falhas, a pipeline deve publicar:

- relatório HTML do Playwright;
- screenshots;
- trace;
- vídeo, se habilitado;
- logs do backend;
- logs do frontend;
- resultado da preparação do banco.

Esses artefatos devem permanecer disponíveis por tempo suficiente para investigar
falhas de Pull Request.

## 10. Configuração de retries e paralelismo

Durante o desenvolvimento local:

- retries desabilitados;
- execução sequencial quando necessário;
- modo UI ou debug disponível;
- mensagens de erro completas.

No CI:

- retry limitado, preferencialmente uma tentativa adicional;
- workers inicialmente configurados de forma conservadora;
- execução paralela somente depois de garantir isolamento do banco;
- nenhum retry deve esconder uma falha determinística.

Se um teste passar somente após retry, a execução deve ser investigada. Flakiness
não deve ser tratada como comportamento aceitável.

## 11. Controle de tempo e estabilidade

Para reduzir testes instáveis:

- usar locators semânticos;
- esperar respostas e estados reais;
- não usar `sleep` fixo;
- controlar timezone;
- controlar datas geradas;
- garantir dados suficientes para gráficos;
- evitar dependência de animações;
- desabilitar ou aguardar animações quando necessário;
- limpar o banco entre execuções completas;
- não compartilhar sessão entre cenários independentes;
- aguardar o fim de uploads e downloads;
- validar o status da API antes de iniciar os fluxos.

O timeout deve ser suficiente para o CI, mas não tão alto a ponto de esconder
travamentos. Timeouts específicos devem ser usados apenas nos pontos que realmente
precisarem de mais tempo, como upload e inicialização de serviços.

## 12. Segurança e dados sensíveis

Os testes não devem:

- utilizar contas reais;
- utilizar e-mails de pessoas reais;
- armazenar senhas reais;
- commitar tokens;
- commitar arquivos PDF confidenciais;
- expor variáveis de ambiente nos logs;
- imprimir cookies de sessão;
- usar o banco de produção;
- enviar dados pessoais reais.

As credenciais E2E devem ser configuradas como secrets ou variáveis do ambiente
de execução.

## 13. Critérios de aceite por etapa

### Ambiente

- `npm ci` funciona no frontend e no backend;
- dependências declaradas estão instaladas;
- migrations são aplicadas sem erro;
- seed E2E é reproduzível;
- API responde em `/status`;
- frontend abre na porta configurada.

### Framework

- Playwright inicia;
- Chromium está instalado;
- smoke test passa localmente;
- smoke test passa no CI;
- relatório HTML é gerado;
- screenshot é gerado em uma falha simulada.

### Autenticação e autorização

- login válido funciona com API real;
- login inválido falha;
- cookie de sessão é mantido;
- logout invalida o acesso;
- rotas protegidas redirecionam corretamente;
- papéis `ADMIN` e `SUPER_ADMIN` têm comportamentos distintos.

### Negócio

- solicitação pode ser criada, aprovada e rejeitada;
- dados públicos são carregados da API;
- filtros possuem efeito observável;
- coleta válida pode ser enviada;
- relatório publicado pode ser baixado;
- permissões administrativas são respeitadas.

### CI

- a pipeline inicia o banco;
- a pipeline prepara o ambiente;
- a pipeline executa os testes;
- falhas publicam artefatos;
- os testes não dependem de arquivos ou processos locais.

## 14. Definition of Done

Uma etapa de testes E2E somente será considerada concluída quando:

1. o cenário estiver implementado;
2. o teste usar dados determinísticos;
3. o teste puder ser executado isoladamente;
4. o teste passar localmente;
5. o teste passar no CI;
6. os seletores forem estáveis;
7. os erros forem diagnosticáveis;
8. não existirem sleeps desnecessários;
9. os dados sensíveis estiverem protegidos;
10. a documentação do comando estiver atualizada;
11. o teste não depender do modo mock do frontend;
12. o teste validar o comportamento observável, e não a implementação interna.

## 15. Ordem recomendada de execução

A implementação deve seguir esta ordem:

1. corrigir e validar as dependências atuais;
2. configurar o banco E2E;
3. criar o seed determinístico;
4. instalar e configurar o Playwright;
5. automatizar a inicialização dos serviços;
6. criar o smoke test;
7. criar os testes de login;
8. criar os testes de autorização;
9. criar o fluxo de aprovação e rejeição;
10. criar os testes de navegação pública;
11. criar o fluxo de coleta;
12. criar indicadores e PIT;
13. criar relatórios e upload;
14. adicionar cenários de erro;
15. configurar artefatos no CI;
16. habilitar execução P0 em Pull Requests;
17. adicionar P1 e P2 após estabilização;
18. avaliar Firefox e WebKit.

Essa ordem reduz o risco porque primeiro valida a infraestrutura e os fluxos de
autenticação, que são pré-requisitos para grande parte das funcionalidades
administrativas.

## 16. Riscos e mitigação

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| Dependências locais incompletas | Alto | Executar `npm ci` e validar os manifests antes dos testes |
| Banco compartilhado | Alto | Banco dedicado e seed determinístico |
| Uso acidental de mocks | Alto | `VITE_USE_MOCKS=false` no ambiente E2E |
| Seletores frágeis | Médio | Priorizar roles, labels e test IDs estáveis |
| Testes dependentes de ordem | Alto | Isolamento de contexto e limpeza de dados |
| Sessão compartilhada | Alto | Login por fixture e contexto independente |
| Upload lento | Médio | Timeout específico e arquivo pequeno |
| Falha intermitente no CI | Alto | Esperas por condições reais, traces e retries limitados |
| Dados insuficientes para filtros | Médio | Seed com períodos, setores e estados distintos |
| Diferença entre ambiente local e CI | Alto | Inicialização automatizada e mesma configuração |
| Relatórios PDF persistidos entre execuções | Médio | Diretório de storage exclusivo para E2E |
| Rate limit durante a suíte | Médio | Dados e execução planejados; evitar loops desnecessários |

## 17. Resultado esperado

Ao final da implementação, o repositório deverá permitir que uma pessoa
desenvolvedora execute uma única rotina para:

1. preparar o banco;
2. iniciar os serviços;
3. abrir o frontend em navegador real;
4. executar os fluxos críticos;
5. visualizar o relatório;
6. investigar falhas com screenshots e traces.

No CI, a mesma rotina deverá validar automaticamente que uma alteração não
quebrou a integração entre frontend, backend, autenticação, banco e principais
fluxos de negócio do ObservaSRS.
