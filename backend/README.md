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
npm run db:setup     # aplica migrations e cria o super administrador inicial
npm run db:migrate   # cria/aplica migrations durante o desenvolvimento
npm run db:studio    # abre a interface visual do Prisma
```

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

## Preparacao do banco local

1. Crie no PostgreSQL um banco vazio chamado `observasrs`.
2. Configure `DATABASE_URL` no `.env` com sua senha local.
3. Defina `SUPER_ADMIN_SEED_NOME`, `SUPER_ADMIN_SEED_EMAIL` e
   `SUPER_ADMIN_SEED_SENHA`.
4. Execute `npm run db:setup`.
5. Inicie a API com `npm run dev`.
