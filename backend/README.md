# Backend ObservaSRS

API HTTP do ObservaSRS, construida com Node.js, Express e TypeScript.

## Preparacao

```powershell
npm ci
Copy-Item .env.example .env
```

Antes de iniciar a autenticacao, edite o `.env` e substitua `SUA_SENHA` pela senha do usuario
`postgres`. Altere tambem `JWT_SECRET` e `SUPER_ADMIN_SEED_SENHA` para valores locais seguros.

## Comandos

```powershell
npm run dev          # inicia a API com recarga automatica
npm run build        # gera a aplicacao em dist/
npm start            # executa o build gerado
npm run typecheck    # verifica os tipos TypeScript
npm run lint         # verifica a qualidade do codigo
npm run format:check # verifica a formatacao
npm test             # executa os testes e gera relatorio HTML
npm run test:watch   # reexecuta os testes ao alterar arquivos
npm run db:setup     # aplica migrations e cria o super administrador inicial
npm run db:migrate   # cria/aplica migrations durante o desenvolvimento
npm run db:deploy    # aplica migrations existentes sem executar o seed
npm run db:studio    # abre a interface visual do Prisma
```

## Testes de autenticacao

Requer Node.js 22.12 ou superior. Na pasta `backend/`, instale as dependencias com
`npm ci` e execute:

```powershell
npm test
```

Vitest executa os testes e Supertest envia as requisicoes para a aplicacao Express.
Os cinco cenarios cobertos sao:

1. Login valido cria um cookie `HttpOnly` e permite consultar a sessao.
2. Senha incorreta retorna `401`, sem criar sessao.
3. Contas pendentes e rejeitadas recebem `403`, mesmo com senha correta.
4. Somente `SUPER_ADMIN` pode aprovar ou rejeitar contas; `ADMIN` e `EDITOR` recebem `403`.
5. Uma rota protegida recebe `401` quando nao existe login.

O relatorio apresenta exatamente cinco testes, um por cenario. As variacoes de status
e permissoes sao verificadas dentro do respectivo teste.
As consultas e atualizacoes do Prisma sao simuladas. Senhas, JWT, cookies, controllers e
middlewares utilizam o codigo real da aplicacao. Essa bateria nao verifica a persistencia
no PostgreSQL e nao exige banco, `.env` configurado ou servidor em execucao.

Ao terminar, abra `reports/tests/index.html` no navegador. O arquivo e independente e
mostra os casos aprovados, falhas e duracoes; pode ser compartilhado como relatorio da execucao.
Os resultados gerados ficam fora do Git. Para acompanhar alteracoes, use `npm run test:watch`.

O passo a passo e os resultados esperados de cada cenario estao em
[docs/testes-login.md](../docs/testes-login.md).

## Endpoint inicial

```http
GET /status
```

Resposta esperada:

```json
{
  "status": "positivo",
  "servico": "observasrs-api"
}
```

## Documentacao Swagger

Com o banco preparado e a API em execucao, abra:

```text
http://localhost:3333/docs
```

A especificacao OpenAPI tambem esta disponivel em `GET /docs.json`.

1. Expanda a rota que deseja testar.
2. Clique em **Try it out**.
3. Preencha os campos apresentados e clique em **Execute**.
4. Teste primeiro `GET /status` e depois `POST /auth/registro`.
5. Execute `POST /auth/login` com o super administrador configurado no `.env`.
6. Use as rotas `/admin/solicitacoes` para listar, aprovar ou rejeitar contas.

O login grava um cookie `HttpOnly`; por isso, execute-o na propria pagina antes de chamar as rotas
protegidas. Nao e necessario copiar um token ou preencher manualmente o botao **Authorize**.

Para demonstrar a persistencia no PostgreSQL, cadastre uma solicitacao, reinicie a API e consulte
novamente `GET /admin/solicitacoes`. Se a conta continuar listada, os dados foram recuperados do
banco, e nao da memoria do servidor.

## Acesso da equipe SMCELT

O acesso administrativo segue um fluxo de solicitacao e aprovacao:

1. Um integrante da equipe envia seu cadastro.
2. A conta permanece `PENDENTE` e ainda nao pode entrar.
3. O super administrador aprova ou rejeita a solicitacao.
4. Uma conta `APROVADO` e ativa pode realizar login.

O frontend devera utilizar estes endpoints publicos:

```http
POST /auth/registro
POST /auth/login
GET  /auth/me
POST /auth/logout
```

Corpo do cadastro:

```json
{
  "nome": "Integrante da SMCELT",
  "email": "integrante@exemplo.com",
  "senha": "senha-com-pelo-menos-8-caracteres"
}
```

Corpo do login:

```json
{
  "email": "superadmin@observasrs.local",
  "senha": "senha-configurada-no-env"
}
```

Quando as credenciais estao corretas, a API devolve os dados publicos do administrador e grava
um cookie de sessao `HttpOnly`. O navegador deve enviar requisicoes com credenciais habilitadas.

Enquanto a solicitacao estiver pendente ou rejeitada, o login sera bloqueado.

## Avaliacao de contas

Estas rotas exigem uma sessao com papel `SUPER_ADMIN`:

```http
GET   /admin/solicitacoes?status=PENDENTE
PATCH /admin/solicitacoes/:id/aprovar
PATCH /admin/solicitacoes/:id/rejeitar
```

O filtro `status` tambem aceita `APROVADO` e `REJEITADO`. A rejeicao nao exige corpo na
requisicao.

## Setores e indicadores

Estas rotas exigem uma conta `ADMIN` ou `SUPER_ADMIN` aprovada e ativa:

```http
POST /admin/setores
GET  /admin/setores
GET  /admin/setores/:id
POST /admin/indicadores
GET  /admin/indicadores
GET  /admin/indicadores/:id
```

As listagens aceitam `ativo=true` ou `ativo=false`. Sem esse filtro, retornam ativos e
inativos. Os indicadores tambem podem ser filtrados por `setorId`.

Para atualizar um banco que ja esta configurado, execute `npm run db:deploy` e reinicie a API.
Nao e necessario executar o seed novamente. A migration adiciona as tabelas `setor` e `indicador`.

O guia com exemplos no Swagger e consultas no pgAdmin esta em
[docs/setores-indicadores.md](../docs/setores-indicadores.md).

## Fontes de dados e registros de indicadores

Estas rotas seguem as mesmas permissoes de setores e indicadores:

```http
POST /admin/fontes-dados
GET  /admin/fontes-dados
GET  /admin/fontes-dados/:id
POST /admin/registros-indicadores
GET  /admin/registros-indicadores
GET  /admin/registros-indicadores/:id
```

Um registro relaciona indicador, fonte, data de referencia e valor decimal. O indicador e seu
setor devem estar ativos. A combinacao indicador, fonte e periodo nao pode ser repetida.
O campo `publicado` inicia como `false` e pode ser informado no cadastro.

As listagens permitem filtrar fontes por `tipo` e registros por `indicadorId`, `fonteId`,
`setorId`, `publicado`, `periodoInicio` e `periodoFim`. A consulta continua administrativa,
inclusive para os registros marcados como publicados.

Aplique as migrations com `npm run db:deploy`. O guia de uso no Swagger e no pgAdmin esta em
[docs/fontes-registros-indicadores.md](../docs/fontes-registros-indicadores.md).

## Preparacao do banco local

1. Crie no PostgreSQL um banco vazio chamado `observasrs`.
2. Configure `DATABASE_URL` no `.env` com sua senha local.
3. Defina `SUPER_ADMIN_SEED_NOME`, `SUPER_ADMIN_SEED_EMAIL` e
   `SUPER_ADMIN_SEED_SENHA`.
4. Execute `npm run db:setup`.
5. Inicie a API com `npm run dev`.
