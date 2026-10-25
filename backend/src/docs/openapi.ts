import type { JsonObject } from 'swagger-ui-express';

import { env } from '../config/env.js';

const errorResponse = {
  description: 'Erro na requisicao.',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/Erro' },
    },
  },
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
    { name: 'Status', description: 'Disponibilidade da API.' },
    { name: 'Autenticacao', description: 'Cadastro e sessao da equipe SMCELT.' },
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
      description: 'Aprovacao e rejeicao das solicitacoes de acesso.',
    },
  ],
  paths: {
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
    '/admin/solicitacoes': {
      get: {
        tags: ['Super administrador'],
        summary: 'Listar solicitacoes de acesso',
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
