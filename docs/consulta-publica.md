# Consulta publica de indicadores

## Preparacao

Com o PostgreSQL configurado e em execucao, inicie o backend com `npm run dev` na pasta
`backend/` e abra `http://localhost:3333/docs`. Use o grupo **Consulta publica** do Swagger.
Nao ha novas migrations ou dependencias para esta etapa.

As rotas publicas nao exigem login e aplicam as mesmas restricoes de visibilidade mesmo
quando o navegador possui uma sessao de administrador ou super administrador.

## Rotas disponiveis

| Metodo | Rota                          | Resultado                                                 |
| ------ | ----------------------------- | --------------------------------------------------------- |
| GET    | `/setores`                    | Lista paginada `setores`.                                 |
| GET    | `/setores/{id}`               | Objeto `setor`.                                           |
| GET    | `/indicadores`                | Lista paginada `indicadores`, com setor associado.        |
| GET    | `/indicadores/{id}`           | Objeto `indicador`, com setor associado.                  |
| GET    | `/registros-indicadores`      | Lista paginada `registros`, com indicador, setor e fonte. |
| GET    | `/registros-indicadores/{id}` | Objeto `registro`, com indicador, setor e fonte.          |

Somente setores ativos sao retornados. Os indicadores devem estar ativos e vinculados a
setores ativos. Esses catalogos podem incluir cadastros que ainda nao tenham registros publicados.

Os registros devem ter `publicado=true`, indicador ativo e setor ativo. Nas consultas por
ID, registros nao publicados ou com vinculos inativos retornam `404`, assim como IDs inexistentes.
Setores e indicadores inativos tambem retornam `404` nas consultas individuais.

## Paginacao

As tres listagens aceitam:

- `pagina`: inteiro de 1 a 1000000; padrao 1.
- `limite`: inteiro de 1 a 100; padrao 20.

Exemplo:

```http
GET /registros-indicadores?pagina=1&limite=10
```

As respostas incluem os itens e o objeto `paginacao`, por exemplo:

```json
{
  "registros": [],
  "paginacao": {
    "pagina": 1,
    "limite": 10,
    "total": 0,
    "totalPaginas": 0
  }
}
```

`total` conta somente os itens que respeitam os filtros e as regras de visibilidade,
antes de aplicar a pagina. Paginas alem do total retornam `200` com lista vazia, preservando
o total real. Setores e indicadores sao ordenados por nome e ID crescentes. Registros sao
ordenados por periodo decrescente e ID crescente como desempate.

## Filtros

`GET /indicadores` aceita `setorId`, que deve ser um UUID valido.

`GET /registros-indicadores` aceita:

- `indicadorId`, `fonteId` e `setorId`: UUID do cadastro correspondente.
- `periodoInicio` e `periodoFim`: datas reais no formato `AAAA-MM-DD`, inclusivas.
  Podem ser usados separadamente. O inicio nao pode superar o fim.

Os filtros podem ser combinados com a paginacao. Por exemplo, substituindo o UUID por um ID real:

```http
GET /registros-indicadores?setorId=22222222-2222-4222-8222-222222222222&periodoInicio=2026-09-01&periodoFim=2026-09-30&pagina=1&limite=20
```

Um UUID valido sem itens visiveis retorna lista vazia, nao `404`.
Filtros desconhecidos sao rejeitados com `400`, incluindo `publicado`, `ativo` e parametros
de ordenacao nao suportados. Essas regras nao podem ser alteradas pelo visitante.

## Campos publicos

- Setor: `id`, `nome` e `descricao`.
- Indicador: `id`, `nome`, `unidade`, `descricao`, `setorId` e `setor`.
- Registro: `id`, `indicadorId`, `fonteId`, `periodo`, `valor`, `indicador` e `fonte`.
- Fonte associada: `id`, `nome`, `descricao`, `tipo` e `referencia`.

O periodo e retornado sem horario, como `2026-09-01`, e o valor e uma string decimal com
duas casas, como `"125.50"`. O backend retorna registros individuais, sem somar ou agrupar
valores de indicadores ou fontes diferentes.

Observacoes dos registros, campos `ativo` e `publicado` e datas de controle interno nao
sao incluidos. As rotas publicas nao permitem cadastrar, editar ou publicar dados.

## Conferir publicacao no Swagger

1. Execute `POST /auth/login` com uma conta ADMIN ou SUPER_ADMIN aprovada e ativa.
2. Cadastre ou localize um setor ativo, um indicador ativo, uma fonte e um registro nao publicado.
   Os exemplos estao em [fontes-registros-indicadores.md](fontes-registros-indicadores.md).
3. Guarde o ID do registro e consulte `GET /registros-indicadores/{id}`: o resultado deve ser `404`.
4. Execute `PATCH /admin/registros-indicadores/{id}/publicacao` com `{"publicado": true}`.
5. Repita a consulta publica: o resultado deve ser `200`, sem observacao ou campos administrativos.
6. Execute `POST /auth/logout` e consulte novamente: continua retornando `200`, sem login.
7. Entre novamente e despublique o registro com `{"publicado": false}` na mesma rota de publicacao.
8. A consulta publica por ID volta a retornar `404`, e o registro desaparece das listas publicas.

Desativar o indicador ou setor tambem oculta seus registros, mesmo se `publicado=true`.
Isso nao exclui dados nem altera o estado salvo. Reativar os vinculos torna esses registros
publicados visiveis novamente. Despublicar impede que reaparecam apenas pela reativacao.

As respostas publicas usam `Cache-Control: no-store` para evitar armazenamento no cache HTTP.
Isso nao remove dados que um visitante ja tenha obtido, copiado ou esteja exibindo na tela.

## Erros esperados

| Codigo | Situacao                                                     |
| ------ | ------------------------------------------------------------ |
| 200    | Consulta concluida, inclusive listas vazias.                 |
| 400    | UUID, data, intervalo, paginacao ou filtro invalido.         |
| 404    | Consulta individual sem recurso visivel para o ID informado. |

As rotas em `/admin` preservam autenticacao e permissoes, e suas respostas nao mudaram.
