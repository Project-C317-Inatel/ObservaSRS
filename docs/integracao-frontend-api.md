# Contratos da integracao frontend e API

Os servicos do frontend usam os endpoints implementados e documentados em
`backend/src/docs/openapi.ts` e `backend/src/docs/pit-coletas.openapi.ts`.
O Swagger fica em `http://localhost:3333/docs`. Este documento substitui as propostas
de contrato anteriores presentes nos documentos de planejamento da semana 30/10.

## Configuracao e acesso

Na pasta `frontend/`, execute `npm ci`, configure `.env.local` a partir de `.env.example`
e inicie com `npm run dev`. Use a mesma forma de endereco, `localhost`, nas duas
aplicacoes. A API deve estar em execucao, com PostgreSQL configurado e migrations aplicadas.

```env
VITE_API_URL=http://localhost:3333
VITE_USE_MOCKS=false
```

O cliente envia `credentials: 'include'`, usa a sessao em cookie HttpOnly e aceita JSON
e FormData. O navegador define o boundary do upload; o cliente nao fixa Content-Type
ao enviar FormData. ADMIN e SUPER_ADMIN acessam o painel geral; solicitacoes de acesso
continuam restritas ao SUPER_ADMIN. O painel geral mantem o conteudo inicial disponibilizado
pelo frontend; os servicos administrativos nao equivalem a formularios completos para cada modulo.

O modo mock usa os dados demonstrativos quando `VITE_USE_MOCKS=true`. O comportamento
existente de fallback em desenvolvimento foi preservado: falhas da API podem mostrar
dados demonstrativos, com aviso no console. Em producao com mocks desligados, falhas
sao exibidas como erro. Para conferir integracao real, confirme as requisicoes e respostas
na aba Network e os registros no banco; a aparencia da tela sozinha nao comprova a integracao.

## Rotas e formatos utilizados

| Servico                 | Contrato                                                                                       |
| ----------------------- | ---------------------------------------------------------------------------------------------- |
| Setores e indicadores   | `GET /setores` e `GET /indicadores?setorId=UUID`                                               |
| Series publicas         | `GET /registros-indicadores`, com indicadorId, fonteId, setorId e intervalo de datas opcionais |
| Edicao de registros     | `PATCH /admin/registros-indicadores/{id}`, sem campo publicado                                 |
| Publicacao de registros | `PATCH /admin/registros-indicadores/{id}/publicacao` com `{ "publicado": true/false }`         |
| PIT publico             | `GET /itens-pit`, com categoria opcional                                                       |
| PIT administrativo      | `POST /admin/itens-pit` e `PATCH /admin/itens-pit/{id}`                                        |
| Ativacao do PIT         | Mesmo PATCH de edicao, com `{ "ativo": true/false }`; nao existe DELETE                        |
| Relatorios publicos     | `GET /relatorios`, com tipo opcional: `TRIMESTRAL`, `SETORIAL` ou `ANUAL`                      |
| Cadastro de relatorio   | `POST /admin/relatorios` em JSON: titulo, tipo, periodoReferencia e descricao opcional         |
| Upload de PDF           | `POST /admin/relatorios/{id}/arquivo`, FormData com somente o campo arquivo                    |
| Publicacao de relatorio | `PATCH /admin/relatorios/{id}/publicacao` com `{ "publicado": true/false }`; nao existe DELETE |
| Coleta publica          | `POST /api/coletas`, preservando o formato do formulario existente                             |
| Avaliacao da coleta     | `PATCH /admin/coletas/{id}/aprovar` ou `/rejeitar`, sem motivo ou outros atributos             |
| Publicacao da coleta    | `PATCH /admin/coletas/{id}/publicacao`, separada da aprovacao                                  |

As listas publicas possuem `paginacao`. Os servicos que alimentam filtros locais e
graficos percorrem as paginas com limite 100 e entregam a colecao reunida ao hook.
O helper rejeita paginas truncadas, sobrepostas ou com total alterado durante a leitura,
para evitar apresentar somas parciais. A lista administrativa de coletas preserva a
paginacao do backend e permite informar pagina, limite e os filtros disponiveis.

Valores decimais dos registros chegam como texto. Cada registro publico possui
`indicador` (incluindo `setor`) e `fonte` relacionados. Nao existem `indicadorCodigo`,
`indicadorNome` ou `setorNome` no nivel principal da resposta. Descricoes podem ser null.
Datas podem ser `AAAA-MM-DD` ou timestamps ISO completos, conforme o campo.

## Adaptacao dos indicadores e destaques

O banco identifica indicadores por UUID e nome, sem campo codigo. O mapeamento visual
fica em `frontend/src/shared/metricas.ts`: normaliza acentos, espacos e maiusculas e
reconhece nomes como Visitantes, Fluxo de visitantes, Pernoites, Taxa de ocupacao,
Estada media, Hospedagens, Leitos ocupados, Empresas cadastradas e Empregos gerados.
Esse mapeamento pertence a apresentacao; nao altera o cadastro nem cria codigos no banco.

O adaptador utiliza o setor relacionado e a data real do registro. Registros concorrentes
para a mesma metrica, setor e periodo nao sao somados ou sobrescritos arbitrariamente:
a adaptacao sinaliza ambiguidade. A fonte deve ser definida ou o valor consolidado cadastrado
antes de exibir essa serie. As agregacoes visuais de periodos e setores ja existentes
permanecem em `features/indicators/logic.ts`.

A home nao chama `/indicadores/destaques`, pois essa rota nao existe. O servico deriva
os destaques dos registros publicos: para cada nome reconhecido, usa o unico valor do
periodo mais recente e apresenta data e setor na legenda. Se houver varios candidatos
nesse periodo, sinaliza a ambiguidade. Metricas sem registro publicado ficam ausentes,
sem preencher zeros ou numeros ficticios. Nao ha soma automatica de fontes ou setores.

## Relatorios e inventario nas telas

Os tipos de relatorios trafegam em maiusculas e recebem rotulos amigaveis na interface.
`periodoReferencia` e obrigatorio no cadastro; `publicadoEm` e controlado pelo backend.
O PDF e enviado depois do cadastro e publicado em uma terceira operacao explicita.
Uma falha no upload deixa o rascunho recuperavel, sem publicar um relatorio incompleto.
O download usa `arquivoUrl`, relativo a API, por exemplo `/relatorios/{id}/arquivo`.

O PIT aceita categorias livres e descricao nula. As categorias cadastradas podem aparecer
nos filtros, e categorias sem cor especifica usam o gradiente padrao. O formatador da
ultima atualizacao aceita o timestamp ISO entregue pela API.
