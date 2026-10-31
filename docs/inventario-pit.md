# Inventario turistico PIT

O modulo cadastra atrativos, equipamentos e servicos turisticos. ADMIN e SUPER_ADMIN
aprovados e ativos podem manter o inventario. A consulta publica mostra somente itens
ativos. EDITOR nao possui permissao para administrar este modulo.

## Preparar o banco e abrir o Swagger

Na pasta `backend/`, com PostgreSQL iniciado e `.env` configurado:

```powershell
npm run db:generate
npm run db:deploy
npm run dev
```

A migracao `20261026180000_inventario_pit_coletas` adiciona `item_pit`,
`estabelecimento`, `submissao_coleta` e os relacionamentos. Nao recria o banco nem
executa o seed. Contas e dados anteriores sao preservados.

Abra `http://localhost:3333/docs`, faca login em `POST /auth/login` e localize
**Inventario PIT**. O cookie da sessao e utilizado automaticamente.

## Cadastrar e consultar

Em `POST /admin/itens-pit`, clique em **Try it out**, preencha e execute:

```json
{
  "nome": "Museu Municipal",
  "categoria": "Museu / Cultura",
  "descricao": "Acervo historico e cultural do municipio.",
  "imagemUrl": null,
  "localizacao": "Centro",
  "ativo": true
}
```

O retorno esperado e **201**, com `item.id`. Nome, categoria e localizacao sao
obrigatorios. Categoria e texto livre, permitindo usar os mesmos nomes do frontend.
`imagemUrl` aceita apenas HTTP ou HTTPS, ou `null`. O backend armazena a URL sem
buscar a imagem; este modulo nao faz upload de imagens.

Use `GET /admin/itens-pit` e `GET /admin/itens-pit/{id}` para conferir o cadastro.
As listas retornam `itens` e `paginacao`, com `pagina`, `limite`, `total` e
`totalPaginas`. O padrao e pagina 1 e limite 20, com maximo de 100 itens por pagina.
Ordenacao: nome crescente e ID crescente como desempate.

Filtros administrativos:

| Parametro          | Uso                                                                  |
| ------------------ | -------------------------------------------------------------------- |
| `categoria`        | Nome exato da categoria                                              |
| `busca`            | Trecho de nome, descricao ou localizacao, sem diferenciar maiusculas |
| `ativo`            | `true` ou `false`; omitido inclui ambos                              |
| `revisaoPendente`  | `true` para prazo atingido/vencido; `false` para prazo futuro        |
| `pagina`, `limite` | Paginacao                                                            |

## Editar, desativar e reativar

`PATCH /admin/itens-pit/{id}` recebe somente os campos que devem mudar:

```json
{
  "descricao": "Acervo atualizado e novas exposicoes.",
  "localizacao": "Praca Central"
}
```

Para desativar, envie `{ "ativo": false }`. Para reativar, `{ "ativo": true }`.
Campos omitidos sao preservados; `descricao` e `imagemUrl` aceitam `null` para limpar.
Corpo vazio e atributos desconhecidos retornam **400**. Nao ha exclusao definitiva.

Um item ativo pode ser consultado sem login em `GET /itens-pit` e
`GET /itens-pit/{id}`. As rotas publicas aceitam `categoria`, `busca`, `pagina` e
`limite`, mas rejeitam filtros administrativos. Um item inativo retorna **404** na
consulta publica por ID, mesmo com uma sessao administrativa no navegador.
Ativar o item torna os dados publicos imediatamente; nao existe aprovacao separada do PIT.

## Revisao periodica

O cadastro preenche `revisadoEm` e agenda `revisaoPrevistaEm` para 180 dias depois
do dia atual UTC, quando uma data nao e informada. Uma data explicita usa `AAAA-MM-DD`
e precisa ser posterior ao dia atual UTC. Exemplo: `2099-12-31` para uma demonstracao.

`revisaoPendente` e calculado quando o prazo chega ou vence. Para conferir as pendencias:

```http
GET /admin/itens-pit?ativo=true&revisaoPendente=true
```

Depois de conferir as informacoes do item, execute `PATCH /admin/itens-pit/{id}/revisao`:

```json
{}
```

Isso registra o instante da revisao e agenda outros 180 dias. Tambem e possivel enviar
`{ "revisaoPrevistaEm": "2099-12-31" }`. Editar o cadastro ou apenas mudar o prazo
na edicao nao confirma uma revisao. As datas internas de revisao sao administrativas;
a consulta publica apresenta `atualizadoEm` como data da ultima atualizacao.

O lembrete consiste no estado e no filtro de pendencias retornados pela API.
Nao ha envio automatico de e-mail, tarefa agendada ou notificacao no frontend.
Itens vencidos continuam publicos enquanto ativos; a equipe decide se deve desativa-los.

## Conferir no pgAdmin

Em `observasrs > Schemas > public > Tables`, atualize a lista e abra `item_pit`
com **View/Edit Data > All Rows**, ou execute:

```sql
SELECT id, nome, categoria, localizacao, ativo,
       atualizado_em, revisado_em, revisao_prevista_em
FROM item_pit
ORDER BY nome;
```

Sem login, as rotas administrativas retornam **401**. Conta sem permissao retorna
**403**. ID inexistente retorna **404**, e campos ou datas invalidos retornam **400**.
