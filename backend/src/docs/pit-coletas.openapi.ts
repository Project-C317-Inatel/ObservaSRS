import type { JsonObject } from 'swagger-ui-express';

const ref = (nome: string) => ({ $ref: `#/components/schemas/${nome}` });
const texto = (maxLength?: number) => ({ type: 'string', ...(maxLength ? { maxLength } : {}) });
const uuid = { type: 'string', format: 'uuid' };
const dataHora = { type: 'string', format: 'date-time' };
const mes = { type: 'string', pattern: '^(?!0000)\\d{4}-(0[1-9]|1[0-2])$', example: '2026-10' };
const status = { type: 'string', enum: ['PENDENTE', 'APROVADO', 'REJEITADO'] };
const idParametro = { in: 'path', name: 'id', required: true, schema: uuid };
const paginacao = [
  { $ref: '#/components/parameters/PaginaPublica' },
  { $ref: '#/components/parameters/LimitePublico' },
];
const filtro = (name: string, schema: JsonObject) => ({
  in: 'query',
  name,
  required: false,
  schema,
});
const corpo = (schema: JsonObject, required = true) => ({
  required,
  content: { 'application/json': { schema } },
});
const resposta = (schema: JsonObject, description = 'Operacao realizada com sucesso.') => ({
  description,
  content: { 'application/json': { schema } },
});
const erro = resposta(
  ref('Erro'),
  'Dados invalidos, recurso ausente ou conflito com o estado atual.',
);

function operacao(
  tag: string,
  operationId: string,
  summary: string,
  schema: JsonObject,
  opcoes: JsonObject = {},
): JsonObject {
  const { publico = false, codigo = 200, ...extras } = opcoes;
  return {
    tags: [tag],
    operationId,
    summary,
    ...(publico ? {} : { security: [{ cookieAuth: [] }] }),
    responses: {
      [codigo]: resposta(schema),
      400: erro,
      404: erro,
      409: erro,
      ...(publico ? {} : { 401: erro, 403: erro }),
    },
    ...extras,
  };
}

function envelope(campo: string, schema: JsonObject, message = false) {
  return {
    type: 'object',
    required: message ? ['message', campo] : [campo],
    properties: { ...(message ? { message: texto() } : {}), [campo]: schema },
  };
}

function lista(campo: string, nome: string) {
  return {
    type: 'object',
    required: [campo, 'paginacao'],
    properties: {
      [campo]: { type: 'array', items: ref(nome) },
      paginacao: ref('PaginacaoPublica'),
    },
  };
}

const itemEntrada = {
  nome: { ...texto(150), minLength: 2, example: 'Museu Municipal' },
  categoria: { ...texto(80), minLength: 2, example: 'Museu / Cultura' },
  descricao: { ...texto(4000), example: 'Acervo historico do municipio.' },
  imagemUrl: {
    type: 'string',
    format: 'uri',
    nullable: true,
    maxLength: 2000,
    description: 'URL HTTP ou HTTPS. Nao ha upload nem download da imagem pelo backend.',
  },
  localizacao: { ...texto(150), minLength: 2, example: 'Centro' },
  ativo: { type: 'boolean', default: true },
  revisaoPrevistaEm: {
    type: 'string',
    format: 'date',
    description: 'Posterior ao dia atual UTC. Se omitida no cadastro, prazo de 180 dias.',
  },
};
const localEntrada = {
  nome: { ...texto(150), minLength: 3, example: 'Pousada Exemplo' },
  cnpjCadastur: {
    ...texto(60),
    example: '12.345.678/0001-90',
    description:
      'Campo compartilhado CNPJ/Cadastur. Normaliza pontos, barras, hifens e espacos e converte letras para maiusculas; exige 3 a 30 letras ou digitos apos normalizar. Nao verifica digitos de controle, registro federal nem titularidade.',
  },
  tipo: { ...texto(80), minLength: 2, example: 'Pousada' },
  ativo: { type: 'boolean', default: true },
};
const coletaEntrada = {
  nomeEstabelecimento: { ...texto(150), minLength: 3, example: 'Pousada Exemplo' },
  cnpjCadastur: localEntrada.cnpjCadastur,
  periodoReferencia: mes,
  leitosOcupados: { type: 'integer', minimum: 0, maximum: 2147483647, example: 25 },
  origemVisitantes: { ...texto(120), default: '', example: 'Minas Gerais e Sao Paulo' },
};

export const pitColetasSchemas = {
  ItemPitEntrada: {
    type: 'object',
    additionalProperties: false,
    required: ['nome', 'categoria', 'localizacao'],
    properties: itemEntrada,
  },
  ItemPitEdicao: {
    type: 'object',
    additionalProperties: false,
    minProperties: 1,
    properties: {
      ...itemEntrada,
      ativo: { type: 'boolean' },
      descricao: { ...texto(4000), nullable: true },
    },
  },
  ItemPitPublico: {
    type: 'object',
    required: ['id', 'nome', 'categoria', 'descricao', 'imagemUrl', 'localizacao', 'atualizadoEm'],
    properties: {
      id: uuid,
      nome: texto(150),
      categoria: texto(80),
      descricao: { ...texto(), nullable: true },
      imagemUrl: { type: 'string', format: 'uri', nullable: true },
      localizacao: texto(150),
      atualizadoEm: dataHora,
    },
  },
  ItemPit: {
    allOf: [
      ref('ItemPitPublico'),
      {
        type: 'object',
        required: ['ativo', 'criadoEm', 'revisadoEm', 'revisaoPrevistaEm', 'revisaoPendente'],
        properties: {
          ativo: { type: 'boolean' },
          criadoEm: dataHora,
          revisadoEm: dataHora,
          revisaoPrevistaEm: { type: 'string', format: 'date' },
          revisaoPendente: {
            type: 'boolean',
            description: 'Prazo de revisao atingido ou vencido, usando o dia UTC.',
          },
        },
      },
    ],
  },
  EstabelecimentoEntrada: {
    type: 'object',
    additionalProperties: false,
    required: ['nome', 'cnpjCadastur', 'tipo'],
    properties: localEntrada,
  },
  EstabelecimentoEdicao: {
    type: 'object',
    additionalProperties: false,
    minProperties: 1,
    properties: { ...localEntrada, ativo: { type: 'boolean' } },
  },
  Estabelecimento: {
    type: 'object',
    required: ['id', 'nome', 'cnpjCadastur', 'tipo', 'ativo', 'criadoEm', 'atualizadoEm'],
    properties: { ...localEntrada, id: uuid, criadoEm: dataHora, atualizadoEm: dataHora },
  },
  ColetaEntrada: {
    type: 'object',
    additionalProperties: false,
    required: ['nomeEstabelecimento', 'cnpjCadastur', 'periodoReferencia', 'leitosOcupados'],
    properties: coletaEntrada,
  },
  ColetaRecebida: {
    type: 'object',
    required: ['id', ...Object.keys(coletaEntrada)],
    properties: { id: uuid, ...coletaEntrada },
  },
  ColetaEdicao: {
    type: 'object',
    additionalProperties: false,
    minProperties: 1,
    properties: { leitosOcupados: coletaEntrada.leitosOcupados, origemVisitantes: texto(120) },
  },
  Coleta: {
    type: 'object',
    required: [
      'id',
      ...Object.keys(coletaEntrada),
      'estabelecimentoId',
      'status',
      'publicado',
      'enviadoEm',
      'atualizadoEm',
      'validadoEm',
      'validadoPorId',
      'validadoPor',
      'publicadoEm',
      'estabelecimento',
    ],
    properties: {
      ...coletaEntrada,
      id: uuid,
      estabelecimentoId: uuid,
      status,
      publicado: { type: 'boolean' },
      enviadoEm: dataHora,
      atualizadoEm: dataHora,
      validadoEm: { ...dataHora, nullable: true },
      validadoPorId: { ...uuid, nullable: true },
      publicadoEm: { ...dataHora, nullable: true },
      validadoPor: { type: 'object', nullable: true, properties: { id: uuid, nome: texto() } },
      estabelecimento: {
        type: 'object',
        properties: {
          id: uuid,
          nome: texto(150),
          cnpjCadastur: texto(30),
          tipo: texto(80),
          ativo: { type: 'boolean' },
        },
      },
    },
  },
  ResumoColetas: {
    type: 'object',
    required: ['periodoReferencia', 'estabelecimentos', 'leitosOcupados'],
    properties: {
      periodoReferencia: mes,
      estabelecimentos: { type: 'integer', minimum: 0 },
      leitosOcupados: {
        type: 'integer',
        minimum: 0,
        description:
          'Soma dos valores informados nas coletas aprovadas e publicadas do mes, de estabelecimentos ativos. Nao e taxa de ocupacao nem total de visitantes.',
      },
    },
  },
};

const filtrosPit = [filtro('categoria', texto(80)), filtro('busca', texto(150)), ...paginacao];
const itemResposta = envelope('item', ref('ItemPit'), true);
const localResposta = envelope('estabelecimento', ref('Estabelecimento'), true);
const coletaResposta = envelope('coleta', ref('Coleta'), true);
const corpoAcao = corpo({ type: 'object', additionalProperties: false, example: {} }, false);

export const pitColetasPaths = {
  '/admin/itens-pit': {
    post: operacao(
      'Inventario PIT',
      'cadastrarItemPit',
      'Cadastrar atrativo, equipamento ou servico turistico',
      itemResposta,
      {
        codigo: 201,
        requestBody: corpo(ref('ItemPitEntrada')),
        description:
          'ADMIN ou SUPER_ADMIN. Ativo fica visivel imediatamente na consulta publica. A categoria e texto livre. O prazo padrao de revisao e 180 dias.',
      },
    ),
    get: operacao(
      'Inventario PIT',
      'listarItensPit',
      'Listar itens e pendencias de revisao',
      lista('itens', 'ItemPit'),
      {
        parameters: [
          ...filtrosPit,
          filtro('ativo', { type: 'boolean' }),
          filtro('revisaoPendente', { type: 'boolean' }),
        ],
        description:
          'Busca parcial sem diferenciar maiusculas em nome, descricao e localizacao; categoria exata. revisaoPendente inclui prazos atingidos no dia UTC. Sem filtro ativo, inclui inativos. Ordenacao por nome e ID.',
      },
    ),
  },
  '/admin/itens-pit/{id}': {
    parameters: [idParametro],
    get: operacao(
      'Inventario PIT',
      'consultarItemPit',
      'Consultar item administrativo',
      envelope('item', ref('ItemPit')),
    ),
    patch: operacao(
      'Inventario PIT',
      'editarItemPit',
      'Editar ou ativar/desativar item',
      itemResposta,
      {
        requestBody: corpo(ref('ItemPitEdicao')),
        description:
          'Edicao parcial. Campos omitidos sao preservados. descricao e imagemUrl aceitam null. Editar nao confirma uma revisao. Desativar retira o item das consultas publicas.',
      },
    ),
  },
  '/admin/itens-pit/{id}/revisao': {
    parameters: [idParametro],
    patch: operacao(
      'Inventario PIT',
      'revisarItemPit',
      'Confirmar revisao e agendar a proxima',
      itemResposta,
      {
        requestBody: corpo(
          {
            type: 'object',
            additionalProperties: false,
            properties: { revisaoPrevistaEm: itemEntrada.revisaoPrevistaEm },
            example: {},
          },
          false,
        ),
        description:
          'Registra revisadoEm com o instante atual. Sem data explicita, agenda nova revisao em 180 dias. A nova data deve ser posterior ao dia UTC atual. Nao envia notificacoes.',
      },
    ),
  },
  '/itens-pit': {
    get: operacao(
      'Inventario PIT publico',
      'listarItensPitPublicos',
      'Listar inventario ativo sem login',
      lista('itens', 'ItemPitPublico'),
      {
        publico: true,
        parameters: filtrosPit,
        description:
          'Somente itens ativos. Nao aceita filtros administrativos nem expoe datas internas de revisao. Ordenacao por nome e ID.',
      },
    ),
  },
  '/itens-pit/{id}': {
    parameters: [idParametro],
    get: operacao(
      'Inventario PIT publico',
      'consultarItemPitPublico',
      'Consultar item ativo sem login',
      envelope('item', ref('ItemPitPublico')),
      {
        publico: true,
        description:
          'Item inativo ou inexistente retorna 404, mesmo para administrador autenticado.',
      },
    ),
  },
  '/admin/estabelecimentos': {
    post: operacao(
      'Estabelecimentos',
      'cadastrarEstabelecimento',
      'Cadastrar estabelecimento',
      localResposta,
      { codigo: 201, requestBody: corpo(ref('EstabelecimentoEntrada')) },
    ),
    get: operacao(
      'Estabelecimentos',
      'listarEstabelecimentos',
      'Listar estabelecimentos',
      lista('estabelecimentos', 'Estabelecimento'),
      {
        parameters: [
          ...paginacao,
          filtro('ativo', { type: 'boolean' }),
          filtro('tipo', texto(80)),
          filtro('busca', texto(150)),
        ],
        description:
          'Tipo exato; busca parcial em nome ou identificador armazenado sem mascara. Ordenacao por nome e ID.',
      },
    ),
  },
  '/admin/estabelecimentos/{id}': {
    parameters: [idParametro],
    get: operacao(
      'Estabelecimentos',
      'consultarEstabelecimento',
      'Consultar estabelecimento',
      envelope('estabelecimento', ref('Estabelecimento')),
    ),
    patch: operacao(
      'Estabelecimentos',
      'editarEstabelecimento',
      'Editar ou ativar/desativar estabelecimento',
      localResposta,
      {
        requestBody: corpo(ref('EstabelecimentoEdicao')),
        description:
          'Desativar bloqueia novos envios, aprovacao e publicacao e retira os dados do resumo publico. Nao apaga o historico. Reativar restaura a visibilidade das coletas que permanecem publicadas. Nome e identificador originais do envio sao preservados na coleta.',
      },
    ),
  },
  '/api/coletas': {
    post: operacao(
      'Coleta autonoma',
      'enviarColeta',
      'Enviar coleta mensal para validacao da SMCELT',
      envelope('coleta', ref('ColetaRecebida'), true),
      {
        publico: true,
        codigo: 201,
        requestBody: corpo(ref('ColetaEntrada')),
        description:
          'Sem login, compativel com o formulario existente. Registra PENDENTE e nao publicado. Se o identificador nao existir, cadastra um estabelecimento ativo do tipo Hospedagem; nao altera dados de um cadastro existente. Nao verifica a identidade do remetente ou o registro federal. Unico por estabelecimento e mes, inclusive se rejeitado (409); correcoes sao feitas pela equipe enquanto pendente. Limite de 30 tentativas por IP por hora. Identificadores novos podem exigir conferencias adicionais pela SMCELT.',
        responses: {
          201: resposta(envelope('coleta', ref('ColetaRecebida'), true)),
          400: erro,
          409: erro,
          429: resposta(ref('Erro'), 'Limite de 30 tentativas por IP por hora atingido.'),
        },
      },
    ),
  },
  '/admin/coletas': {
    get: operacao(
      'Gestao de coletas',
      'listarColetas',
      'Listar envios para validacao',
      lista('coletas', 'Coleta'),
      {
        parameters: [
          ...paginacao,
          filtro('status', status),
          filtro('estabelecimentoId', uuid),
          filtro('periodoReferencia', mes),
          filtro('publicado', { type: 'boolean' }),
        ],
        description:
          'Sem filtro status, inclui todos os estados. Ordenacao por enviadoEm decrescente e ID crescente. Dados individuais restritos a ADMIN e SUPER_ADMIN.',
      },
    ),
  },
  '/admin/coletas/{id}': {
    parameters: [idParametro],
    get: operacao(
      'Gestao de coletas',
      'consultarColeta',
      'Consultar envio e avaliacao',
      envelope('coleta', ref('Coleta')),
    ),
    patch: operacao(
      'Gestao de coletas',
      'editarColeta',
      'Corrigir dados de uma coleta pendente',
      coletaResposta,
      {
        requestBody: corpo(ref('ColetaEdicao')),
        description:
          'Edita apenas leitosOcupados e origemVisitantes enquanto PENDENTE. Mes e identidade do envio sao imutaveis. Coleta ja avaliada retorna 409.',
      },
    ),
  },
  '/admin/coletas/{id}/aprovar': {
    parameters: [idParametro],
    patch: operacao(
      'Gestao de coletas',
      'aprovarColeta',
      'Aprovar coleta pendente',
      coletaResposta,
      {
        requestBody: corpoAcao,
        description:
          'ADMIN ou SUPER_ADMIN. Exige estabelecimento ativo. Registra data e responsavel da sessao. A aprovacao nao publica os dados. Uma coleta avaliada nao pode ser avaliada novamente.',
      },
    ),
  },
  '/admin/coletas/{id}/rejeitar': {
    parameters: [idParametro],
    patch: operacao(
      'Gestao de coletas',
      'rejeitarColeta',
      'Rejeitar coleta pendente',
      coletaResposta,
      {
        requestBody: corpoAcao,
        description:
          'Registra data e responsavel sem exigir justificativa. Permitido mesmo para estabelecimento inativo. Mantem o envio no historico e fora do resumo publico.',
      },
    ),
  },
  '/admin/coletas/{id}/publicacao': {
    parameters: [idParametro],
    patch: operacao(
      'Gestao de coletas',
      'alterarPublicacaoColeta',
      'Publicar ou despublicar uma coleta',
      coletaResposta,
      {
        requestBody: corpo({
          type: 'object',
          additionalProperties: false,
          required: ['publicado'],
          properties: { publicado: { type: 'boolean' } },
          example: { publicado: true },
        }),
        description:
          'Publicar exige APROVADO e estabelecimento ativo. Somente a soma mensal e a contagem de estabelecimentos sao publicas. Despublicar e permitido mesmo com estabelecimento inativo. Repetir o estado preserva publicadoEm. Nao cria registros genericos de indicadores automaticamente.',
      },
    ),
  },
  '/coletas/resumo': {
    get: operacao(
      'Coleta autonoma',
      'resumirColetas',
      'Consultar totais mensais publicados sem dados individuais',
      envelope('resumo', ref('ResumoColetas')),
      {
        publico: true,
        parameters: [{ in: 'query', name: 'periodoReferencia', required: true, schema: mes }],
        description:
          'Somente coletas aprovadas, publicadas e de estabelecimentos ativos. Sem resultados retorna zeros. Sem CNPJ, nome, origem livre ou IDs individuais. Nao e integrado automaticamente aos indicadores ou cards do frontend.',
      },
    ),
  },
};
