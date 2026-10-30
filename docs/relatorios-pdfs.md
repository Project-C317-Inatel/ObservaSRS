# Relatorios e PDFs

## Preparacao

Na pasta `backend/`, com o PostgreSQL em execucao e o `.env` configurado:

```powershell
npm ci
npm run db:deploy
npm run dev
```

A migration cria `relatorio` e o tipo `TipoRelatorio`, sem apagar os dados existentes.
Nao e necessario executar o seed novamente. Abra `http://localhost:3333/docs`.

No Swagger, use os grupos **Relatorios** e **Relatorios publicos**.
As rotas em `/admin/relatorios` exigem ADMIN ou SUPER_ADMIN aprovado e ativo. EDITOR recebe
`403`, e requisicoes sem sessao recebem `401`. As consultas publicas nao exigem login.

## Cadastrar os metadados

Entre por `POST /auth/login` e execute `POST /admin/relatorios`:

```json
{
  "titulo": "Ocupacao hoteleira - terceiro trimestre de 2026",
  "descricao": "Relatorio de ocupacao dos meios de hospedagem.",
  "tipo": "TRIMESTRAL",
  "periodoReferencia": "2026-T3"
}
```

O resultado esperado e `201`, com `message` e `relatorio`. Guarde `relatorio.id`.

- `titulo`: obrigatorio, de 2 a 180 caracteres.
- `descricao`: opcional, com ate 2000 caracteres.
- `tipo`: obrigatorio; `TRIMESTRAL`, `SETORIAL` ou `ANUAL`.
- `periodoReferencia`: texto obrigatorio de 1 a 30 caracteres, como `2026-T3` ou `2026`.
  Esse campo nao e convertido automaticamente em intervalo de datas.

O autor e obtido da sessao, nao do JSON. O cadastro inicia com `publicado=false`,
`publicadoEm=null` e `arquivoUrl=null`. Nao envie ID, URL de arquivo, autor ou publicacao
no corpo do cadastro; campos desconhecidos sao rejeitados.

## Anexar o PDF

1. Abra `POST /admin/relatorios/{id}/arquivo` e clique em **Try it out**.
2. Preencha o ID real do relatorio.
3. No campo `arquivo`, selecione um PDF do computador.
4. Clique em **Execute** e confira o retorno `200`.

O upload utiliza `multipart/form-data`, e nao JSON ou texto em base64. Aceita somente um
arquivo no campo `arquivo`, sem campos adicionais, com estas regras:

- Tamanho maximo de 10 MB, equivalente a 10485760 bytes.
- Extensao `.pdf` e tipo MIME `application/pdf`.
- Cabecalho e finalizacao de PDF, estrutura legivel, ao menos uma pagina e sem criptografia.

Renomear um arquivo de texto para `.pdf` nao o torna valido. A validacao estrutural nao
substitui antivirus nem garante ausencia de conteudo ativo dentro de um PDF.

A resposta inclui nome original sanitizado, tamanho em bytes e uma URL administrativa,
como `/admin/relatorios/ID/arquivo`. O nome usado no armazenamento e gerado pelo servidor,
nao e retornado e nao depende do nome enviado pelo usuario.

Use `GET /admin/relatorios/{id}/arquivo` para baixar e conferir o PDF enquanto ele e rascunho.
Sem arquivo associado, o resultado e `404`. A API entrega o PDF como anexo, sem visualizador
embutido ou geracao automatica de documentos.

## Publicar

Execute `PATCH /admin/relatorios/{id}/publicacao`:

```json
{
  "publicado": true
}
```

O retorno esperado e `200`. Publicar exige arquivo associado e disponivel no armazenamento;
sem PDF ou com arquivo perdido, retorna `409`. `publicadoEm` recebe a data e hora atual.
Repetir `publicado=true` preserva essa data e continua verificando a disponibilidade do arquivo.

Agora consulte `GET /relatorios/{id}` sem login: a resposta contem titulo, descricao, tipo,
periodo de referencia, data de publicacao e `arquivoUrl`, sem autor ou dados internos.
Use `GET /relatorios/{id}/arquivo` para baixar o PDF publicamente.

## Despublicar

Execute a mesma rota administrativa com:

```json
{
  "publicado": false
}
```

O cadastro e o arquivo sao preservados, mas `publicadoEm` volta a `null`. As consultas
publicas por ID e o download passam a retornar `404`; o relatorio sai das listas publicas.
Isso ocorre mesmo para visitantes que estejam conectados como super administrador.
O acesso administrativo continua disponivel.

Despublicar funciona mesmo se o PDF estiver perdido no armazenamento. Os endpoints usam
`Cache-Control: no-store`, mas nao podem apagar copias ja baixadas ou revogar um download em andamento.

## Editar e substituir

Para editar metadados, execute `PATCH /admin/relatorios/{id}` com somente os campos desejados:

```json
{
  "titulo": "Relatorio de ocupacao revisado",
  "descricao": null
}
```

Campos omitidos sao preservados. `descricao=null` limpa o texto; titulo, tipo e periodo
nao aceitam `null`. Corpo vazio ou campos desconhecidos retornam `400`.
Editar metadados nao muda o estado ou a data de publicacao. Se o relatorio estiver publicado,
as alteracoes de metadados ficam imediatamente visiveis na consulta publica.

Para substituir o PDF, despublique o relatorio e envie o novo arquivo pela mesma rota de upload.
O arquivo anterior e removido somente apos a associacao do novo PDF ao banco. Se o envio
falhar antes da associacao, o arquivo anterior e preservado. Falhas ao remover arquivos antigos
ou nao associados sao registradas no log e nao desfazem a associacao bem-sucedida; monitore
esses avisos para evitar arquivos orfaos no armazenamento. Uploads concorrentes ou uma
publicacao durante o envio podem retornar `409`; consulte o relatorio e tente novamente.

Se ocorrer falha de conexao durante a associacao, consulte o relatorio antes de repetir o
envio: a gravacao pode ter sido confirmada antes da resposta falhar. A limpeza verifica a
associacao antes de remover o PDF novo; se o banco estiver indisponivel para essa verificacao,
o arquivo e preservado e a situacao e registrada no log.

Uma nova publicacao apos despublicar recebe uma nova data em `publicadoEm`.
Nao foram adicionadas exclusao de relatorios ou remocao avulsa de PDFs.

## Listar e filtrar

As listas administrativas e publicas aceitam `pagina` (padrao 1, maximo 1000000),
`limite` (padrao 20, maximo 100), `tipo` e `periodoReferencia`. Os filtros de tipo e periodo
sao exatos. A lista administrativa tambem aceita `publicado=true` ou `publicado=false`.

```http
GET /admin/relatorios?publicado=false&tipo=TRIMESTRAL&pagina=1&limite=10
GET /relatorios?tipo=TRIMESTRAL&periodoReferencia=2026-T3&pagina=1&limite=10
```

As respostas incluem `relatorios` e `paginacao`, com pagina, limite, total e totalPaginas.
Uma lista sem resultados retorna `200`, total 0 e totalPaginas 0. Paginas alem do total
retornam lista vazia, preservando o total real.

A ordem administrativa e `criadoEm` decrescente; a publica e `publicadoEm` decrescente.
O ID crescente e usado como desempate. A lista publica nao inclui rascunhos em seus totais
e rejeita o filtro `publicado`. Filtros desconhecidos retornam `400`.

## Armazenamento e backup

O PostgreSQL guarda metadados e uma chave privada para localizar o arquivo. O PDF fica no
sistema de arquivos, por padrao em `backend/storage/relatorios/`. A pasta e criada no primeiro
upload e esta fora do Git. Reiniciar o backend nao remove esses arquivos.

Para outro local, configure no `.env`, por exemplo:

```dotenv
RELATORIOS_STORAGE_DIR=storage/relatorios
```

Caminhos relativos partem de `backend/`, tanto no desenvolvimento quanto no build.
Um caminho absoluto pode apontar para um volume persistente. A conta que executa o backend
precisa de permissao de leitura, escrita e remocao nessa pasta.

O `.gitignore` cobre o local padrao `backend/storage/`. Se configurar outra pasta dentro do
repositorio, ela tambem deve ser ignorada; prefira um caminho externo para volumes de producao.

Nao exponha a pasta por `express.static`, servidor web ou URL direta. Todo download deve
passar pelas rotas da API, que verificam a visibilidade do relatorio. Em producao, preserve
o volume nos deploys e inclua os PDFs e o PostgreSQL no backup. Multiplas instancias precisam
compartilhar o mesmo armazenamento; discos locais isolados nao atendem a esse cenario.

Alterar a pasta configurada nao move os arquivos existentes. Se eles nao estiverem no novo
local, os downloads retornam `404` e novas publicacoes ficam bloqueadas. A consulta de
metadados e a listagem publicas nao verificam o disco item a item: um arquivo apagado
manualmente pode continuar listado ate que o relatorio seja despublicado ou o arquivo restaurado.

## Conferir no pgAdmin

No Query Tool do banco utilizado pelo backend:

```sql
SELECT r.id, r.titulo, r.tipo, r.periodo_referencia, r.publicado,
       r.publicado_em, r.arquivo_nome, r.arquivo_tamanho, u.nome AS criado_por
FROM relatorio AS r
JOIN user_admin AS u ON u.id = r.criado_por
ORDER BY r.criado_em DESC;
```

Nao edite chaves de arquivo ou estados diretamente pelo banco para simular o fluxo:
use os endpoints para manter arquivo, metadados e publicacao consistentes.

## Erros esperados

| Codigo | Situacao                                                                                |
| ------ | --------------------------------------------------------------------------------------- |
| 400    | Campos, UUID, filtros, formulario ou PDF invalidos; campo arquivo ausente ou incorreto. |
| 401    | Sessao administrativa ausente ou invalida.                                              |
| 403    | Conta autenticada sem permissao administrativa.                                         |
| 404    | Relatorio nao encontrado, rascunho acessado publicamente ou PDF indisponivel.           |
| 409    | Publicacao sem PDF disponivel, substituicao de PDF publicado ou alteracao concorrente.  |
| 413    | PDF maior que 10 MB.                                                                    |
