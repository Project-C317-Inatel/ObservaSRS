# Cadastro de setores e indicadores

## Preparar o banco

Com o PostgreSQL ligado e o `.env` do backend configurado, execute na pasta `backend/`:

```powershell
npm run db:deploy
npm run dev
```

A migration adiciona as tabelas `setor` e `indicador`. Ela nao altera as contas existentes.
Nao e necessario executar `db:seed` para atualizar um banco ja preparado.

## Entrar no Swagger

1. Abra `http://localhost:3333/docs`.
2. Execute `POST /auth/login` com uma conta `ADMIN` ou `SUPER_ADMIN` aprovada e ativa.
3. Confirme o retorno `200`. O cookie da sessao e armazenado automaticamente.
4. Abra os grupos **Setores** e **Indicadores**.

Todas as rotas deste guia exigem uma sessao administrativa. O papel `EDITOR` recebe `403`.
A aprovacao e rejeicao das contas em `/admin/solicitacoes` continuam exclusivas do super administrador.

## Cadastrar um setor

Execute `POST /admin/setores` com:

```json
{
  "nome": "Hospedagem",
  "descricao": "Hoteis, pousadas e outros meios de hospedagem."
}
```

O retorno esperado e `201`, com `message` e `setor`. Copie o campo `setor.id`.
O identificador e um UUID, seguindo o padrao dos usuarios administrativos.

O nome deve ter de 2 a 100 caracteres e e unico. A descricao e opcional, com limite de
2000 caracteres. O campo opcional `ativo` aceita um booleano e tem valor inicial `true`.

Se o nome ja estiver cadastrado, a resposta sera `409`. Consulte a listagem para recuperar
o ID do setor existente.

## Cadastrar um indicador

Execute `POST /admin/indicadores` com:

```json
{
  "nome": "Leitos ocupados",
  "unidade": "leitos",
  "descricao": "Quantidade de leitos ocupados nos meios de hospedagem.",
  "setorId": "22222222-2222-4222-8222-222222222222"
}
```

Substitua o UUID de exemplo pelo `setor.id` retornado no cadastro anterior.
O retorno esperado e `201`, com `message` e `indicador`, incluindo os dados do setor.

O nome deve ter de 2 a 140 caracteres; a unidade, de 1 a 40. A descricao e opcional,
com limite de 2000 caracteres. O campo opcional `ativo` tem valor inicial `true`.
O setor deve existir e estar ativo. Um setor pode possuir varios indicadores.

Este cadastro define o indicador e sua unidade de medida; nao registra valores por periodo.

## Consultar os cadastros

| Metodo | Rota                      | Resultado                                                                    |
| ------ | ------------------------- | ---------------------------------------------------------------------------- |
| GET    | `/admin/setores`          | Objeto com a lista `setores`, ordenada pelo nome.                            |
| GET    | `/admin/setores/{id}`     | Objeto com o `setor` encontrado.                                             |
| GET    | `/admin/indicadores`      | Objeto com a lista `indicadores`, ordenada pelo nome e incluindo os setores. |
| GET    | `/admin/indicadores/{id}` | Objeto com o `indicador` encontrado e seu setor.                             |

Nas duas listagens, `ativo=true` filtra os ativos e `ativo=false` filtra os inativos.
Quando o parametro e omitido, ambos sao retornados. A listagem de indicadores tambem
aceita `setorId`, que pode ser combinado com `ativo`.

Exemplos:

```http
GET /admin/setores?ativo=true
GET /admin/indicadores?setorId=22222222-2222-4222-8222-222222222222&ativo=true
```

Uma consulta sem resultados retorna `200` e uma lista vazia.

## Verificar no pgAdmin

No Query Tool do banco configurado em `DATABASE_URL`, execute:

```sql
SELECT id, nome, descricao, ativo
FROM setor
ORDER BY nome;

SELECT i.id, i.nome, i.unidade, s.nome AS setor, i.ativo, i.criado_em
FROM indicador AS i
JOIN setor AS s ON s.id = i.setor_id
ORDER BY i.nome;
```

Atualize a consulta depois dos cadastros para conferir os registros persistidos.

## Respostas de erro

| Codigo | Situacao                                                                                             |
| ------ | ---------------------------------------------------------------------------------------------------- |
| 400    | Campos invalidos, UUID malformado ou filtro `ativo` diferente de `true` e `false`.                   |
| 401    | Sessao ausente, invalida ou conta sem acesso ativo e aprovado.                                       |
| 403    | Usuario autenticado sem papel `ADMIN` ou `SUPER_ADMIN`.                                              |
| 404    | Setor ou indicador nao encontrado na consulta por ID, ou setor inexistente no cadastro de indicador. |
| 409    | Nome de setor duplicado ou tentativa de cadastrar indicador em setor inativo.                        |
