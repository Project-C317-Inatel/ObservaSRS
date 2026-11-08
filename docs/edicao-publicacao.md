# Edicao de cadastros e publicacao de registros

## Preparacao

Com o PostgreSQL e o backend configurados, execute `npm run dev` na pasta `backend/`.
Nao e necessario recriar o banco, executar o seed ou aplicar novas migrations para esta etapa.

Abra `http://localhost:3333/docs` e execute `POST /auth/login` com uma conta `ADMIN` ou
`SUPER_ADMIN` aprovada e ativa. Todos os endpoints deste guia exigem essa sessao.
Sem login, a resposta e `401`; contas com papel `EDITOR` recebem `403`.

Use os endpoints `GET` para obter os IDs dos cadastros que deseja editar. No Swagger,
abra o `PATCH`, clique em **Try it out**, preencha o `id`, envie o JSON e clique em **Execute**.
Confira a resposta `200` e consulte novamente pelo ID para verificar a persistencia.

## Regras da edicao parcial

- Envie apenas os campos que devem mudar. Campos omitidos sao preservados.
- O corpo deve conter ao menos um campo permitido; `{}` e campos desconhecidos retornam `400`.
- IDs, datas de criacao e datas de atualizacao nao podem ser editados pelo corpo da requisicao.
- `descricao`, `referencia` e `observacao`, quando presentes no recurso, aceitam `null` para
  limpar o valor salvo. Os campos obrigatorios nao aceitam `null`.
- A resposta contem `message` e o recurso atualizado, como no cadastro.
- As operacoes atualizam o registro existente, preservando seu ID. Nenhuma delas exclui dados.

## Editar um setor

Execute `PATCH /admin/setores/{id}` com, por exemplo:

```json
{
  "nome": "Turismo e hospedagem",
  "descricao": "Indicadores de turismo e meios de hospedagem."
}
```

Campos permitidos: `nome`, `descricao` e `ativo`. As validacoes de tamanho do cadastro
continuam valendo, e o nome permanece unico. Nome duplicado retorna `409`.

Para desativar, envie somente:

```json
{
  "ativo": false
}
```

Para reativar, envie `{"ativo": true}`. Desativar um setor nao exclui indicadores ou registros,
nao altera o campo `ativo` dos indicadores e nao muda o campo `publicado` dos registros.
Indicadores de setores inativos nao podem receber novos registros, edicoes de registros
ou publicacoes enquanto essa situacao persistir.

## Editar um indicador

Execute `PATCH /admin/indicadores/{id}`:

```json
{
  "nome": "Total de leitos ocupados",
  "descricao": "Descricao revisada do indicador."
}
```

Campos permitidos: `nome`, `unidade`, `descricao`, `setorId` e `ativo`.
Para mudar o setor, informe o UUID real em `setorId`; o setor deve existir e estar ativo.
Enviar `ativo=true` tambem exige setor ativo. Editar os demais campos ou desativar o indicador
continua permitido em setor inativo. Campos omitidos, inclusive `ativo`, nao sao alterados.

Alterar setor ou unidade afeta a interpretacao dos registros ja vinculados ao indicador;
confira o historico antes de fazer essa mudanca. Desativar nao exclui registros nem altera
seus estados de publicacao.

## Editar uma fonte de dados

Execute `PATCH /admin/fontes-dados/{id}`:

```json
{
  "referencia": "Relatorio revisado de setembro de 2026.",
  "descricao": null
}
```

Campos permitidos: `nome`, `tipo`, `descricao` e `referencia`.
O exemplo atualiza a referencia e limpa a descricao, preservando nome e tipo.
Os registros ja vinculados continuam associados a mesma fonte e passam a apresentar
seus dados atualizados nas consultas.

## Editar um registro

Execute `PATCH /admin/registros-indicadores/{id}`:

```json
{
  "valor": "125.50",
  "observacao": "Valor corrigido apos conferencia."
}
```

Campos permitidos: `indicadorId`, `fonteId`, `periodo`, `valor` e `observacao`.
O indicador resultante e seu setor precisam estar ativos; a fonte deve existir.
Para mudar um vinculo, utilize o UUID real do indicador ou da fonte.

As regras do cadastro continuam valendo: data real no formato `AAAA-MM-DD`, valor com ponto
e ate duas casas decimais e combinacao unica de indicador, fonte e periodo. Uma alteracao
que criaria duplicidade retorna `409` e nao sobrescreve o outro registro.

Editar preserva o estado de publicacao atual, inclusive se o registro ja estiver publicado.
Para revisar um registro sem mante-lo marcado como publicado, despublique antes de editar.
O campo `publicado` nao e aceito neste endpoint; use a rota especifica abaixo.
O campo `atualizadoEm` e atualizado automaticamente. O valor retornado continua sendo uma
string com duas casas decimais, e a data continua sem horario.

## Publicar e despublicar

Execute `PATCH /admin/registros-indicadores/{id}/publicacao` com:

```json
{
  "publicado": true
}
```

Para despublicar, execute a mesma rota com:

```json
{
  "publicado": false
}
```

O campo `publicado` e obrigatorio e deve ser booleano, sem aspas.
Publicar exige indicador e setor ativos. Despublicar e permitido mesmo se o indicador ou
setor estiver inativo. Repetir o estado atual retorna `200`, respeitando a verificacao dos
vinculos ativos ao publicar. Os demais campos nao sao alterados.

O estado salvo controla a visibilidade em `GET /registros-indicadores` e
`GET /registros-indicadores/{id}`, que nao exigem login. Os registros devem estar publicados
e ter indicador e setor ativos. As consultas em `/admin` continuam exigindo sessao e permitem
conferir tambem os dados nao publicados. Veja [consulta-publica.md](consulta-publica.md).

## Verificar no pgAdmin

No Query Tool do banco utilizado pelo backend, execute:

```sql
SELECT id, nome, descricao, ativo FROM setor ORDER BY nome;
SELECT id, nome, unidade, setor_id, ativo FROM indicador ORDER BY nome;
SELECT id, nome, tipo, descricao, referencia FROM fonte_dado ORDER BY nome;
SELECT id, indicador_id, fonte_id, periodo, valor, publicado, observacao, atualizado_em
FROM registro_indicador
ORDER BY atualizado_em DESC;
```

## Erros esperados

| Codigo | Situacao                                                                                     |
| ------ | -------------------------------------------------------------------------------------------- |
| 400    | Corpo vazio, campo desconhecido, tipo incorreto, UUID, data ou valor invalido.               |
| 401    | Sessao ausente, invalida ou conta sem acesso ativo e aprovado.                               |
| 403    | Conta autenticada sem papel ADMIN ou SUPER_ADMIN.                                            |
| 404    | Cadastro ou vinculo informado nao encontrado.                                                |
| 409    | Nome de setor ou registro duplicado, ou vinculo inativo em uma operacao que exige atividade. |
