# Estabelecimentos e coleta autonoma

O formulario publico envia dados mensais para a SMCELT. A equipe pode corrigir um
envio pendente, aprovar ou rejeitar e, depois da aprovacao, publicar os totais.
Somente ADMIN e SUPER_ADMIN aprovados e ativos administram os estabelecimentos e
as coletas. EDITOR nao possui essa permissao.

## Preparar e abrir

Na pasta `backend/`, com PostgreSQL iniciado e `.env` configurado:

```powershell
npm run db:generate
npm run db:deploy
npm run dev
```

Abra `http://localhost:3333/docs`. A migracao `20261026180000_inventario_pit_coletas`
cria as tres tabelas dos novos modulos sem alterar contas, senhas ou dados anteriores.
Para atualizar um banco existente, nao e necessario executar `db:setup` ou o seed.

## 1. Enviar uma coleta sem login

No grupo **Coleta autonoma**, execute `POST /api/coletas`:

```json
{
  "nomeEstabelecimento": "Pousada Exemplo",
  "cnpjCadastur": "12.345.678/0001-90",
  "periodoReferencia": "2026-10",
  "leitosOcupados": 25,
  "origemVisitantes": "Minas Gerais e Sao Paulo"
}
```

O retorno esperado e **201**, com `message` e `coleta.id`, alem dos campos enviados
normalizados. Guarde o ID. O registro fica `PENDENTE` e `publicado=false` no banco.
Esta rota usa o mesmo caminho e formato do servico de coleta existente no frontend.
Nao foi necessario alterar arquivos do frontend.

`periodoReferencia` deve ser um mes valido `AAAA-MM`, com ano maior que zero. No banco,
fica na coluna `periodo`, como o primeiro dia do mes. A API apresenta `AAAA-MM`.
`leitosOcupados` precisa ser um numero inteiro entre 0 e 2147483647. Nao aceita
numero em texto ou casas decimais. `origemVisitantes` e texto resumido com ate 120
caracteres; pode ser vazio ou omitido. Nao envie nomes ou dados pessoais dos hospedes.

O identificador compartilhado `cnpjCadastur` e normalizado: remove pontos, barras,
hifens e espacos e converte letras para maiusculas. Aceita entre 3 e 30 letras ou
digitos depois dessa normalizacao. O exemplo e ficticio; o backend nao verifica
digitos de controle, autenticidade, titularidade ou regularidade em sistemas federais.

Se o identificador ainda nao existir, o primeiro envio cria um estabelecimento ativo
do tipo `Hospedagem`. Isso apenas permite receber o envio para avaliacao; nao aprova
nem publica a coleta. Se o cadastro ja existir, seus dados nao sao substituidos
pelo formulario publico. A coleta preserva o nome e o identificador informados no envio,
mesmo se a equipe editar o cadastro do estabelecimento depois.

Ha apenas uma coleta por estabelecimento e mes. Repetir retorna **409**, inclusive
para uma coleta rejeitada. Correcoes devem ser combinadas com a equipe; a API permite
editar os valores enquanto o envio ainda esta pendente. Nao ha reabertura ou substituicao
de envios ja avaliados. A rota publica permite 30 tentativas por IP por hora; acima
disso retorna **429**. O contador fica na memoria da instancia da API.

## 2. Gerenciar o estabelecimento

Faca login em `POST /auth/login`. No grupo **Estabelecimentos**, use
`GET /admin/estabelecimentos?busca=12345678000190` para encontrar o cadastro criado.
As listas sao paginadas (`pagina=1`, `limite=20`, maximo 100) e aceitam `ativo`,
`tipo` exato e `busca` parcial em nome ou identificador normalizado. Ordem: nome e ID.

Tambem e possivel cadastrar antes do primeiro envio:

```http
POST /admin/estabelecimentos
```

```json
{
  "nome": "Hotel Demonstracao",
  "cnpjCadastur": "98.765.432/0001-10",
  "tipo": "Hotel",
  "ativo": true
}
```

`GET /admin/estabelecimentos/{id}` consulta um cadastro.
`PATCH /admin/estabelecimentos/{id}` permite editar nome, identificador, tipo e ativo.
Envie `{ "ativo": false }` para desativar ou `{ "ativo": true }` para reativar.
Identificador ja utilizado retorna **409**. A edicao parcial preserva campos omitidos.

Desativar bloqueia novos envios e impede aprovar ou publicar coletas. Tambem retira
as coletas do resumo publico, sem apagar ou modificar o historico de aprovacao e
publicacao. Reativar restaura a visibilidade das coletas que permanecem publicadas.
Para manter alguma delas oculta apos a reativacao, despublique-a explicitamente.

## 3. Consultar e corrigir uma coleta pendente

No grupo **Gestao de coletas**, execute:

```http
GET /admin/coletas?status=PENDENTE&periodoReferencia=2026-10
GET /admin/coletas/{id}
```

A lista retorna `coletas` e `paginacao` e tambem aceita `estabelecimentoId` e
`publicado`. Sem filtros inclui todos os estados. Ordem: envio decrescente e ID crescente.
Os detalhes mostram o estabelecimento atual, os dados originais do envio e a avaliacao.
Do avaliador, retorna apenas ID e nome, sem senha, e-mail ou sessao.

Antes de aprovar, se necessario, use `PATCH /admin/coletas/{id}`:

```json
{
  "leitosOcupados": 28,
  "origemVisitantes": "Minas Gerais, Sao Paulo e Rio de Janeiro"
}
```

Somente esses dois campos podem ser corrigidos e apenas enquanto `PENDENTE`.
Mes e identidade nao podem ser trocados. A API rejeita campos desconhecidos e corpos
vazios com **400**, e edicao de uma coleta avaliada com **409**.

## 4. Aprovar ou rejeitar

Para aprovar, execute `PATCH /admin/coletas/{id}/aprovar` sem corpo ou com `{}`.
Isso registra `status=APROVADO`, `validadoEm` e `validadoPorId` com o usuario da sessao.
O estabelecimento precisa estar ativo. A coleta ainda nao entra no resumo publico.

Para rejeitar outro envio pendente, use `PATCH /admin/coletas/{id}/rejeitar`.
Nao e exigido motivo. O envio fica no historico como `REJEITADO`, sem publicacao.
Rejeitar e permitido mesmo se o estabelecimento estiver inativo.

Uma coleta avaliada nao pode ser aprovada ou rejeitada novamente (**409**).
Edicao e avaliacao fazem atualizacoes condicionais para detectar mudancas concorrentes.

## 5. Publicar e consultar o resumo

Em `PATCH /admin/coletas/{id}/publicacao`, envie:

```json
{ "publicado": true }
```

Somente coletas aprovadas e de estabelecimentos ativos podem ser publicadas.
A API preenche `publicadoEm`. Para retirar dos totais, envie `{ "publicado": false }`;
isso tambem limpa `publicadoEm`. Despublicar e permitido com estabelecimento inativo.
Repetir o mesmo estado retorna **200** e preserva a data da publicacao.

Sem login, consulte:

```http
GET /coletas/resumo?periodoReferencia=2026-10
```

Exemplo, se apenas o envio corrigido acima estiver publicado nesse mes:

```json
{
  "resumo": {
    "periodoReferencia": "2026-10",
    "estabelecimentos": 1,
    "leitosOcupados": 28
  }
}
```

O resumo soma apenas coletas `APROVADO`, publicadas e de estabelecimentos ativos.
Sem resultados, retorna zeros. Nao expoe identificadores, nomes, origens em texto livre,
avaliadores ou envios individuais. A soma e dos valores informados para aquele mes;
nao representa automaticamente percentual de ocupacao, visitantes ou leitos diarios.
Nao ha conversao automatica em `registro_indicador` nem alteracao dos cards do frontend.

Como o formulario e publico e nao autentica o remetente, a SMCELT deve conferir a
procedencia antes de aprovar. O recebimento do envio nao comprova vinculo com o estabelecimento.

## Conferir no pgAdmin

Atualize `observasrs > Schemas > public > Tables`. Use **View/Edit Data > All Rows**
em `estabelecimento` e `submissao_coleta`, ou consulte:

```sql
SELECT id, nome, cnpj_cadastur, tipo, ativo
FROM estabelecimento
ORDER BY nome;

SELECT c.id, e.nome, c.periodo, c.leitos_ocupados, c.status,
       c.publicado, c.validado_em, c.validado_por, c.publicado_em
FROM submissao_coleta c
JOIN estabelecimento e ON e.id = c.estabelecimento_id
ORDER BY c.enviado_em DESC;
```

As rotas administrativas exigem sessao (**401** se ausente ou invalida) e papel
ADMIN ou SUPER_ADMIN (**403** caso contrario). ID inexistente retorna **404**.
As tabelas nao possuem exclusao definitiva pela API; o historico e preservado.
