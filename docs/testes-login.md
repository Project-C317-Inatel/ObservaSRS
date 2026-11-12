# Testes de login SMCELT

## Objetivo

Verificar o login, a sessao e as permissoes administrativas da API com cinco testes
automatizados. Vitest executa os testes e Supertest envia requisicoes para a aplicacao Express.

O arquivo da bateria e `backend/test/auth.test.ts`, e sua configuracao fica em
`backend/vitest.config.ts`.

## Preparacao e execucao

Requisitos: Node.js 22.12 ou superior e npm 10 ou superior.

A partir da raiz do repositorio:

```powershell
cd backend
npm ci
npm test -- test/auth.test.ts
```

O comando gera o cliente Prisma e executa a bateria uma vez. Em uma execução bem-sucedida,
o terminal mostra `Tests 5 passed (5)`.

## Cenarios

| Teste                                                                | Resultado esperado                                                                                                    |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Login com credenciais corretas retorna 200 e cria o cookie de sessao | A API retorna os dados publicos do usuario, cria um cookie `HttpOnly` e permite consultar `/auth/me` com esse cookie. |
| Senha incorreta retorna 401                                          | A API recusa o login e nao cria o cookie de sessao.                                                                   |
| Conta pendente ou rejeitada nao consegue entrar                      | As duas situacoes retornam `403`, mesmo com a senha correta.                                                          |
| Apenas o super administrador consegue aprovar ou rejeitar contas     | `ADMIN` e `EDITOR` recebem `403`; `SUPER_ADMIN` consegue executar as duas acoes e registra os dados de avaliacao.     |
| Acesso a uma rota protegida sem login retorna 401                    | A consulta a `/admin/solicitacoes` exige uma sessao valida.                                                           |

Cada linha corresponde a um unico teste no relatorio. As variacoes de status e permissoes
sao verificadas dentro do respectivo teste.

## Relatorio HTML

Os cinco cenários de login aparecem no relatório dos 41 testes. Gere o relatório com
`npm run test:all` e abra o arquivo no navegador:

```text
backend/reports/teste/index.html
```

Os requisitos para gerar o HTML estão no [relatório de testes do backend](testes-backend.md).

## Modo de acompanhamento

Na pasta `backend/`:

```powershell
npm run test:watch -- test/auth.test.ts
```

O Vitest acompanha alteracoes e reexecuta os testes, mostrando os resultados no terminal.

## Isolamento

As consultas e atualizacoes do Prisma sao simuladas. Os controllers, middlewares,
a comparacao de senhas com bcrypt, os tokens JWT e os cookies usam o codigo real da API.

Os testes utilizam contas ficticias e configuracao exclusiva de testes. Nao exigem
PostgreSQL, `.env` configurado ou API em execucao e nao criam nem alteram contas no banco real.
Esta bateria verifica o comportamento da API com persistencia simulada; nao comprova a
gravacao de dados no PostgreSQL.
