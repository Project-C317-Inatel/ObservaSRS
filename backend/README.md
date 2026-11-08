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

## Acesso de contas aprovadas

O SUPER_ADMIN pode desativar e reativar contas ADMIN ou EDITOR ja aprovadas:

```http
GET   /admin/solicitacoes?status=APROVADO&ativo=false
PATCH /admin/contas/:id/desativar
PATCH /admin/contas/:id/reativar
```

O filtro `ativo` e opcional. Sem ele, a listagem inclui contas ativas e inativas do status
selecionado. As acoes nao exigem corpo nem justificativa e rejeitam campos adicionais.

O status permanece `APROVADO`, e senha, papel e avaliacao original sao preservados.
Contas pendentes ou rejeitadas nao podem ser reativadas por essas rotas. A propria conta
e todas as contas SUPER_ADMIN sao protegidas contra essas alteracoes.

Uma mudanca efetiva de acesso revoga as sessoes anteriores. Depois de reativar, a conta
precisa fazer novo login com sua senha existente; o cookie antigo nao volta a funcionar.
Repetir uma acao cujo estado ja esta aplicado retorna `200` sem revogar novamente.

Aplique a migration com `npm run db:deploy` e gere o cliente com `npm run db:generate`.
O campo interno `versao_sessao` e adicionado sem apagar contas e nao aparece nas respostas
da API. Nao e necessario executar o seed. Veja [docs/gestao-contas.md](../docs/gestao-contas.md).

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

## Edicao e publicacao

Contas `ADMIN` ou `SUPER_ADMIN` aprovadas e ativas podem atualizar os cadastros:

```http
PATCH /admin/setores/:id
PATCH /admin/indicadores/:id
PATCH /admin/fontes-dados/:id
PATCH /admin/registros-indicadores/:id
PATCH /admin/registros-indicadores/:id/publicacao
```

Os quatro endpoints de edicao recebem somente os campos que devem mudar. Os demais sao
preservados; o corpo nao pode estar vazio nem conter campos desconhecidos. Os campos
opcionais de texto aceitam `null` para limpar o valor salvo.

Setores e indicadores podem ser ativados ou desativados pelo campo `ativo`, sem excluir
os dados vinculados. A publicacao recebe `{"publicado": true}` ou `{"publicado": false}`.
Editar um registro preserva sua publicacao atual. Publicar exige indicador e setor ativos;
despublicar e permitido mesmo se estiverem inativos. As rotas `/admin` continuam protegidas.

Nao ha novas migrations ou dependencias nesta etapa. O tutorial com exemplos no Swagger
esta em [docs/edicao-publicacao.md](../docs/edicao-publicacao.md).

## Consulta publica

Estas rotas nao exigem login:

```http
GET /setores
GET /setores/:id
GET /indicadores
GET /indicadores/:id
GET /registros-indicadores
GET /registros-indicadores/:id
```

Setores devem estar ativos. Indicadores devem estar ativos e vinculados a setores ativos.
Registros devem estar publicados e ter indicador e setor ativos. Registros nao publicados,
cadastros inativos e IDs inexistentes retornam `404` nas consultas individuais.

As listas aceitam `pagina` (padrao 1) e `limite` (padrao 20, maximo 100) e retornam
`paginacao` junto dos itens. Indicadores aceitam `setorId`. Registros aceitam `indicadorId`,
`fonteId`, `setorId`, `periodoInicio` e `periodoFim`, com datas inclusivas. Filtros desconhecidos
sao rejeitados; nao e possivel solicitar registros nao publicados pela API publica.

As respostas publicas nao incluem observacoes dos registros ou campos de controle interno.
Datas e valores mantem os formatos `AAAA-MM-DD` e string decimal com duas casas.
Nao ha agregacao de valores para graficos nem alteracoes no frontend.

O tutorial esta em [docs/consulta-publica.md](../docs/consulta-publica.md). Nao ha novas
migrations, dependencias ou mudancas nas permissoes das rotas administrativas.

## Relatorios e PDFs

Instale as dependencias atualizadas com `npm ci` e aplique a migration com `npm run db:deploy`.
Ela adiciona a tabela `relatorio` e seu vinculo com o administrador que criou o cadastro,
sem recriar o banco ou executar o seed.

Rotas para ADMIN ou SUPER_ADMIN aprovado e ativo:

```http
POST  /admin/relatorios
GET   /admin/relatorios
GET   /admin/relatorios/:id
PATCH /admin/relatorios/:id
POST  /admin/relatorios/:id/arquivo
GET   /admin/relatorios/:id/arquivo
PATCH /admin/relatorios/:id/publicacao
```

Rotas publicas:

```http
GET /relatorios
GET /relatorios/:id
GET /relatorios/:id/arquivo
```

O cadastro inicia como rascunho. O PDF e enviado separadamente por `multipart/form-data`
no campo `arquivo`, com limite de 10 MB. A estrutura do PDF e conferida com `pdf-lib`,
alem do tipo MIME e da extensao; arquivos criptografados ou sem paginas sao rejeitados.
O parser de upload e o Multer, restrito a essa rota apos a autenticacao.

Publicar exige um PDF disponivel. Substituir o arquivo exige despublicar primeiro.
Editar metadados preserva o estado de publicacao. A data `publicadoEm` e preenchida ao
publicar e limpa ao despublicar; repetir o mesmo estado nao muda essa data.

As listas sao paginadas e aceitam `tipo` e `periodoReferencia`. A lista administrativa
tambem aceita `publicado`. Tipos: `TRIMESTRAL`, `SETORIAL` e `ANUAL`.

`RELATORIOS_STORAGE_DIR` configura o armazenamento privado. O padrao e `storage/relatorios`,
relativo a pasta `backend/`, tanto ao executar TypeScript quanto o build. Caminhos absolutos
tambem sao aceitos para volumes persistentes. Nao publique essa pasta por servidor estatico.
O deploy deve preservar o volume e fazer backup dos PDFs junto do PostgreSQL.

O tutorial completo esta em [docs/relatorios-pdfs.md](../docs/relatorios-pdfs.md).

## Inventario PIT, Estabelecimentos e Coletas

Os modulos seguem a organizacao de schemas, services, controllers e routes.
A migracao `20261026180000_inventario_pit_coletas` adiciona `item_pit`,
`estabelecimento` e `submissao_coleta`, com vinculo da avaliacao ao usuario administrativo.
Para atualizar sem executar o seed:

```powershell
npm run db:generate
npm run db:deploy
```

Rotas para ADMIN ou SUPER_ADMIN aprovado e ativo:

```http
POST  /admin/itens-pit
GET   /admin/itens-pit
GET   /admin/itens-pit/:id
PATCH /admin/itens-pit/:id
PATCH /admin/itens-pit/:id/revisao
POST  /admin/estabelecimentos
GET   /admin/estabelecimentos
GET   /admin/estabelecimentos/:id
PATCH /admin/estabelecimentos/:id
GET   /admin/coletas
GET   /admin/coletas/:id
PATCH /admin/coletas/:id
PATCH /admin/coletas/:id/aprovar
PATCH /admin/coletas/:id/rejeitar
PATCH /admin/coletas/:id/publicacao
```

Rotas publicas:

```http
GET  /itens-pit
GET  /itens-pit/:id
POST /api/coletas
GET  /coletas/resumo?periodoReferencia=2026-10
```

O PIT possui data da ultima revisao e prazo configuravel, com padrao de 180 dias.
O filtro administrativo `revisaoPendente` identifica prazos atingidos ou vencidos,
sem envio automatico de notificacoes. Somente itens ativos sao publicos.

O envio de coleta usa o formato do formulario existente no frontend. O primeiro envio
pode criar o estabelecimento; nao altera cadastros existentes nem verifica titularidade.
Cada estabelecimento pode ter um envio por mes, inicialmente pendente e nao publicado.
ADMIN e SUPER_ADMIN podem corrigir valores pendentes e avaliar. Aprovar e publicar
sao operacoes separadas. O resumo publico expoe somente totais mensais de coletas
aprovadas, publicadas e vinculadas a estabelecimentos ativos.

As listas dos novos modulos possuem filtros e paginacao. A API nao transforma as
coletas automaticamente em registros genericos de indicadores. Os exemplos completos,
regras e consultas no pgAdmin estao em [inventario-pit.md](../docs/inventario-pit.md)
e [estabelecimentos-coletas.md](../docs/estabelecimentos-coletas.md).

## Preparacao do banco local

1. Crie no PostgreSQL um banco vazio chamado `observasrs`.
2. Configure `DATABASE_URL` no `.env` com sua senha local.
3. Defina `SUPER_ADMIN_SEED_NOME`, `SUPER_ADMIN_SEED_EMAIL` e
   `SUPER_ADMIN_SEED_SENHA`.
4. Execute `npm run db:setup`.
5. Inicie a API com `npm run dev`.
