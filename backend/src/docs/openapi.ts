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
      'API do Observatorio do Turismo de Santa Rita do Sapucai. Use esta pagina para acompanhar o fluxo de cadastro, autenticacao e aprovacao das contas da equipe SMCELT.',
  },
  servers: [{ url: '/', description: 'Servidor atual' }],
  tags: [
    { name: 'Status', description: 'Disponibilidade da API.' },
    { name: 'Autenticacao', description: 'Cadastro e sessao da equipe SMCELT.' },
    {
      name: 'Super administrador',
      description: 'Aprovacao e rejeicao das solicitacoes de acesso.',
    },
  ],
  paths: {
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
      SolicitacaoId: {
        in: 'path',
        name: 'id',
        required: true,
        description: 'Identificador UUID da solicitacao.',
        schema: { type: 'string', format: 'uuid' },
      },
    },
    schemas: {
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
