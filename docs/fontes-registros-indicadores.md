# Fontes de dados e registros de indicadores

## Preparacao

Com o PostgreSQL ligado e o `.env` configurado, execute na pasta `backend/`:

```powershell
npm run db:deploy
npm run dev
```

A migration adiciona `fonte_dado` e `registro_indicador`, sem alterar os usuarios, setores
ou indicadores existentes. Nao e necessario executar o seed novamente.

Abra `http://localhost:3333/docs`, entre por `POST /auth/login` e use os grupos
**Fontes de dados** e **Registros de indicadores**. Todos os endpoints deste guia exigem
uma conta `ADMIN` ou `SUPER_ADMIN` aprovada e ativa. `EDITOR` recebe `403`.

## Cadastrar uma fonte

Execute `POST /admin/fontes-dados`:

```json
{
  "nome": "Levantamento da SMCELT",
  "tipo": "levantamento",
  "descricao": "Levantamento de ocupacao dos meios de hospedagem.",
  "referencia": "Relatorio de ocupacao de setembro de 2026."
}
```

A resposta `201` contem `message` e `fonte`. Guarde `fonte.id`.
O nome deve ter de 2 a 150 caracteres; o tipo, de 1 a 50. Descricao e referencia sao
opcionais, com limite de 2000 caracteres cada. A referencia pode ser texto ou link.

## Cadastrar um registro

Tenha um indicador ativo vinculado a um setor ativo. Os passos desse cadastro estao em
[setores-indicadores.md](setores-indicadores.md).

Execute `POST /admin/registros-indicadores`:

```json
{
  "indicadorId": "22222222-2222-4222-8222-222222222222",
  "fonteId": "33333333-3333-4333-8333-333333333333",
  "periodo": "2026-09-01",
  "valor": "120.00",
  "publicado": false,
  "observacao": "Valor de demonstracao."
}
```

Substitua os UUIDs pelos IDs reais do indicador e da fonte cadastrados.
A resposta `201` contem `message` e `registro`, incluindo indicador, setor e fonte.

- `periodo`: data real no formato `AAAA-MM-DD`, sem horario. Para dados mensais, pode-se
  utilizar o primeiro dia do mes como referencia; o backend nao normaliza datas para esse dia.
- `valor`: numero ou string decimal com ponto, ate 12 digitos inteiros e 2 casas decimais.
  Prefira string para preservar a precisao. Casas decimais excedentes sao rejeitadas.
  Valores negativos sao aceitos, por exemplo para indicadores de variacao.
- `publicado`: booleano opcional, inicialmente `false`. `true` marca o registro como publicado,
  mas estes endpoints continuam protegidos; esta etapa nao cria consulta publica.
- `observacao`: texto opcional, com ate 2000 caracteres.

Nas respostas, `periodo` usa `AAAA-MM-DD` e `valor` e sempre uma string com duas casas decimais.
Por exemplo, uma entrada numerica `120.5` e retornada como `"120.50"`.
Os campos `criadoEm` e `atualizadoEm` sao preenchidos automaticamente.

A combinacao `indicadorId`, `fonteId` e `periodo` e unica. Repeti-la retorna `409`.
Um mesmo indicador pode ter registros no mesmo periodo com fontes diferentes.

## Consultas

| Metodo | Rota                                | Resultado                                                      |
| ------ | ----------------------------------- | -------------------------------------------------------------- |
| GET    | `/admin/fontes-dados`               | Lista `fontes`, ordenada pelo nome.                            |
| GET    | `/admin/fontes-dados/{id}`          | Objeto `fonte`.                                                |
| GET    | `/admin/registros-indicadores`      | Lista `registros`, do periodo mais recente para o mais antigo. |
| GET    | `/admin/registros-indicadores/{id}` | Objeto `registro`, com os dados vinculados.                    |

As fontes podem ser filtradas pelo tipo exato com `?tipo=levantamento`.
Os filtros opcionais dos registros podem ser combinados:

- `indicadorId`, `fonteId` e `setorId`: UUID do cadastro correspondente.
- `publicado`: `true` ou `false`; se omitido, inclui ambos.
- `periodoInicio` e `periodoFim`: datas inclusivas, tambem no formato `AAAA-MM-DD`.
  Podem ser usados separadamente. Se ambos forem informados, o inicio nao pode superar o fim.

Exemplo de consulta:

```http
GET /admin/registros-indicadores?periodoInicio=2026-09-01&periodoFim=2026-09-30&publicado=false
```

Consultas sem resultados retornam `200` e uma lista vazia.

## Conferir no pgAdmin

No Query Tool do banco configurado no backend, execute:

```sql
SELECT id, nome, tipo, descricao, referencia
FROM fonte_dado
ORDER BY nome;

SELECT r.id, i.nome AS indicador, s.nome AS setor, f.nome AS fonte,
       r.periodo, r.valor, r.publicado, r.observacao
FROM registro_indicador AS r
JOIN indicador AS i ON i.id = r.indicador_id
JOIN setor AS s ON s.id = i.setor_id
JOIN fonte_dado AS f ON f.id = r.fonte_id
ORDER BY r.periodo DESC, r.criado_em DESC;
```

## Erros esperados

| Codigo | Situacao                                                                                                              |
| ------ | --------------------------------------------------------------------------------------------------------------------- |
| 400    | Campos ou UUIDs invalidos, data inexistente, valor fora da precisao, filtro invalido ou intervalo de datas invertido. |
| 401    | Sessao ausente, invalida ou conta sem acesso ativo e aprovado.                                                        |
| 403    | Usuario autenticado sem papel `ADMIN` ou `SUPER_ADMIN`.                                                               |
| 404    | Indicador, fonte ou registro nao encontrado.                                                                          |
| 409    | Registro duplicado ou tentativa de registrar valor em indicador ou setor inativo.                                     |
