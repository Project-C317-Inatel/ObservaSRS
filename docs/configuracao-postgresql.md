# Configuracao e uso do PostgreSQL no ObservaSRS

Este guia mostra como preparar o PostgreSQL local, conectar o pgAdmin, criar o banco do projeto,
executar as migrations, testar a API pelo Swagger e visualizar os dados gravados.

## 1. Requisitos

Antes de comecar, instale:

- PostgreSQL;
- pgAdmin;
- Node.js 22 ou superior;
- npm 10 ou superior.

O projeto utiliza as seguintes configuracoes locais por padrao:

| Configuracao | Valor        |
| ------------ | ------------ |
| Servidor     | `localhost`  |
| Porta        | `5432`       |
| Usuario      | `postgres`   |
| Banco        | `observasrs` |

## 2. Entender as senhas

O pgAdmin e o PostgreSQL utilizam senhas com finalidades diferentes.

### Senha mestra do pgAdmin

A senha mestra protege as credenciais salvas dentro do pgAdmin. Ela nao autentica a aplicacao no
banco e nao deve ser colocada em `DATABASE_URL`.

### Senha do usuario postgres

Essa senha foi definida durante a instalacao do PostgreSQL. Ela autentica o usuario `postgres` e
deve ser usada:

- na janela **Connect to server** do pgAdmin;
- no campo `DATABASE_URL` do arquivo `backend/.env`;
- no comando `psql`, quando solicitado.

Ao digitar a senha no pgAdmin, informe apenas a senha, sem aspas e sem a URL completa.

## 3. Registrar o servidor no pgAdmin

Na tela inicial do pgAdmin:

1. Clique em **Add New Server**; ou clique com o botao direito em **Servers**.
2. Selecione **Register > Server**.
3. Na aba **General**, preencha:

   ```text
   Name: PostgreSQL Local
   ```

4. Na aba **Connection**, preencha:

   | Campo                | Valor                       |
   | -------------------- | --------------------------- |
   | Host name/address    | `localhost`                 |
   | Port                 | `5432`                      |
   | Maintenance database | `postgres`                  |
   | Username             | `postgres`                  |
   | Password             | senha do usuario `postgres` |

5. Marque **Save Password**, se desejar.
6. Clique em **Save**.

Se o pgAdmin pedir a senha novamente depois de reiniciar o computador, utilize a senha do usuario
`postgres`, nao a senha mestra do pgAdmin.

## 4. Criar o banco observasrs

Depois de conectar o servidor:

1. Expanda **Servers > PostgreSQL Local**.
2. Clique com o botao direito em **Databases**.
3. Selecione **Create > Database**.
4. Preencha:

   ```text
   Database: observasrs
   Owner: postgres
   ```

5. Clique em **Save**.

Tambem e possivel criar o banco pelo terminal:

```powershell
psql -U postgres -c "CREATE DATABASE observasrs;"
```

Se o banco ja existir, nao e necessario cria-lo novamente.

## 5. Configurar o arquivo .env

Abra um terminal na pasta raiz do projeto e entre no backend:

```powershell
cd backend
```

Se ainda nao existir um arquivo `.env`, crie-o a partir do exemplo:

```powershell
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

Configure o arquivo `backend/.env`:

```env
NODE_ENV=development
PORT=3333
CORS_ORIGIN=http://localhost:5173
DATABASE_URL="postgresql://postgres:SENHA_DO_POSTGRES@localhost:5432/observasrs"
JWT_SECRET=uma-chave-secreta-com-pelo-menos-32-caracteres
JWT_EXPIRES_IN_SECONDS=3600
AUTH_COOKIE_NAME=observasrs_sessao
SUPER_ADMIN_SEED_NOME=Administrador SMCELT
SUPER_ADMIN_SEED_EMAIL=admin@observasrs.local
SUPER_ADMIN_SEED_SENHA=uma-senha-segura
```

Substitua `SENHA_DO_POSTGRES` pela senha real do usuario `postgres`. As aspas externas protegem o
valor do arquivo `.env`, mas nao fazem parte da senha.

Nao envie o `.env` para outras pessoas e nao o adicione ao Git. O arquivo ja esta ignorado pelo
repositorio.

### Senhas com caracteres especiais

Caracteres como `@`, `#`, `/`, `%` e `:` possuem significado especial em URLs. Se a senha do
PostgreSQL possuir esses caracteres, eles precisam ser codificados na `DATABASE_URL`. Para evitar
essa dificuldade no primeiro ambiente local, pode-se utilizar uma senha longa com letras e numeros.

## 6. Instalar as dependencias

Na pasta `back`, execute:

```powershell
npm ci
```

Esse comando instala exatamente as dependencias registradas em `package-lock.json`.

## 7. Preparar as tabelas e o super administrador

Execute:

```powershell
npm run db:setup
```

Esse comando:

1. gera o Prisma Client;
2. aplica as migrations ainda pendentes;
3. cria ou atualiza o super administrador definido no `.env`.

O resultado deve terminar com uma mensagem semelhante a:

```text
Super administrador preparado: admin@observasrs.local
```

O comando pode ser executado novamente sem duplicar o super administrador. Entretanto, ele atualiza
o nome e a senha dessa conta conforme os valores atuais do `.env`.

No uso diario, nao e necessario executar `db:setup` sempre que ligar o computador. Depois da
configuracao inicial, normalmente basta executar `npm run dev`.

## 8. Iniciar a API

Execute:

```powershell
npm run dev
```

Mantenha esse terminal aberto. A mensagem esperada e:

```text
ObservaSRS API executando em http://localhost:3333
```

## 9. Abrir e usar o Swagger

Com a API em execucao, abra no navegador:

```text
http://localhost:3333/docs
```

Para testar uma rota:

1. clique na rota para expandi-la;
2. clique em **Try it out**;
3. preencha os campos;
4. clique em **Execute**;
5. confira o codigo e o corpo em **Server response**.

O login grava um cookie `HttpOnly` automaticamente. Nao e necessario copiar um token ou preencher
manualmente o botao **Authorize**.

### 9.1 Verificar o servidor

Execute:

```http
GET /status
```

Resposta esperada, com codigo `200`:

```json
{
  "status": "positivo",
  "servico": "observasrs-api"
}
```

Essa rota confirma que a API esta em execucao, mas nao consulta o PostgreSQL.

### 9.2 Criar uma solicitacao de administrador

Execute:

```http
POST /auth/registro
```

Corpo de exemplo:

```json
{
  "nome": "Administrador de Teste",
  "email": "admin.teste@observasrs.local",
  "senha": "SenhaTeste123"
}
```

A resposta deve ter codigo `201`, papel `ADMIN`, status `PENDENTE` e um `id` UUID. Guarde esse
identificador para aprovar ou rejeitar a solicitacao.

O e-mail e unico. Para repetir o teste, utilize outro e-mail ou remova o registro de teste de forma
consciente.

### 9.3 Confirmar o bloqueio da conta pendente

Execute `POST /auth/login` com a conta criada:

```json
{
  "email": "admin.teste@observasrs.local",
  "senha": "SenhaTeste123"
}
```

A resposta esperada e `403` com o codigo `account_pending`. Isso confirma que uma solicitacao nao
recebe acesso automaticamente.

### 9.4 Entrar como super administrador

Execute novamente `POST /auth/login`, agora com os valores de `SUPER_ADMIN_SEED_EMAIL` e
`SUPER_ADMIN_SEED_SENHA` do `.env`:

```json
{
  "email": "admin@observasrs.local",
  "senha": "SENHA_CONFIGURADA_NO_ENV"
}
```

Use a senha real no Swagger. A resposta deve ter codigo `200`, papel `SUPER_ADMIN` e status
`APROVADO`.

Depois, execute:

```http
GET /auth/me
```

Essa rota confirma que o cookie da sessao esta valido.

### 9.5 Listar solicitacoes pendentes

Execute:

```http
GET /admin/solicitacoes?status=PENDENTE
```

A conta de teste deve aparecer na lista. Copie seu campo `id`.

### 9.6 Aprovar uma solicitacao

Execute:

```http
PATCH /admin/solicitacoes/{id}/aprovar
```

Cole o UUID no parametro `id`. Nao envie corpo na requisicao. A resposta deve mostrar:

```json
{
  "message": "Conta aprovada com sucesso.",
  "solicitacao": {
    "status": "APROVADO",
    "ativo": true
  }
}
```

### 9.7 Rejeitar uma solicitacao

Para testar a rejeicao, cadastre outra conta e execute:

```http
PATCH /admin/solicitacoes/{id}/rejeitar
```

A rejeicao nao exige corpo nem justificativa. A conta permanece salva com status `REJEITADO` e
`ativo` igual a `false`.

## 10. Visualizar os dados no pgAdmin

No painel esquerdo, expanda:

```text
Servers
`-- PostgreSQL Local
    `-- Databases
        `-- observasrs
            `-- Schemas
                `-- public
                    `-- Tables
                        `-- user_admin
```

Depois:

1. clique com o botao direito em `user_admin`;
2. selecione **View/Edit Data**;
3. clique em **All Rows**.

Se a tabela ou os dados nao aparecerem, clique com o botao direito em **Tables** e selecione
**Refresh**.

O projeto utiliza uma unica tabela para todas as contas administrativas. O campo `papel` diferencia
`SUPER_ADMIN`, `ADMIN` e `EDITOR`. O campo `status` diferencia `PENDENTE`, `APROVADO` e `REJEITADO`.

A coluna `senha_hash` contem a representacao protegida da senha por bcrypt. Nao tente descobrir ou
editar manualmente esse valor.

## 11. Consultar os registros com SQL

Selecione o banco `observasrs`, abra **Tools > Query Tool** e execute:

```sql
SELECT
    id,
    nome,
    email,
    papel,
    status,
    ativo,
    avaliado_em,
    avaliado_por_id,
    criado_em,
    atualizado_em
FROM public.user_admin
ORDER BY criado_em;
```

O resultado esperado apos criar uma solicitacao e semelhante a:

```text
Administrador SMCELT   | SUPER_ADMIN | APROVADO | true
Administrador de Teste | ADMIN       | PENDENTE | false
```

Depois da aprovacao, a conta de teste deve mudar para `APROVADO` e `true`.

## 12. Comandos de uso diario

Para iniciar o backend depois de ligar o computador:

```powershell
cd backend
npm run dev
```

Execute `npm run db:setup` novamente apenas quando:

- estiver configurando o projeto pela primeira vez;
- o banco tiver sido recriado;
- novas migrations tiverem sido adicionadas ao projeto;
- for necessario atualizar o super administrador com os dados do `.env`.

## 13. Solucao de problemas

### Erro P1000

```text
Authentication failed against database server
```

Esse erro significa que o PostgreSQL foi encontrado, mas recusou as credenciais. Verifique:

- se foi usada a senha do usuario `postgres`, e nao a senha mestra do pgAdmin;
- se a senha do `.env` e a mesma aceita pelo pgAdmin;
- se o usuario e `postgres`;
- se nao existem espacos ou aspas fazendo parte da senha;
- se caracteres especiais foram codificados corretamente na URL.

Teste a conexao diretamente:

```powershell
psql -h localhost -p 5432 -U postgres -d observasrs
```

Digite a senha quando solicitado. Use `\q` para sair.

Se a senha tiver sido esquecida, mas o pgAdmin ainda estiver conectado, abra o **Query Tool** no
banco `postgres` e execute:

```sql
ALTER USER postgres WITH PASSWORD 'NOVA_SENHA_LOCAL';
```

As aspas simples pertencem ao comando SQL e nao fazem parte da senha. Depois, atualize
`DATABASE_URL` no `.env` com o mesmo valor.

### A API funciona, mas o banco nao

`GET /status` nao acessa o PostgreSQL. Para testar uma conexao real, execute `npm run db:setup` ou
utilize uma rota que leia ou grave dados, como `POST /auth/registro`.

### A tabela user_admin nao aparece

1. Confirme que o banco selecionado e `observasrs`.
2. Execute `npm run db:setup`.
3. No pgAdmin, atualize **Schemas > public > Tables**.

### O super administrador nao aparece

Execute:

```powershell
npm run db:seed
```

Depois, atualize `user_admin` no pgAdmin. O seed utiliza as variaveis `SUPER_ADMIN_SEED_NOME`,
`SUPER_ADMIN_SEED_EMAIL` e `SUPER_ADMIN_SEED_SENHA`.
