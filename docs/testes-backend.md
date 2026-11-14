# Relatório de testes do backend do ObservaSRS

A suíte verifica as regras de validação e de acesso, a persistência no PostgreSQL e
os principais fluxos HTTP da API. Os testes usam contas, cadastros e PDFs fictícios.

## Resultado da execução

Em 10/11/2026, a suíte completa passou nos **41 testes**, distribuídos em nove
arquivos. O Vitest registrou **22,63 segundos** para a execução, além do tempo de
preparação do banco. As sete migrações foram aplicadas em um banco temporário vazio.

| Camada | Aprovados | Falhas | Ignorados |
| --- | ---: | ---: | ---: |
| Base sem PostgreSQL | 25 | 0 | 0 |
| Integração | 11 | 0 | 0 |
| Ponta a ponta (E2E) | 5 | 0 | 0 |
| **Total** | **41** | **0** | **0** |

## Escopo

| Camada | Casos | O que foi verificado |
| --- | ---: | --- |
| Base sem PostgreSQL | 25 | 20 testes unitários de validação, JWT, datas, decimais, edição parcial, coletas, PIT e PDFs. Inclui também os 5 testes de login existentes, que passam pelas rotas HTTP com persistência simulada. |
| Integração | 11 | Serviços com Prisma e PostgreSQL reais. Um cenário também verifica a gravação e a substituição do PDF no sistema de arquivos. |
| Ponta a ponta (E2E) | 5 | Requisições HTTP à aplicação Express com PostgreSQL, cookies e armazenamento de PDFs reais no ambiente de teste. |
| **Total** | **41** | |

### Casos de integração

1. Solicitação de acesso persistida como pendente com hash da senha.
2. Rejeição de um e-mail duplicado após normalização.
3. Incremento da versão da sessão ao desativar e reativar uma conta.
4. Tratamento da restrição de nome único de setor.
5. Edição parcial de setor com preservação dos outros campos.
6. Gravações concorrentes do mesmo indicador, fonte e período com preservação da precisão decimal.
7. Consulta pública paginada de registros publicados, restrita a vínculos ativos e sem observações internas.
8. Criação de estabelecimento e coleta em transação, com bloqueio de duplicidade mensal.
9. Exclusão do agregado público após desativar o estabelecimento de uma coleta publicada.
10. Atualização das datas e remoção da pendência de revisão de um item PIT.
11. Substituição de PDF com atualização dos metadados e remoção do arquivo anterior.

### Fluxos de ponta a ponta

1. Solicitar acesso, receber aprovação, entrar, ter a sessão invalidada após alteração de acesso e sair.
2. Cadastrar setor, indicador, fonte e registro, publicar o registro e retirá-lo da consulta pública.
3. Criar relatório, enviar PDF, publicar, baixar o arquivo original e bloquear o download ao despublicar.
4. Cadastrar um item PIT inativo, editá-lo, ativá-lo, registrar a revisão e ocultá-lo novamente.
5. Enviar uma coleta, aprovar, publicar somente o resumo agregado e conferir a retirada após despublicação.

Os E2E cobrem a API a partir das requisições HTTP. A interface no navegador, a
implantação e os testes de carga ficam fora deste escopo.

## Como reproduzir

Use Node.js 22.12 ou superior, npm 10 ou superior e PostgreSQL local em execução
para a suíte completa. A partir da raiz do repositório, execute:

```powershell
cd backend
npm ci
npm run test:all
```

Para a suíte completa, o executor usa a conexão local definida em `TEST_DATABASE_URL`
ou, na ausência dela, em `DATABASE_URL` do ambiente ou do `backend/.env`. A conta
precisa poder conectar ao banco administrativo `postgres` e criar bancos (`CREATEDB`).

A cada execução completa, o script cria um banco exclusivo com nome
`observasrs_test_<id>`, aplica as migrações e usa uma pasta temporária para os PDFs.
As próprias suítes preparam os dados. Ao terminar, o script remove o banco e a pasta
que criou, inclusive quando há falhas nos testes.

Abra `backend/reports/teste/index.html` no navegador para ver o resultado
e a duração de cada um dos 41 casos.
O arquivo `resultados.json` contém os mesmos resultados em formato para automação.
Para verificar só os 25 casos da base, execute `npm test` e consulte o terminal.
