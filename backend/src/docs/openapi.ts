import type { JsonObject } from 'swagger-ui-express';

import { env } from '../config/env.js';
import { pitColetasPaths, pitColetasSchemas } from './pit-coletas.openapi.js';

const errorResponse = {
  description: 'Erro na requisicao.',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/Erro' },
    },
  },
};

const relatorioResponse = {
  description:
    'Relatorio com metadados administrativos e URL protegida do PDF, sem caminho interno do armazenamento.',
  content: { 'application/json': { schema: { $ref: '#/components/schemas/RelatorioResposta' } } },
};

const pdfResponse = {
  description: 'Download do PDF como anexo. O arquivo nao e servido por uma pasta publica.',
  headers: {
    'Content-Disposition': {
      schema: { type: 'string' },
      description: 'attachment; filename="relatorio-ID.pdf"',
    },
    'Cache-Control': { schema: { type: 'string', example: 'no-store' } },
  },
  content: { 'application/pdf': { schema: { type: 'string', format: 'binary' } } },
};

export const openApiDocument: JsonObject = {
  openapi: '3.0.3',
  info: {
    title: 'ObservaSRS API',
    version: '0.1.0',
    description:
      'API do Observatorio do Turismo de Santa Rita do Sapucai. Contas da equipe SMCELT, setores, indicadores, fontes de dados e registros por periodo.',
  },
  servers: [{ url: '/', description: 'Servidor atual' }],
  tags: [
    {
      name: 'Inventario PIT',
      description: 'Cadastro, manutencao e revisao periodica por ADMIN ou SUPER_ADMIN.',
    },
    {
      name: 'Inventario PIT publico',
      description: 'Atrativos, equipamentos e servicos turisticos ativos.',
    },
    { name: 'Estabelecimentos', description: 'Cadastro e controle de recebimento de coletas.' },
    {
      name: 'Coleta autonoma',
      description: 'Envio publico de dados mensais e consulta dos totais publicados.',
    },
    { name: 'Gestao de coletas', description: 'Correcao, avaliacao e publicacao pela SMCELT.' },
    { name: 'Status', description: 'Disponibilidade da API.' },
    {
      name: 'Consulta publica',
      description: 'Consulta sem login de setores e indicadores ativos e registros publicados.',
    },
    { name: 'Autenticacao', description: 'Cadastro e sessao da equipe SMCELT.' },
    {
      name: 'Relatorios',
      description: 'Metadados, PDF e publicacao de relatorios por ADMIN ou SUPER_ADMIN.',
    },
    {
      name: 'Relatorios publicos',
      description: 'Consulta e download sem login, somente de relatorios publicados.',
    },
    { name: 'Setores', description: 'Cadastro e consulta de setores por ADMIN ou SUPER_ADMIN.' },
    {
      name: 'Fontes de dados',
      description: 'Origem e referencia dos dados, para ADMIN ou SUPER_ADMIN.',
    },
    {
      name: 'Registros de indicadores',
      description: 'Valores por indicador, fonte e periodo, para ADMIN ou SUPER_ADMIN.',
    },
    {
      name: 'Indicadores',
      description: 'Cadastro e consulta de indicadores por ADMIN ou SUPER_ADMIN.',
    },
    {
      name: 'Super administrador',
      description: 'Aprovacao e rejeicao de solicitacoes e gestao de acesso das contas aprovadas.',
    },
  ],
  paths: {
    ...pitColetasPaths,
    '/admin/relatorios': {
      post: {
        tags: ['Relatorios'],
        summary: 'Cadastrar um relatorio como rascunho',
        description:
          'Exige ADMIN ou SUPER_ADMIN aprovado e ativo. O autor e obtido da sessao. O cadastro nao recebe PDF, URL ou publicacao: envie o arquivo pela rota especifica e publique depois.',
        operationId: 'cadastrarRelatorio',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RelatorioEntrada' },
              example: {
                titulo: 'Ocupacao hoteleira - terceiro trimestre de 2026',
                descricao: 'Relatorio de ocupacao dos meios de hospedagem.',
                tipo: 'TRIMESTRAL',
                periodoReferencia: '2026-T3',
              },
            },
          },
        },
        responses: {
          201: relatorioResponse,
          400: errorResponse,
          401: errorResponse,
          403: errorResponse,
          404: errorResponse,
        },
      },
      get: {
        tags: ['Relatorios'],
        summary: 'Listar relatorios administrativos',
        description:
          'Inclui publicados e rascunhos quando publicado e omitido. Filtros exatos por tipo e periodoReferencia. Ordenacao por criadoEm decrescente e ID crescente.',
        operationId: 'listarRelatorios',
        security: [{ cookieAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/PaginaPublica' },
          { $ref: '#/components/parameters/LimitePublico' },
          { $ref: '#/components/parameters/TipoRelatorioFiltro' },
          { $ref: '#/components/parameters/PeriodoRelatorioFiltro' },
          { in: 'query', name: 'publicado', required: false, schema: { type: 'boolean' } },
        ],
        responses: {
          200: {
            description: 'Lista paginada de relatorios.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/RelatoriosResposta' } },
            },
          },
          400: errorResponse,
          401: errorResponse,
          403: errorResponse,
        },
      },
    },
    '/admin/relatorios/{id}': {
      get: {
        tags: ['Relatorios'],
        summary: 'Consultar um relatorio administrativo',
        operationId: 'consultarRelatorio',
        security: [{ cookieAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/RelatorioId' }],
        responses: {
          200: relatorioResponse,
          400: errorResponse,
          401: errorResponse,
          403: errorResponse,
          404: errorResponse,
        },
      },
      patch: {
        tags: ['Relatorios'],
        summary: 'Editar os metadados de um relatorio',
        description:
          'Edicao parcial de titulo, descricao, tipo e periodoReferencia. Descricao aceita null para limpar. Campos omitidos e publicacao sao preservados. Corpo vazio e campos desconhecidos sao rejeitados.',
        operationId: 'editarRelatorio',
        security: [{ cookieAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/RelatorioId' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RelatorioEdicao' },
              example: { titulo: 'Relatorio de ocupacao revisado', descricao: null },
            },
          },
        },
        responses: {
          200: relatorioResponse,
          400: errorResponse,
          401: errorResponse,
          403: errorResponse,
          404: errorResponse,
        },
      },
    },
    '/admin/relatorios/{id}/arquivo': {
      post: {
        tags: ['Relatorios'],
        summary: 'Anexar ou substituir o PDF de um rascunho',
        description:
          'Envie um unico arquivo no campo arquivo, sem campos adicionais. Limite de 10 MB (10485760 bytes), extensao .pdf e MIME application/pdf. O conteudo deve ser um PDF valido, com ao menos uma pagina e sem criptografia. Substituir exige relatorio despublicado. Uploads concorrentes ou publicacao durante o envio podem retornar 409; o arquivo que nao for associado e removido. O arquivo anterior e removido apos a troca bem-sucedida.',
        operationId: 'enviarPdfRelatorio',
        security: [{ cookieAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/RelatorioId' }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                additionalProperties: false,
                required: ['arquivo'],
                properties: {
                  arquivo: {
                    type: 'string',
                    format: 'binary',
                    description: 'Arquivo PDF de ate 10 MB.',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: relatorioResponse,
          400: errorResponse,
          401: errorResponse,
          403: errorResponse,
          404: errorResponse,
          409: errorResponse,
          413: errorResponse,
        },
      },
      get: {
        tags: ['Relatorios'],
        summary: 'Baixar o PDF com sessao administrativa',
        description:
          'Permite conferir PDFs de rascunhos e relatorios publicados. Sem arquivo associado ou com arquivo indisponivel retorna 404.',
        operationId: 'baixarPdfAdministrativo',
        security: [{ cookieAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/RelatorioId' }],
        responses: {
          200: pdfResponse,
          400: errorResponse,
          401: errorResponse,
          403: errorResponse,
          404: errorResponse,
        },
      },
    },
    '/admin/relatorios/{id}/publicacao': {
      patch: {
        tags: ['Relatorios'],
        summary: 'Publicar ou despublicar um relatorio',
        description:
          'Publicar exige PDF associado e disponivel no armazenamento. Na transicao para publicado, publicadoEm recebe a data atual; despublicar limpa essa data. Repetir o estado atual retorna 200 sem alterar a data, respeitando a validacao do PDF ao publicar. Despublicar funciona mesmo se o arquivo estiver indisponivel. A publicacao controla tanto os metadados quanto o download publico.',
        operationId: 'alterarPublicacaoRelatorio',
        security: [{ cookieAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/RelatorioId' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RelatorioPublicacao' },
              examples: {
                publicar: { value: { publicado: true } },
                despublicar: { value: { publicado: false } },
              },
            },
          },
        },
        responses: {
          200: relatorioResponse,
          400: errorResponse,
          401: errorResponse,
          403: errorResponse,
          404: errorResponse,
          409: errorResponse,
        },
      },
    },
    '/relatorios': {
      get: {
        tags: ['Relatorios publicos'],
        summary: 'Listar relatorios publicados sem login',
        description:
          'Somente relatorios publicados com arquivo associado e data de publicacao. Filtros exatos por tipo e periodoReferencia. Ordenacao por publicadoEm decrescente e ID crescente. Filtros desconhecidos, incluindo publicado, sao rejeitados.',
        operationId: 'listarRelatoriosPublicos',
        security: [],
        parameters: [
          { $ref: '#/components/parameters/PaginaPublica' },
          { $ref: '#/components/parameters/LimitePublico' },
          { $ref: '#/components/parameters/TipoRelatorioFiltro' },
          { $ref: '#/components/parameters/PeriodoRelatorioFiltro' },
        ],
        responses: {
          200: {
            description: 'Lista paginada de relatorios publicados.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RelatoriosPublicosResposta' },
              },
            },
          },
          400: errorResponse,
        },
      },
    },
    '/relatorios/{id}': {
      get: {
        tags: ['Relatorios publicos'],
        summary: 'Consultar um relatorio publicado sem login',
        description:
          'Rascunhos ou IDs inexistentes retornam a mesma resposta 404. Nao retorna autor, nome original do arquivo ou caminhos internos.',
        operationId: 'consultarRelatorioPublico',
        security: [],
        parameters: [{ $ref: '#/components/parameters/RelatorioId' }],
        responses: {
          200: {
            description: 'Metadados publicos e URL de download do PDF.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RelatorioPublicoResposta' },
              },
            },
          },
          400: errorResponse,
          404: errorResponse,
        },
      },
    },
    '/relatorios/{id}/arquivo': {
      get: {
        tags: ['Relatorios publicos'],
        summary: 'Baixar o PDF publicado sem login',
        description:
          'A visibilidade e consultada no banco em cada requisicao. Rascunhos e IDs inexistentes retornam 404. Arquivo perdido no armazenamento tambem retorna 404. O download usa Content-Disposition: attachment e Cache-Control: no-store.',
        operationId: 'baixarPdfPublico',
        security: [],
        parameters: [{ $ref: '#/components/parameters/RelatorioId' }],
        responses: { 200: pdfResponse, 400: errorResponse, 404: errorResponse },
      },
    },
    '/setores': {
      get: {
        tags: ['Consulta publica'],
        summary: 'Listar setores ativos sem login',
        description:
          'Lista setores ativos, mesmo sem registros publicados. Ordenacao por nome e ID. Filtros desconhecidos sao rejeitados.',
        operationId: 'listarSetoresPublicos',
        security: [],
        parameters: [
          { $ref: '#/components/parameters/PaginaPublica' },
          { $ref: '#/components/parameters/LimitePublico' },
        ],
        responses: {
          200: {
            description: 'Lista paginada de setores ativos.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SetoresPublicosResposta' },
              },
            },
          },
          400: errorResponse,
        },
      },
    },
    '/setores/{id}': {
      get: {
        tags: ['Consulta publica'],
        summary: 'Consultar um setor ativo sem login',
        operationId: 'consultarSetorPublico',
        security: [],
        parameters: [{ $ref: '#/components/parameters/SetorId' }],
        responses: {
          200: {
            description: 'Setor ativo encontrado.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/SetorPublicoResposta' } },
            },
          },
          400: errorResponse,
          404: errorResponse,
        },
      },
    },
    '/indicadores': {
      get: {
        tags: ['Consulta publica'],
        summary: 'Listar indicadores ativos sem login',
        description:
          'Somente indicadores ativos ligados a setores ativos, mesmo sem registros publicados. Ordenacao por nome e ID. O filtro setorId e opcional; filtros desconhecidos sao rejeitados.',
        operationId: 'listarIndicadoresPublicos',
        security: [],
        parameters: [
          { $ref: '#/components/parameters/PaginaPublica' },
          { $ref: '#/components/parameters/LimitePublico' },
          {
            in: 'query',
            name: 'setorId',
            required: false,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          200: {
            description: 'Lista paginada de indicadores ativos, com setor associado.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/IndicadoresPublicosResposta' },
              },
            },
          },
          400: errorResponse,
        },
      },
    },
    '/indicadores/{id}': {
      get: {
        tags: ['Consulta publica'],
        summary: 'Consultar um indicador ativo sem login',
        description:
          'Indicador inativo ou vinculado a setor inativo retorna 404, assim como um ID inexistente.',
        operationId: 'consultarIndicadorPublico',
        security: [],
        parameters: [{ $ref: '#/components/parameters/IndicadorId' }],
        responses: {
          200: {
            description: 'Indicador ativo encontrado, com setor associado.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/IndicadorPublicoResposta' },
              },
            },
          },
          400: errorResponse,
          404: errorResponse,
        },
      },
    },
    '/registros-indicadores': {
      get: {
        tags: ['Consulta publica'],
        summary: 'Listar registros publicados sem login',
        description:
          'Somente registros publicados com indicador e setor ativos. Filtros podem ser combinados; datas sao inclusivas. Ordenacao por periodo decrescente e ID crescente. Retorna dados individuais, sem agregacao para graficos. Filtros desconhecidos, incluindo publicado e ativo, sao rejeitados.',
        operationId: 'listarRegistrosPublicos',
        security: [],
        parameters: [
          { $ref: '#/components/parameters/PaginaPublica' },
          { $ref: '#/components/parameters/LimitePublico' },
          {
            in: 'query',
            name: 'indicadorId',
            required: false,
            schema: { type: 'string', format: 'uuid' },
          },
          {
            in: 'query',
            name: 'fonteId',
            required: false,
            schema: { type: 'string', format: 'uuid' },
          },
          {
            in: 'query',
            name: 'setorId',
            required: false,
            schema: { type: 'string', format: 'uuid' },
          },
          {
            in: 'query',
            name: 'periodoInicio',
            required: false,
            schema: { type: 'string', format: 'date' },
          },
          {
            in: 'query',
            name: 'periodoFim',
            required: false,
            schema: { type: 'string', format: 'date' },
          },
        ],
        responses: {
          200: {
            description:
              'Lista paginada dos registros visiveis. Datas sem horario e valores como strings com duas casas decimais.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RegistrosPublicosResposta' },
              },
            },
          },
          400: errorResponse,
        },
      },
    },
    '/registros-indicadores/{id}': {
      get: {
        tags: ['Consulta publica'],
        summary: 'Consultar um registro publicado sem login',
        description:
          'Registros nao publicados ou com indicador ou setor inativo retornam 404, assim como um ID inexistente. Nao retorna observacoes ou campos de controle administrativo.',
        operationId: 'consultarRegistroPublico',
        security: [],
        parameters: [{ $ref: '#/components/parameters/RegistroIndicadorId' }],
        responses: {
          200: {
            description: 'Registro publicado encontrado, com indicador, setor e fonte.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RegistroPublicoResposta' },
              },
            },
          },
          400: errorResponse,
          404: errorResponse,
        },
      },
    },
    '/admin/fontes-dados': {
      post: {
        tags: ['Fontes de dados'],
        summary: 'Cadastrar uma fonte de dados',
        description:
          'Exige ADMIN ou SUPER_ADMIN aprovado e ativo. A referencia pode ser um texto ou um link.',
        operationId: 'cadastrarFonteDado',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/FonteDadoEntrada' },
              example: {
                nome: 'Levantamento da SMCELT',
                tipo: 'levantamento',
                descricao: 'Levantamento de ocupacao dos meios de hospedagem.',
                referencia: 'Relatorio de ocupacao de setembro de 2026.',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Fonte de dados cadastrada no banco.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/FonteDadoResposta' } },
            },
          },
          400: errorResponse,
          401: errorResponse,
          403: errorResponse,
        },
      },
      get: {
        tags: ['Fontes de dados'],
        summary: 'Listar fontes de dados',
        operationId: 'listarFontesDados',
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            in: 'query',
            name: 'tipo',
            required: false,
            schema: { type: 'string', minLength: 1, maxLength: 50 },
            description: 'Filtrar pelo tipo exato da fonte.',
          },
        ],
        responses: {
          200: {
            description: 'Fontes de dados ordenadas pelo nome.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['fontes'],
                  properties: {
                    fontes: { type: 'array', items: { $ref: '#/components/schemas/FonteDado' } },
                  },
                },
              },
            },
          },
          400: errorResponse,
          401: errorResponse,
          403: errorResponse,
        },
      },
    },
    '/admin/fontes-dados/{id}': {
      patch: {
        tags: ['Fontes de dados'],
        summary: 'Editar uma fonte de dados',
        description:
          'Exige ADMIN ou SUPER_ADMIN aprovado e ativo. Envie ao menos um campo. Campos omitidos sao preservados; descricao e referencia aceitam null para limpar o conteudo. Campos desconhecidos sao rejeitados.',
        operationId: 'editarFonteDado',
        security: [{ cookieAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/FonteDadoId' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/FonteDadoEdicao' },
              example: { referencia: 'Relatorio revisado de setembro de 2026.' },
            },
          },
        },
        responses: {
          200: {
            description: 'Fonte de dados atualizada.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/FonteDadoResposta' } },
            },
          },
          400: errorResponse,
          401: errorResponse,
          403: errorResponse,
          404: errorResponse,
        },
      },
      get: {
        tags: ['Fontes de dados'],
        summary: 'Consultar uma fonte de dados pelo ID',
        operationId: 'consultarFonteDado',
        security: [{ cookieAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/FonteDadoId' }],
        responses: {
          200: {
            description: 'Fonte de dados encontrada.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/FonteDadoResposta' } },
            },
          },
          400: errorResponse,
          401: errorResponse,
          403: errorResponse,
          404: errorResponse,
        },
      },
    },
    '/admin/registros-indicadores': {
      post: {
        tags: ['Registros de indicadores'],
        summary: 'Cadastrar um registro de indicador',
        description:
          'Exige ADMIN ou SUPER_ADMIN aprovado e ativo, indicador e setor ativos e fonte existente. Periodo no formato AAAA-MM-DD. Valor com ate 12 digitos inteiros e 2 casas decimais; use string para preservar a precisao. A combinacao indicador, fonte e periodo e unica. O registro inicia como nao publicado, salvo se publicado=true for informado. Esta rota e administrativa.',
        operationId: 'cadastrarRegistroIndicador',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegistroIndicadorEntrada' },
              example: {
                indicadorId: '22222222-2222-4222-8222-222222222222',
                fonteId: '33333333-3333-4333-8333-333333333333',
                periodo: '2026-09-01',
                valor: '120.00',
                publicado: false,
                observacao: 'Valor de demonstracao.',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Registro cadastrado, com indicador, setor e fonte de dados.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RegistroIndicadorResposta' },
              },
            },
          },
          400: errorResponse,
          401: errorResponse,
          403: errorResponse,
          404: errorResponse,
          409: errorResponse,
        },
      },
      get: {
        tags: ['Registros de indicadores'],
        summary: 'Listar registros de indicadores',
        description:
          'Consulta administrativa, incluindo publicados e nao publicados se o filtro for omitido. Datas inicial e final sao inclusivas.',
        operationId: 'listarRegistrosIndicadores',
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            in: 'query',
            name: 'indicadorId',
            required: false,
            schema: { type: 'string', format: 'uuid' },
          },
          {
            in: 'query',
            name: 'fonteId',
            required: false,
            schema: { type: 'string', format: 'uuid' },
          },
          {
            in: 'query',
            name: 'setorId',
            required: false,
            schema: { type: 'string', format: 'uuid' },
          },
          { in: 'query', name: 'publicado', required: false, schema: { type: 'boolean' } },
          {
            in: 'query',
            name: 'periodoInicio',
            required: false,
            schema: { type: 'string', format: 'date' },
          },
          {
            in: 'query',
            name: 'periodoFim',
            required: false,
            schema: { type: 'string', format: 'date' },
          },
        ],
        responses: {
          200: {
            description: 'Registros ordenados do periodo mais recente para o mais antigo.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['registros'],
                  properties: {
                    registros: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/RegistroIndicador' },
                    },
                  },
                },
              },
            },
          },
          400: errorResponse,
          401: errorResponse,
          403: errorResponse,
        },
      },
    },
    '/admin/registros-indicadores/{id}': {
      patch: {
        tags: ['Registros de indicadores'],
        summary: 'Editar um registro de indicador',
        description:
          'Exige ADMIN ou SUPER_ADMIN aprovado e ativo. Envie ao menos um campo. Campos omitidos e o estado de publicacao sao preservados. O indicador resultante e seu setor devem estar ativos; a fonte deve existir. Observacao aceita null. Campos desconhecidos, incluindo publicado, sao rejeitados: use a rota de publicacao. A combinacao indicador, fonte e periodo continua unica.',
        operationId: 'editarRegistroIndicador',
        security: [{ cookieAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/RegistroIndicadorId' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegistroIndicadorEdicao' },
              example: { valor: '125.50', observacao: 'Valor corrigido apos conferencia.' },
            },
          },
        },
        responses: {
          200: {
            description: 'Registro atualizado, com indicador, setor e fonte de dados.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RegistroIndicadorResposta' },
              },
            },
          },
          400: errorResponse,
          401: errorResponse,
          403: errorResponse,
          404: errorResponse,
          409: errorResponse,
        },
      },
      get: {
        tags: ['Registros de indicadores'],
        summary: 'Consultar um registro de indicador pelo ID',
        operationId: 'consultarRegistroIndicador',
        security: [{ cookieAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/RegistroIndicadorId' }],
        responses: {
          200: {
            description: 'Registro encontrado, com indicador, setor e fonte de dados.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RegistroIndicadorResposta' },
              },
            },
          },
          400: errorResponse,
          401: errorResponse,
          403: errorResponse,
          404: errorResponse,
        },
      },
    },
    '/admin/registros-indicadores/{id}/publicacao': {
      patch: {
        tags: ['Registros de indicadores'],
        summary: 'Publicar ou despublicar um registro',
        description:
          'Exige ADMIN ou SUPER_ADMIN aprovado e ativo. Envie publicado=true para publicar ou publicado=false para despublicar. Publicar exige indicador e setor ativos, inclusive ao repetir o estado publicado. Despublicar e permitido mesmo em indicador ou setor inativo. Repetir o estado atual retorna 200 quando essas condicoes sao atendidas. O estado controla a visibilidade nas consultas publicas e nao altera os demais campos.',
        operationId: 'alterarPublicacaoRegistroIndicador',
        security: [{ cookieAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/RegistroIndicadorId' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegistroIndicadorPublicacao' },
              examples: {
                publicar: { summary: 'Publicar', value: { publicado: true } },
                despublicar: { summary: 'Despublicar', value: { publicado: false } },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Estado de publicacao atualizado.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RegistroIndicadorResposta' },
              },
            },
          },
          400: errorResponse,
          401: errorResponse,
          403: errorResponse,
          404: errorResponse,
          409: errorResponse,
        },
      },
    },
    '/admin/setores': {
      post: {
        tags: ['Setores'],
        summary: 'Cadastrar um setor',
        description:
          'Exige uma conta ADMIN ou SUPER_ADMIN aprovada e ativa. O nome do setor e unico.',
        operationId: 'cadastrarSetor',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SetorEntrada' },
              example: {
                nome: 'Hospedagem',
                descricao: 'Hoteis, pousadas e outros meios de hospedagem.',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Setor cadastrado no banco.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/SetorResposta' } },
            },
          },
          400: errorResponse,
          401: errorResponse,
          403: errorResponse,
          409: errorResponse,
        },
      },
      get: {
        tags: ['Setores'],
        summary: 'Listar setores',
        operationId: 'listarSetores',
        security: [{ cookieAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/FiltroAtivo' }],
        responses: {
          200: {
            description: 'Setores ordenados pelo nome.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['setores'],
                  properties: {
                    setores: { type: 'array', items: { $ref: '#/components/schemas/Setor' } },
                  },
                },
              },
            },
          },
          400: errorResponse,
          401: errorResponse,
          403: errorResponse,
        },
      },
    },
    '/admin/setores/{id}': {
      patch: {
        tags: ['Setores'],
        summary: 'Editar, ativar ou desativar um setor',
        description:
          'Exige ADMIN ou SUPER_ADMIN aprovado e ativo. Envie ao menos um campo. Campos omitidos sao preservados; descricao aceita null. O nome continua unico. Desativar nao exclui indicadores ou registros nem altera seus estados de publicacao. Campos desconhecidos sao rejeitados.',
        operationId: 'editarSetor',
        security: [{ cookieAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/SetorId' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SetorEdicao' },
              example: { nome: 'Turismo e hospedagem', descricao: 'Descricao revisada.' },
            },
          },
        },
        responses: {
          200: {
            description: 'Setor atualizado.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/SetorResposta' } },
            },
          },
          400: errorResponse,
          401: errorResponse,
          403: errorResponse,
          404: errorResponse,
          409: errorResponse,
        },
      },
      get: {
        tags: ['Setores'],
        summary: 'Consultar um setor pelo ID',
        operationId: 'consultarSetor',
        security: [{ cookieAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/SetorId' }],
        responses: {
          200: {
            description: 'Setor encontrado.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/SetorResposta' } },
            },
          },
          400: errorResponse,
          401: errorResponse,
          403: errorResponse,
          404: errorResponse,
        },
      },
    },
    '/admin/indicadores': {
      post: {
        tags: ['Indicadores'],
        summary: 'Cadastrar um indicador',
        description:
          'Exige ADMIN ou SUPER_ADMIN aprovado e ativo. Copie o ID de um setor ativo cadastrado em POST /admin/setores.',
        operationId: 'cadastrarIndicador',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/IndicadorEntrada' },
              example: {
                nome: 'Leitos ocupados',
                unidade: 'leitos',
                descricao: 'Quantidade de leitos ocupados nos meios de hospedagem.',
                setorId: '22222222-2222-4222-8222-222222222222',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Indicador cadastrado e vinculado ao setor.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/IndicadorResposta' } },
            },
          },
          400: errorResponse,
          401: errorResponse,
          403: errorResponse,
          404: errorResponse,
          409: errorResponse,
        },
      },
      get: {
        tags: ['Indicadores'],
        summary: 'Listar indicadores',
        operationId: 'listarIndicadores',
        security: [{ cookieAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/FiltroAtivo' },
          {
            in: 'query',
            name: 'setorId',
            required: false,
            description: 'Filtrar pelo UUID do setor.',
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          200: {
            description: 'Indicadores ordenados pelo nome, com os dados de seus setores.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['indicadores'],
                  properties: {
                    indicadores: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Indicador' },
                    },
                  },
                },
              },
            },
          },
          400: errorResponse,
          401: errorResponse,
          403: errorResponse,
        },
      },
    },
    '/admin/indicadores/{id}': {
      patch: {
        tags: ['Indicadores'],
        summary: 'Editar, ativar ou desativar um indicador',
        description:
          'Exige ADMIN ou SUPER_ADMIN aprovado e ativo. Envie ao menos um campo. Campos omitidos sao preservados; descricao aceita null. Alterar setorId ou enviar ativo=true exige setor ativo. Editar os demais campos e desativar continuam permitidos em setor inativo. Desativar nao exclui registros nem altera sua publicacao. Campos desconhecidos sao rejeitados.',
        operationId: 'editarIndicador',
        security: [{ cookieAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/IndicadorId' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/IndicadorEdicao' },
              example: { nome: 'Total de leitos ocupados', descricao: 'Descricao revisada.' },
            },
          },
        },
        responses: {
          200: {
            description: 'Indicador atualizado, com setor associado.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/IndicadorResposta' } },
            },
          },
          400: errorResponse,
          401: errorResponse,
          403: errorResponse,
          404: errorResponse,
          409: errorResponse,
        },
      },
      get: {
        tags: ['Indicadores'],
        summary: 'Consultar um indicador pelo ID',
        operationId: 'consultarIndicador',
        security: [{ cookieAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/IndicadorId' }],
        responses: {
          200: {
            description: 'Indicador encontrado, com os dados do setor.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/IndicadorResposta' } },
            },
          },
          400: errorResponse,
          401: errorResponse,
          403: errorResponse,
          404: errorResponse,
        },
      },
    },
    '/status': {
      get: {
        tags: ['Status'],
        summary: 'Verificar se a API esta funcionando',
        operationId: 'consultarStatus',
        responses: {
          200: {
            description: 'API disponivel.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Status' },
                example: { status: 'positivo', servico: 'observasrs-api' },
              },
            },
          },
        },
      },
    },
    '/auth/registro': {
      post: {
        tags: ['Autenticacao'],
        summary: 'Solicitar uma conta administrativa',
        description:
          'Cria uma conta ADMIN inativa com status PENDENTE. O cadastro nao inicia uma sessao e depende da avaliacao do super administrador.',
        operationId: 'registrarSolicitacaoAdministrador',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegistroEntrada' },
              example: {
                nome: 'Integrante da SMCELT',
                email: 'integrante@exemplo.com',
                senha: 'senha-segura-123',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Solicitacao registrada no banco e aguardando avaliacao.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RegistroResposta' },
              },
            },
          },
          400: errorResponse,
          409: errorResponse,
          429: errorResponse,
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Autenticacao'],
        summary: 'Entrar na Area SMCELT',
        description:
          'Valida as credenciais de uma conta aprovada e grava o cookie HttpOnly da sessao. No Swagger, execute esta operacao antes de chamar as rotas protegidas.',
        operationId: 'realizarLogin',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginEntrada' },
              example: {
                email: 'superadmin@observasrs.local',
                senha: 'senha-configurada-no-env',
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login realizado. O navegador recebeu o cookie da sessao.',
            headers: {
              'Set-Cookie': {
                description: 'Cookie HttpOnly da sessao administrativa.',
                schema: { type: 'string' },
              },
            },
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UsuarioResposta' },
              },
            },
          },
          400: errorResponse,
          401: errorResponse,
          403: errorResponse,
          429: errorResponse,
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Autenticacao'],
        summary: 'Consultar o usuario autenticado',
        operationId: 'consultarSessao',
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: 'Dados da conta autenticada.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UsuarioResposta' },
              },
            },
          },
          401: errorResponse,
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Autenticacao'],
        summary: 'Encerrar a sessao',
        operationId: 'realizarLogout',
        security: [{ cookieAuth: [] }],
        responses: { 204: { description: 'Sessao encerrada.' } },
      },
    },
    '/admin/contas/{id}/desativar': {
      patch: {
        tags: ['Super administrador'],
        summary: 'Desativar o acesso de uma conta aprovada',
        description:
          'Exige SUPER_ADMIN aprovado e ativo. Nao exige corpo; campos adicionais sao rejeitados. Somente contas APROVADO com papel ADMIN ou EDITOR podem ser gerenciadas. A propria conta e todas as contas SUPER_ADMIN sao protegidas. Preserva status, senha, papel, avaliacao original e dados vinculados. A mudanca efetiva revoga as sessoes anteriores. Repetir a desativacao retorna 200 sem nova alteracao.',
        operationId: 'desativarConta',
        security: [{ cookieAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/ContaId' }],
        responses: {
          200: {
            description:
              'Conta aprovada mantida sem acesso. Novas tentativas de login recebem 403 e sessoes anteriores recebem 401 nas rotas protegidas.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ContaResposta' } },
            },
          },
          400: errorResponse,
          401: errorResponse,
          403: errorResponse,
          404: errorResponse,
          409: errorResponse,
        },
      },
    },
    '/admin/contas/{id}/reativar': {
      patch: {
        tags: ['Super administrador'],
        summary: 'Reativar o acesso de uma conta aprovada',
        description:
          'Exige SUPER_ADMIN aprovado e ativo. Nao exige corpo; campos adicionais sao rejeitados. Somente contas APROVADO com papel ADMIN ou EDITOR podem ser gerenciadas. Nao aprova contas pendentes ou rejeitadas e nao altera contas SUPER_ADMIN. A reativacao preserva senha, papel e avaliacao original. Exige novo login; cookies anteriores nao voltam a funcionar. Repetir a reativacao de uma conta ja ativa retorna 200 sem revogar sua sessao atual.',
        operationId: 'reativarConta',
        security: [{ cookieAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/ContaId' }],
        responses: {
          200: {
            description:
              'Conta aprovada com acesso ativo. O usuario pode realizar novo login com sua senha existente.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ContaResposta' } },
            },
          },
          400: errorResponse,
          401: errorResponse,
          403: errorResponse,
          404: errorResponse,
          409: errorResponse,
        },
      },
    },
    '/admin/solicitacoes': {
      get: {
        tags: ['Super administrador'],
        summary: 'Listar solicitacoes de acesso',
        description:
          'Exclui contas SUPER_ADMIN. Use status=APROVADO para gerenciar contas ja avaliadas; ativo=true ou ativo=false filtra o acesso atual sem alterar o status de aprovacao.',
        operationId: 'listarSolicitacoes',
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            in: 'query',
            name: 'status',
            required: false,
            schema: {
              type: 'string',
              enum: ['PENDENTE', 'APROVADO', 'REJEITADO'],
              default: 'PENDENTE',
            },
          },
          { in: 'query', name: 'ativo', required: false, schema: { type: 'boolean' } },
        ],
        responses: {
          200: {
            description: 'Solicitacoes encontradas no banco.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['solicitacoes'],
                  properties: {
                    solicitacoes: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Solicitacao' },
                    },
                  },
                },
              },
            },
          },
          400: errorResponse,
          401: errorResponse,
          403: errorResponse,
        },
      },
    },
    '/admin/solicitacoes/{id}/aprovar': {
      patch: {
        tags: ['Super administrador'],
        summary: 'Aprovar uma solicitacao',
        operationId: 'aprovarSolicitacao',
        security: [{ cookieAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/SolicitacaoId' }],
        responses: {
          200: {
            description: 'Conta aprovada e liberada para login.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AvaliacaoResposta' },
              },
            },
          },
          400: errorResponse,
          401: errorResponse,
          403: errorResponse,
          404: errorResponse,
          409: errorResponse,
        },
      },
    },
    '/admin/solicitacoes/{id}/rejeitar': {
      patch: {
        tags: ['Super administrador'],
        summary: 'Rejeitar uma solicitacao',
        description: 'A rejeicao nao exige justificativa nem corpo na requisicao.',
        operationId: 'rejeitarSolicitacao',
        security: [{ cookieAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/SolicitacaoId' }],
        responses: {
          200: {
            description: 'Conta rejeitada e mantida sem acesso.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AvaliacaoResposta' },
              },
            },
          },
          400: errorResponse,
          401: errorResponse,
          403: errorResponse,
          404: errorResponse,
          409: errorResponse,
        },
      },
    },
  },
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: env.AUTH_COOKIE_NAME,
        description: 'Cookie HttpOnly recebido depois de POST /auth/login.',
      },
    },
    parameters: {
      ContaId: {
        in: 'path',
        name: 'id',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      RelatorioId: {
        in: 'path',
        name: 'id',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      TipoRelatorioFiltro: {
        in: 'query',
        name: 'tipo',
        required: false,
        schema: { type: 'string', enum: ['TRIMESTRAL', 'SETORIAL', 'ANUAL'] },
      },
      PeriodoRelatorioFiltro: {
        in: 'query',
        name: 'periodoReferencia',
        required: false,
        schema: { type: 'string', minLength: 1, maxLength: 30 },
        example: '2026-T3',
      },
      PaginaPublica: {
        in: 'query',
        name: 'pagina',
        required: false,
        description:
          'Pagina solicitada, iniciando em 1. Paginas alem do total retornam lista vazia.',
        schema: { type: 'integer', minimum: 1, maximum: 1000000, default: 1 },
      },
      LimitePublico: {
        in: 'query',
        name: 'limite',
        required: false,
        description: 'Quantidade maxima de itens por pagina.',
        schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
      },
      FonteDadoId: {
        in: 'path',
        name: 'id',
        required: true,
        description: 'Identificador UUID da fonte de dados.',
        schema: { type: 'string', format: 'uuid' },
      },
      RegistroIndicadorId: {
        in: 'path',
        name: 'id',
        required: true,
        description: 'Identificador UUID do registro de indicador.',
        schema: { type: 'string', format: 'uuid' },
      },
      SetorId: {
        in: 'path',
        name: 'id',
        required: true,
        description: 'Identificador UUID do setor.',
        schema: { type: 'string', format: 'uuid' },
      },
      IndicadorId: {
        in: 'path',
        name: 'id',
        required: true,
        description: 'Identificador UUID do indicador.',
        schema: { type: 'string', format: 'uuid' },
      },
      FiltroAtivo: {
        in: 'query',
        name: 'ativo',
        required: false,
        description: 'true para ativos, false para inativos. Se omitido, lista ambos.',
        schema: { type: 'boolean' },
      },
      SolicitacaoId: {
        in: 'path',
        name: 'id',
        required: true,
        description: 'Identificador UUID da solicitacao.',
        schema: { type: 'string', format: 'uuid' },
      },
    },
    schemas: {
      ...pitColetasSchemas,
      RelatorioEntrada: {
        type: 'object',
        additionalProperties: false,
        required: ['titulo', 'tipo', 'periodoReferencia'],
        properties: {
          titulo: { type: 'string', minLength: 2, maxLength: 180 },
          descricao: { type: 'string', maxLength: 2000 },
          tipo: { type: 'string', enum: ['TRIMESTRAL', 'SETORIAL', 'ANUAL'] },
          periodoReferencia: { type: 'string', minLength: 1, maxLength: 30 },
        },
      },
      RelatorioEdicao: {
        type: 'object',
        additionalProperties: false,
        minProperties: 1,
        properties: {
          titulo: { type: 'string', minLength: 2, maxLength: 180 },
          descricao: { type: 'string', maxLength: 2000, nullable: true },
          tipo: { type: 'string', enum: ['TRIMESTRAL', 'SETORIAL', 'ANUAL'] },
          periodoReferencia: { type: 'string', minLength: 1, maxLength: 30 },
        },
      },
      RelatorioPublicacao: {
        type: 'object',
        additionalProperties: false,
        required: ['publicado'],
        properties: { publicado: { type: 'boolean' } },
      },
      RelatorioAdministrativo: {
        type: 'object',
        additionalProperties: false,
        required: [
          'id',
          'titulo',
          'descricao',
          'tipo',
          'periodoReferencia',
          'arquivoNome',
          'arquivoTamanho',
          'arquivoUrl',
          'criadoPorId',
          'criadoPor',
          'publicado',
          'criadoEm',
          'atualizadoEm',
          'publicadoEm',
        ],
        properties: {
          id: { type: 'string', format: 'uuid' },
          titulo: { type: 'string', maxLength: 180 },
          descricao: { type: 'string', nullable: true },
          tipo: { type: 'string', enum: ['TRIMESTRAL', 'SETORIAL', 'ANUAL'] },
          periodoReferencia: { type: 'string', maxLength: 30 },
          arquivoNome: { type: 'string', nullable: true },
          arquivoTamanho: { type: 'integer', minimum: 1, maximum: 10485760, nullable: true },
          arquivoUrl: {
            type: 'string',
            nullable: true,
            example: '/admin/relatorios/22222222-2222-4222-8222-222222222222/arquivo',
          },
          criadoPorId: { type: 'string', format: 'uuid' },
          criadoPor: {
            type: 'object',
            additionalProperties: false,
            required: ['id', 'nome'],
            properties: { id: { type: 'string', format: 'uuid' }, nome: { type: 'string' } },
          },
          publicado: { type: 'boolean' },
          criadoEm: { type: 'string', format: 'date-time' },
          atualizadoEm: { type: 'string', format: 'date-time' },
          publicadoEm: { type: 'string', format: 'date-time', nullable: true },
        },
      },
      RelatorioPublico: {
        type: 'object',
        additionalProperties: false,
        required: [
          'id',
          'titulo',
          'descricao',
          'tipo',
          'periodoReferencia',
          'publicadoEm',
          'arquivoUrl',
        ],
        properties: {
          id: { type: 'string', format: 'uuid' },
          titulo: { type: 'string', maxLength: 180 },
          descricao: { type: 'string', nullable: true },
          tipo: { type: 'string', enum: ['TRIMESTRAL', 'SETORIAL', 'ANUAL'] },
          periodoReferencia: { type: 'string', maxLength: 30 },
          publicadoEm: { type: 'string', format: 'date-time' },
          arquivoUrl: {
            type: 'string',
            example: '/relatorios/22222222-2222-4222-8222-222222222222/arquivo',
          },
        },
      },
      RelatorioResposta: {
        type: 'object',
        required: ['relatorio'],
        properties: {
          message: { type: 'string' },
          relatorio: { $ref: '#/components/schemas/RelatorioAdministrativo' },
        },
      },
      RelatorioPublicoResposta: {
        type: 'object',
        required: ['relatorio'],
        properties: { relatorio: { $ref: '#/components/schemas/RelatorioPublico' } },
      },
      RelatoriosResposta: {
        type: 'object',
        required: ['relatorios', 'paginacao'],
        properties: {
          relatorios: {
            type: 'array',
            items: { $ref: '#/components/schemas/RelatorioAdministrativo' },
          },
          paginacao: { $ref: '#/components/schemas/PaginacaoPublica' },
        },
      },
      RelatoriosPublicosResposta: {
        type: 'object',
        required: ['relatorios', 'paginacao'],
        properties: {
          relatorios: { type: 'array', items: { $ref: '#/components/schemas/RelatorioPublico' } },
          paginacao: { $ref: '#/components/schemas/PaginacaoPublica' },
        },
      },
      PaginacaoPublica: {
        type: 'object',
        required: ['pagina', 'limite', 'total', 'totalPaginas'],
        properties: {
          pagina: { type: 'integer', minimum: 1 },
          limite: { type: 'integer', minimum: 1, maximum: 100 },
          total: { type: 'integer', minimum: 0 },
          totalPaginas: { type: 'integer', minimum: 0 },
        },
      },
      SetorPublico: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'nome', 'descricao'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          nome: { type: 'string', maxLength: 100 },
          descricao: { type: 'string', nullable: true },
        },
      },
      IndicadorPublico: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'nome', 'unidade', 'descricao', 'setorId', 'setor'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          nome: { type: 'string', maxLength: 140 },
          unidade: { type: 'string', maxLength: 40 },
          descricao: { type: 'string', nullable: true },
          setorId: { type: 'string', format: 'uuid' },
          setor: { $ref: '#/components/schemas/SetorPublico' },
        },
      },
      RegistroPublico: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'indicadorId', 'fonteId', 'periodo', 'valor', 'indicador', 'fonte'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          indicadorId: { type: 'string', format: 'uuid' },
          fonteId: { type: 'string', format: 'uuid' },
          periodo: { type: 'string', format: 'date' },
          valor: { type: 'string', pattern: '^-?\\d{1,12}\\.\\d{2}$' },
          indicador: { $ref: '#/components/schemas/IndicadorPublico' },
          fonte: { $ref: '#/components/schemas/FonteDado' },
        },
      },
      SetorPublicoResposta: {
        type: 'object',
        required: ['setor'],
        properties: { setor: { $ref: '#/components/schemas/SetorPublico' } },
      },
      IndicadorPublicoResposta: {
        type: 'object',
        required: ['indicador'],
        properties: { indicador: { $ref: '#/components/schemas/IndicadorPublico' } },
      },
      RegistroPublicoResposta: {
        type: 'object',
        required: ['registro'],
        properties: { registro: { $ref: '#/components/schemas/RegistroPublico' } },
      },
      SetoresPublicosResposta: {
        type: 'object',
        required: ['setores', 'paginacao'],
        properties: {
          setores: { type: 'array', items: { $ref: '#/components/schemas/SetorPublico' } },
          paginacao: { $ref: '#/components/schemas/PaginacaoPublica' },
        },
      },
      IndicadoresPublicosResposta: {
        type: 'object',
        required: ['indicadores', 'paginacao'],
        properties: {
          indicadores: { type: 'array', items: { $ref: '#/components/schemas/IndicadorPublico' } },
          paginacao: { $ref: '#/components/schemas/PaginacaoPublica' },
        },
      },
      RegistrosPublicosResposta: {
        type: 'object',
        required: ['registros', 'paginacao'],
        properties: {
          registros: { type: 'array', items: { $ref: '#/components/schemas/RegistroPublico' } },
          paginacao: { $ref: '#/components/schemas/PaginacaoPublica' },
        },
      },
      FonteDadoEdicao: {
        type: 'object',
        minProperties: 1,
        additionalProperties: false,
        properties: {
          nome: { type: 'string', minLength: 2, maxLength: 150 },
          descricao: { type: 'string', maxLength: 2000, nullable: true },
          tipo: { type: 'string', minLength: 1, maxLength: 50 },
          referencia: { type: 'string', maxLength: 2000, nullable: true },
        },
      },
      SetorEdicao: {
        type: 'object',
        minProperties: 1,
        additionalProperties: false,
        properties: {
          nome: { type: 'string', minLength: 2, maxLength: 100 },
          descricao: { type: 'string', maxLength: 2000, nullable: true },
          ativo: { type: 'boolean' },
        },
      },
      IndicadorEdicao: {
        type: 'object',
        minProperties: 1,
        additionalProperties: false,
        properties: {
          nome: { type: 'string', minLength: 2, maxLength: 140 },
          unidade: { type: 'string', minLength: 1, maxLength: 40 },
          descricao: { type: 'string', maxLength: 2000, nullable: true },
          setorId: { type: 'string', format: 'uuid' },
          ativo: { type: 'boolean' },
        },
      },
      RegistroIndicadorEdicao: {
        type: 'object',
        minProperties: 1,
        additionalProperties: false,
        properties: {
          indicadorId: { type: 'string', format: 'uuid' },
          fonteId: { type: 'string', format: 'uuid' },
          periodo: { type: 'string', format: 'date' },
          valor: {
            oneOf: [
              { type: 'string', pattern: '^-?\\d{1,12}(\\.\\d{1,2})?$' },
              {
                type: 'number',
                minimum: -999999999999.99,
                maximum: 999999999999.99,
                multipleOf: 0.01,
              },
            ],
          },
          observacao: { type: 'string', maxLength: 2000, nullable: true },
        },
      },
      RegistroIndicadorPublicacao: {
        type: 'object',
        additionalProperties: false,
        required: ['publicado'],
        properties: { publicado: { type: 'boolean' } },
      },
      FonteDadoEntrada: {
        type: 'object',
        required: ['nome', 'tipo'],
        properties: {
          nome: { type: 'string', minLength: 2, maxLength: 150 },
          tipo: { type: 'string', minLength: 1, maxLength: 50 },
          descricao: { type: 'string', maxLength: 2000 },
          referencia: { type: 'string', maxLength: 2000 },
        },
      },
      FonteDado: {
        type: 'object',
        required: ['id', 'nome', 'tipo', 'descricao', 'referencia'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          nome: { type: 'string', maxLength: 150 },
          tipo: { type: 'string', maxLength: 50 },
          descricao: { type: 'string', nullable: true },
          referencia: { type: 'string', nullable: true },
        },
      },
      FonteDadoResposta: {
        type: 'object',
        required: ['fonte'],
        properties: {
          message: { type: 'string' },
          fonte: { $ref: '#/components/schemas/FonteDado' },
        },
      },
      RegistroIndicadorEntrada: {
        type: 'object',
        required: ['indicadorId', 'fonteId', 'periodo', 'valor'],
        properties: {
          indicadorId: { type: 'string', format: 'uuid' },
          fonteId: { type: 'string', format: 'uuid' },
          periodo: { type: 'string', format: 'date', example: '2026-09-01' },
          valor: {
            description:
              'Numero decimal ou string com ponto, sem notacao cientifica em strings. Ate 12 digitos inteiros e 2 casas decimais. Prefira string.',
            oneOf: [
              { type: 'string', pattern: '^-?[0-9]{1,12}(\\.[0-9]{1,2})?$', example: '120.00' },
              {
                type: 'number',
                minimum: -999999999999.99,
                maximum: 999999999999.99,
                multipleOf: 0.01,
              },
            ],
          },
          publicado: { type: 'boolean', default: false },
          observacao: { type: 'string', maxLength: 2000 },
        },
      },
      RegistroIndicador: {
        type: 'object',
        required: [
          'id',
          'indicadorId',
          'fonteId',
          'periodo',
          'valor',
          'publicado',
          'observacao',
          'criadoEm',
          'atualizadoEm',
          'indicador',
          'fonte',
        ],
        properties: {
          id: { type: 'string', format: 'uuid' },
          indicadorId: { type: 'string', format: 'uuid' },
          fonteId: { type: 'string', format: 'uuid' },
          periodo: { type: 'string', format: 'date' },
          valor: {
            type: 'string',
            pattern: '^-?[0-9]{1,12}\\.[0-9]{2}$',
            example: '120.00',
            description: 'Valor retornado como string com duas casas decimais.',
          },
          publicado: { type: 'boolean' },
          observacao: { type: 'string', nullable: true },
          criadoEm: { type: 'string', format: 'date-time' },
          atualizadoEm: { type: 'string', format: 'date-time' },
          indicador: { $ref: '#/components/schemas/Indicador' },
          fonte: { $ref: '#/components/schemas/FonteDado' },
        },
      },
      RegistroIndicadorResposta: {
        type: 'object',
        required: ['registro'],
        properties: {
          message: { type: 'string' },
          registro: { $ref: '#/components/schemas/RegistroIndicador' },
        },
      },
      SetorEntrada: {
        type: 'object',
        required: ['nome'],
        properties: {
          nome: { type: 'string', minLength: 2, maxLength: 100 },
          descricao: { type: 'string', maxLength: 2000 },
          ativo: { type: 'boolean', default: true },
        },
      },
      Setor: {
        type: 'object',
        required: ['id', 'nome', 'descricao', 'ativo'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          nome: { type: 'string', maxLength: 100 },
          descricao: { type: 'string', nullable: true },
          ativo: { type: 'boolean' },
        },
      },
      SetorResposta: {
        type: 'object',
        required: ['setor'],
        properties: {
          message: { type: 'string' },
          setor: { $ref: '#/components/schemas/Setor' },
        },
      },
      IndicadorEntrada: {
        type: 'object',
        required: ['nome', 'unidade', 'setorId'],
        properties: {
          nome: { type: 'string', minLength: 2, maxLength: 140 },
          unidade: { type: 'string', minLength: 1, maxLength: 40 },
          descricao: { type: 'string', maxLength: 2000 },
          setorId: { type: 'string', format: 'uuid' },
          ativo: { type: 'boolean', default: true },
        },
      },
      Indicador: {
        type: 'object',
        required: ['id', 'nome', 'unidade', 'descricao', 'setorId', 'ativo', 'criadoEm', 'setor'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          nome: { type: 'string', maxLength: 140 },
          unidade: { type: 'string', maxLength: 40 },
          descricao: { type: 'string', nullable: true },
          setorId: { type: 'string', format: 'uuid' },
          ativo: { type: 'boolean' },
          criadoEm: { type: 'string', format: 'date-time' },
          setor: { $ref: '#/components/schemas/Setor' },
        },
      },
      IndicadorResposta: {
        type: 'object',
        required: ['indicador'],
        properties: {
          message: { type: 'string' },
          indicador: { $ref: '#/components/schemas/Indicador' },
        },
      },
      Status: {
        type: 'object',
        required: ['status', 'servico'],
        properties: {
          status: { type: 'string', enum: ['positivo'] },
          servico: { type: 'string', example: 'observasrs-api' },
        },
      },
      RegistroEntrada: {
        type: 'object',
        required: ['nome', 'email', 'senha'],
        properties: {
          nome: { type: 'string', minLength: 2, maxLength: 120 },
          email: { type: 'string', format: 'email' },
          senha: { type: 'string', format: 'password', minLength: 8, maxLength: 128 },
        },
      },
      LoginEntrada: {
        type: 'object',
        required: ['email', 'senha'],
        properties: {
          email: { type: 'string', format: 'email' },
          senha: { type: 'string', format: 'password', maxLength: 128 },
        },
      },
      Usuario: {
        type: 'object',
        required: ['id', 'nome', 'email', 'papel', 'status'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          nome: { type: 'string' },
          email: { type: 'string', format: 'email' },
          papel: { type: 'string', enum: ['SUPER_ADMIN', 'ADMIN', 'EDITOR'] },
          status: { type: 'string', enum: ['PENDENTE', 'APROVADO', 'REJEITADO'] },
        },
      },
      Solicitacao: {
        allOf: [
          { $ref: '#/components/schemas/Usuario' },
          {
            type: 'object',
            required: ['ativo', 'criadoEm', 'atualizadoEm'],
            properties: {
              ativo: { type: 'boolean' },
              avaliadoEm: { type: 'string', format: 'date-time', nullable: true },
              avaliadoPorId: { type: 'string', format: 'uuid', nullable: true },
              criadoEm: { type: 'string', format: 'date-time' },
              atualizadoEm: { type: 'string', format: 'date-time' },
            },
          },
        ],
      },
      UsuarioResposta: {
        type: 'object',
        required: ['usuario'],
        properties: { usuario: { $ref: '#/components/schemas/Usuario' } },
      },
      RegistroResposta: {
        type: 'object',
        required: ['message', 'solicitacao'],
        properties: {
          message: { type: 'string' },
          solicitacao: { $ref: '#/components/schemas/Usuario' },
        },
      },
      AvaliacaoResposta: {
        type: 'object',
        required: ['message', 'solicitacao'],
        properties: {
          message: { type: 'string' },
          solicitacao: { $ref: '#/components/schemas/Solicitacao' },
        },
      },
      ContaResposta: {
        type: 'object',
        required: ['message', 'conta'],
        properties: {
          message: { type: 'string' },
          conta: { $ref: '#/components/schemas/Solicitacao' },
        },
      },
      Erro: {
        type: 'object',
        required: ['error', 'message'],
        properties: {
          error: { type: 'string' },
          message: { type: 'string' },
          details: {
            type: 'array',
            items: { type: 'object', additionalProperties: true },
          },
        },
      },
    },
  },
};
