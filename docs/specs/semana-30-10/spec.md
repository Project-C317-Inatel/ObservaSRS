# Especificação Técnica: Integração Frontend-Backend, Camada de Serviços e Mocks (Semana 30/10)

## 1. Contexto e Motivação

O **ObservaSRS** é a plataforma do Observatório do Turismo de Santa Rita do Sapucaí (SMCELT / Inatel - C317).
Atualmente, o frontend possui interface rica e componentes visuais funcionais, porém a maioria das telas consome dados estáticos fixados em arquivos `features/*/data.ts` (indicadores, relatórios públicos, inventário turístico PIT e métricas de destaque da home). A integração real com o backend está restrita ao fluxo de autenticação e sessão (`services/auth.ts`), à aprovação de solicitações de acesso para super administradores (`services/admin.ts`) e à verificação de status (`services/status.ts`).

O formulário de coleta autônoma tenta disparar chamadas para `POST /api/coletas`, mas essa rota não existe no backend. Além disso, o backend possui endpoints cadastrais restritos a administradores (`/admin/setores`, `/admin/indicadores`, `/admin/fontes-dados`, `/admin/registros-indicadores`), mas não disponibiliza nenhuma rota pública para leitura e filtragem de indicadores publicados, relatórios ou PIT.

Esta especificação define o alinhamento da camada de integração do frontend para:

1. Estruturar serviços HTTP e contratos tipados completos para todos os domínios.
2. Evoluir o cliente base `api.ts` para permitir envio de corpo em requisições `PATCH` e habilitar envio de payloads binários/multipart (preparando o terreno para upload de relatórios em PDF).
3. Conectar os hooks e componentes do frontend à API, implementando uma estratégia de fallback transparente (`VITE_USE_MOCKS`) baseada nos dados fixos para garantir que o desenvolvimento visual e a experiência de uso não sejam interrompidos enquanto o time de backend desenvolve os endpoints.
4. Ajustar as regras de acesso do painel administrativo no frontend, permitindo que usuários com perfil `ADMIN` acessem as futuras telas de gestão de dados, preservando a exclusividade do perfil `SUPER_ADMIN` na gestão e aprovação de contas.
5. Estabelecer e formalizar o contrato de API proposto para envio aos desenvolvedores do backend.

---

## 2. Escopo e Não-Escopo

### 2.1. No Escopo

- **Evolução do cliente HTTP (`services/api.ts`)**:
  - Ajuste do método `patch` para aceitar corpo (`body?: unknown`).
  - Flexibilização de cabeçalhos (`Content-Type`), permitindo que chamadas `multipart/form-data` (upload) não tenham o cabeçalho fixado forçadamente como `application/json`.
  - Suporte a métodos complementares (`delete`) necessários para manutenções administrativas.
- **Camada de Serviços Tipados (`frontend/src/services/`)**:
  - Implementação dos serviços: `indicadores.ts`, `relatorios.ts`, `pit.ts`, `registros.ts` e revisão de `coleta.ts`.
  - Definição dos contratos TypeScript em `frontend/src/types/` espelhando as respostas reais do backend e os contratos propostos.
- **Hooks com Fallback e Controle de Mocks (`features/*/use*.ts`)**:
  - Adaptação do `useIndicators` (com adaptador puro `adapter.ts`) e criação dos hooks `useReports`, `usePit` e `useHighlightMetrics`.
  - Decisão de fallback isolada em `frontend/src/services/fallback.ts` com duas funções puras e mockáveis: `isMockMode()` (verdadeira quando `VITE_USE_MOCKS=true`; o hook devolve os dados de `data.ts` sem chamar a API) e `shouldUseFallback()` (verdadeira quando `VITE_USE_MOCKS=true` ou `import.meta.env.DEV`; define se uma falha da API cai nos dados de `data.ts` com estado `ready` e log em dev). Em build de produção, falhas da API não usam fallback e retornam `status: 'error'`.
- **Ajuste de Autorização nas Rotas do Painel Administrativo**:
  - Adoção de sub-rotas em `App.tsx`: `/admin` (`allowedRoles={['ADMIN', 'SUPER_ADMIN']}`) exibe um componente placeholder mínimo (título "Painel administrativo", botão de sair e, só para `SUPER_ADMIN`, link para solicitações); `/admin/solicitacoes` (`allowedRoles={['SUPER_ADMIN']}`) renderiza a `AdminPage` atual sem verificação de papel interna. `ProtectedRoute.tsx` já aceita `allowedRoles` (sem mudança necessária).
  - Atualização de `useAdminSession` para tratar `ADMIN` e `SUPER_ADMIN` como `authenticated`.
- **Contrato de API formalizado para o Backend**:
  - Seção detalhada pronta para cópia contendo métodos, rotas, autenticação, payload, parâmetros, retornos de sucesso e erros previstos.

### 2.2. Fora de Escopo

- Atualização do arquivo `frontend/README.md` (postergada/descartada desta sprint).
- Implementação de código ou migrations no `backend/` (tarefa de outro membro da equipe).
- Criação de novas telas ou interfaces visuais complexas do painel administrativo (escopo de outra pessoa / sprint seguinte).
- Alteração da identidade visual, estilos do tema ou redesign de componentes públicos existentes.
- Integração com sistemas federais reais (Cadastur / FNRH Digital).

---

## 3. Requisitos do Sistema

### 3.1. Requisitos Funcionais (RF)

- **RF-01 (Cliente HTTP Flexível)**: O cliente `services/api.ts` deve permitir requisições `PATCH` com payload JSON, requisições com `FormData` sem sobrescrever o cabeçalho `Content-Type` do navegador, e requisições de deleção (`DELETE`).
- **RF-02 (Serviço de Indicadores e Setores)**: O frontend deve dispor de funções em `services/indicadores.ts` para listar setores, listar indicadores e buscar séries históricas/registros publicados.
- **RF-03 (Serviço de Relatórios)**: O frontend deve dispor de funções em `services/relatorios.ts` para listar relatórios públicos e, para uso administrativo, criar relatório com upload de arquivo PDF e remover relatório.
- **RF-04 (Serviço do PIT)**: O frontend deve dispor de funções em `services/pit.ts` para listar atrações públicas por categoria e gerenciar o inventário no admin (criar, atualizar, excluir).
- **RF-05 (Serviço de Registros de Indicadores)**: O frontend deve dispor de funções em `services/registros.ts` para listar, cadastrar e editar registros de indicadores (ADMIN/SUPER_ADMIN). A publicação e a despublicação são feitas via `PATCH /admin/registros-indicadores/:id` com `{ "publicado": boolean }`. Não há rota de exclusão de registros (preservação de histórico entre gestões: despublica-se em vez de excluir).
- **RF-06 (Serviço de Coletas Autônomas)**: O frontend deve alinhar `services/coleta.ts` ao endpoint oficial `POST /coletas` e incluir métodos administrativos para listar, aprovar e rejeitar coletas.
- **RF-07 (Hooks Resilientes com Fallback / Mock)**: Os hooks de consumo de dados devem tentar consumir a API do backend. A decisão é isolada em `frontend/src/services/fallback.ts`, com duas funções puras e mockáveis: `isMockMode()` e `shouldUseFallback()`. Regras:
  - Se `isMockMode()` (`VITE_USE_MOCKS=true`): o hook devolve imediatamente os dados fixos de `data.ts` com `status: 'ready'`, sem chamar a API.
  - Se a flag estiver inativa, o hook chama a API. Se `shouldUseFallback()` for verdadeira (`import.meta.env.DEV`) e a API falhar (404, 500 ou NetworkError), o hook carrega os dados fixos com `status: 'ready'`, emitindo aviso no console.
  - Em build de produção (`!import.meta.env.DEV`) sem `VITE_USE_MOCKS=true`: falha da API (404, 500, NetworkError) **não** usa dados fixos; o hook devolve `status: 'error'` e a tela mostra o estado de erro já existente.
  - Quando a API responder 200, os dados retornados prevalecem sobre os mocks.
- **RF-08 (Liberação do Perfil ADMIN no Painel)**: Usuários autenticados com o papel `ADMIN` devem conseguir acessar `/admin`, que mostra um placeholder mínimo (título "Painel administrativo", botão de sair e, somente para `SUPER_ADMIN`, link para solicitações). `/admin/solicitacoes` renderiza a AdminPage atual e é restrito a `SUPER_ADMIN` via `allowedRoles`. A AdminPage **não** faz verificação de papel interna, de forma que um `ADMIN` nunca dispara `GET /admin/solicitacoes` (que retornaria 403). `useAdminSession` trata `ADMIN` e `SUPER_ADMIN` como `authenticated`. `ProtectedRoute.tsx` já aceita `allowedRoles` e não requer alteração.

### 3.2. Requisitos Não Funcionais (RNF)

- **RNF-01 (Tipagem Estrita)**: Ausência total do tipo `any`; todos os dados transitados devem estar cobertos por interfaces TypeScript em `frontend/src/types/`.
- **RNF-02 (Padrões de Projeto e Estilo)**: Respeito integral às regras de formatação do repositório (aspas simples, ponto e vírgula, vírgula final, indentação de 2 espaços).
- **RNF-03 (Compatibilidade com Testes Vitest)**: Todos os novos serviços e hooks devem conter testes unitários em arquivos `*.test.ts(x)` usando `vi.mock` e React Testing Library, sem depender de rede ou banco ativo.
- **RNF-04 (Segurança e Isolamento)**: Credenciais de sessão gerenciadas exclusivamente via cookies `HttpOnly` (`credentials: 'include'`).

---

## 4. Critérios de Aceite

| Requisito | Critério de Aceite Verificável                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **RF-01** | `api.patch('/rota', { dado: 1 })` serializa o body corretamente; `api.post('/upload', formData)` não injeta `Content-Type: application/json`, permitindo o envio do boundary multipart pelo navegador; `api.delete('/rota/1')` executa requisição HTTP DELETE com sucesso.                                                                                                                                                                                                                                                                                           |
| **RF-02** | `listarSetores()`, `listarIndicadores()` e `listarRegistrosPublicados(filtros)` chamam as rotas corretas com tipagem estrita de entrada e saída.                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **RF-03** | `listarRelatorios()` retorna lista de `PublicReport`; `uploadRelatorio(formData)` envia arquivo e metadados para rota administrativa.                                                                                                                                                                                                                                                                                                                                                                                                                                |
| **RF-04** | `listarItensPit(categoria?)` envia query string quando aplicável e retorna lista tipada `PitItem[]`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **RF-05** | `atualizarRegistroIndicador(id, dados)` executa PATCH com corpo tipado; `alterarPublicacaoRegistro(id, publicado)` chama `PATCH /admin/registros-indicadores/:id` com `{ "publicado": boolean }`. Não existe função de exclusão de registros.                                                                                                                                                                                                                                                                                                                        |
| **RF-06** | `enviarColeta(dados)` dispara POST para `/coletas`; `listarColetasAdmin(status?)` e aprovação/rejeição executam com credenciais de admin.                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **RF-07** | Com `isMockMode()` verdadeira, o hook retorna `status: 'ready'` com os dados de `data.ts`, sem chamar a API. Com a flag inativa e `shouldUseFallback()` verdadeira (dev), falha da API (404/500/NetworkError) aplica fallback para `data.ts` com `status: 'ready'`. Em build de produção sem a flag, falha da API resulta em `status: 'error'` (sem fallback). Quando a API responder 200, os dados retornados prevalecem sobre os mocks. As duas funções ficam em `services/fallback.ts`, mockáveis nos testes via `vi.mock`, e têm teste próprio com `vi.stubEnv`. |
| **RF-08** | Um usuário com `papel: 'ADMIN'` autenticado consegue carregar `/admin` e vê o placeholder mínimo. Apenas `SUPER_ADMIN` vê o link para `/admin/solicitacoes`. `ADMIN` é redirecionado se tentar acessar `/admin/solicitacoes`. `SUPER_ADMIN` acessa ambas as rotas. Anônimo é redirecionado para `/login`. `ProtectedRoute.tsx` não requer alteração.                                                                                                                                                                                                                 |

---

## 5. Proposta de Contrato de API (Para Envio ao Time de Backend)

> **Nota para envio:** O conteúdo delimitado a seguir deve ser compartilhado com a equipe responsável pelo backend (`backend/src/`). Ele lista os endpoints existentes e os endpoints propostos para viabilizar as entregas públicas e administrativas.

---

### PROPOSTA DE CONTRATO DE API — ObservaSRS (SMCELT)

#### 1. Visão Geral das Convenções

- **Formato padrão**: JSON (`application/json`), exceto em upload de relatórios (`multipart/form-data`) e download de PDFs (`application/pdf`).
- **Padrão de nomenclatura**: Chaves em `camelCase`.
- **Datas**: Formato ISO `AAAA-MM-DD` (ex.: `"2026-09-01"`).
- **Valores decimais**: Serializados como string com 2 casas decimais (ex.: `"1240.50"`).
- **Autenticação**: Sessão persistida em cookie `HttpOnly` via `/auth/login`. Rotas administrativas exigem cookie válido e papel `ADMIN` ou `SUPER_ADMIN`.
- **Formato padrão de erro**:
  ```json
  {
    "error": "codigo_do_erro",
    "message": "Mensagem descritiva.",
    "details": []
  }
  ```

---

#### 2. Endpoints que já existem no Backend (Status Atual)

_Referência: `backend/src/docs/openapi.ts`._

- `GET /status` (Público): Verificação de integridade da API.
- `POST /auth/registro` (Público): Solicitação de cadastro para a equipe SMCELT.
- `POST /auth/login` (Público): Autenticação de equipe com geração de cookie `HttpOnly`.
- `GET /auth/me` (Autenticado): Dados do usuário logado.
- `POST /auth/logout` (Autenticado): Encerramento de sessão.
- `GET /admin/solicitacoes` (Exclusivo SUPER_ADMIN): Listagem de solicitações com filtro opcional por `status`.
- `PATCH /admin/solicitacoes/:id/aprovar` (Exclusivo SUPER_ADMIN): Aprovação de conta.
- `PATCH /admin/solicitacoes/:id/rejeitar` (Exclusivo SUPER_ADMIN): Rejeição de conta.
- `POST|GET /admin/setores` e `GET /admin/setores/:id` (ADMIN / SUPER_ADMIN): Gestão cadastral de setores.
- `POST|GET /admin/indicadores` e `GET /admin/indicadores/:id` (ADMIN / SUPER_ADMIN): Gestão de indicadores vinculados a setores.
- `POST|GET /admin/fontes-dados` e `GET /admin/fontes-dados/:id` (ADMIN / SUPER_ADMIN): Gestão de fontes.
- `POST|GET /admin/registros-indicadores` e `GET /admin/registros-indicadores/:id` (ADMIN / SUPER_ADMIN): Cadastro e listagem de registros por período.

---

#### 3. Endpoints Propostos para Desenvolvimento no Backend

##### 3.1. Leitura Pública de Indicadores e Setores (Sem Autenticação)

###### `GET /setores`

- **Finalidade**: Listar setores da cidade que estão ativos para popular os filtros da página de indicadores.
- **Autenticação**: Nenhuma (Público).
- **Filtros (Query Params)**: Nenhum (apenas retorna setores com `ativo: true`).
- **Resposta Sucesso (200 OK)**:
  ```json
  {
    "setores": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "nome": "Hotelaria",
        "descricao": "Meios de hospedagem de Santa Rita do Sapucaí."
      }
    ]
  }
  ```

###### `GET /indicadores`

- **Finalidade**: Listar indicadores ativos disponíveis para consulta pública.
- **Autenticação**: Nenhuma (Público).
- **Filtros (Query Params)**:
  - `setorId` (UUID, opcional): Filtrar indicadores de um setor específico.
- **Resposta Sucesso (200 OK)**:
  ```json
  {
    "indicadores": [
      {
        "id": "22222222-2222-4222-8222-222222222222",
        "nome": "Taxa de ocupação",
        "codigo": "taxa_ocupacao",
        "unidade": "%",
        "descricao": "Percentual de ocupação hoteleira.",
        "setor": {
          "id": "11111111-1111-4111-8111-111111111111",
          "nome": "Hotelaria"
        }
      }
    ]
  }
  ```

> **Tabela de códigos de indicadores (`codigo`)**: Slug estável que mapeia cada indicador ao campo correspondente de `IndicatorRecord` usado pela UI.
>
> | `codigo`        | Significado                     | Campo de `IndicatorRecord` alimentado |
> | --------------- | ------------------------------- | ------------------------------------- |
> | `visitantes`    | Fluxo de visitantes (pernoites) | `visitors`                            |
> | `pernoites`     | Quantidade de pernoites         | `secondaryMetrics['overnightStays']`  |
> | `taxa_ocupacao` | Taxa de ocupação hoteleira      | `secondaryMetrics['occupancyRate']`   |
> | `estada_media`  | Estada média (dias)             | `secondaryMetrics['averageStay']`     |

###### `GET /indicadores/dados`

- **Finalidade**: Obter a série de valores de indicadores para alimentação dos gráficos e métricas públicas. **Retorna exclusivamente registros com `publicado = true` e cujos indicador e setor estejam ativos.**
- **Autenticação**: Nenhuma (Público).
- **Filtros (Query Params)**:
  - `indicadorId` (UUID, opcional): Filtrar por indicador específico.
  - `setorId` (UUID, opcional): Filtrar registros de um setor específico.
  - `ano` (número, ex.: `2026`, opcional).
  - `periodoInicio` (data ISO `AAAA-MM-DD`, opcional).
  - `periodoFim` (data ISO `AAAA-MM-DD`, opcional).
- **Resposta Sucesso (200 OK)**:
  ```json
  {
    "registros": [
      {
        "id": "44444444-4444-4444-8444-444444444444",
        "indicadorId": "22222222-2222-4222-8222-222222222222",
        "indicadorNome": "Taxa de ocupação",
        "indicadorCodigo": "taxa_ocupacao",
        "unidade": "%",
        "setorNome": "Hotelaria",
        "periodo": "2026-02-01",
        "valor": "78.00"
      }
    ]
  }
  ```
- **Erros**: 400 (`validation_error`).

###### `GET /indicadores/destaques`

- **Finalidade**: Alimentar os 4 cards da Hero da página inicial (Hospedagens, Leitos, Empresas Cadastur, Empregos).
- **Autenticação**: Nenhuma (Público).
- **Resposta Sucesso (200 OK)**:
  ```json
  {
    "destaques": [
      {
        "id": "hospedagens",
        "valor": 42,
        "rotulo": "Hospedagens",
        "legenda": "+3 desde 2024"
      },
      {
        "id": "leitos",
        "valor": 2730,
        "rotulo": "Leitos ocupados",
        "legenda": "Média julho/2025"
      },
      {
        "id": "empresas",
        "valor": 236,
        "rotulo": "Empresas cadastradas",
        "legenda": "Cadastur ativo"
      },
      {
        "id": "empregos",
        "valor": 1472,
        "rotulo": "Empregos gerados",
        "legenda": "Setor turístico"
      }
    ]
  }
  ```

---

##### 3.2. Relatórios Públicos e Gestão de Arquivos PDF

###### `GET /relatorios`

- **Finalidade**: Listar relatórios publicados disponíveis para download pelo público em geral.
- **Autenticação**: Nenhuma (Público).
- **Filtros (Query Params)**:
  - `tipo` (string opcional: `'Trimestral' | 'Setorial' | 'Anual'`).
- **Resposta Sucesso (200 OK)**:
  ```json
  {
    "relatorios": [
      {
        "id": "55555555-5555-4555-8555-555555555555",
        "titulo": "Relatório OT nº 004/2025",
        "descricao": "Dados de ocupação hoteleira – 2º trimestre",
        "tipo": "Trimestral",
        "publicadoEm": "2025-06-15",
        "arquivoUrl": "/relatorios/55555555-5555-4555-8555-555555555555/download"
      }
    ]
  }
  ```

###### `GET /relatorios/:id/download`

- **Finalidade**: Download direto do arquivo PDF do relatório.
- **Autenticação**: Nenhuma (Público).
- **Resposta Sucesso (200 OK)**: Stream binário com `Content-Type: application/pdf` e cabeçalho `Content-Disposition: attachment; filename="relatorio.pdf"`.
- **Erros**: 404 (`report_not_found`).

###### `POST /admin/relatorios`

- **Finalidade**: Enviar novo relatório com arquivo PDF.
- **Autenticação**: Exige `ADMIN` ou `SUPER_ADMIN`.
- **Content-Type**: `multipart/form-data`.
- **Campos**:
  - `titulo` (string, 3 a 150 caracteres).
  - `descricao` (string, até 500 caracteres).
  - `tipo` (enum: `'Trimestral'`, `'Setorial'`, `'Anual'`).
  - `publicadoEm` (string formato `AAAA-MM-DD`).
  - `arquivo` (arquivo PDF, máx. 15MB).
- **Resposta Sucesso (201 Created)**:
  ```json
  {
    "message": "Relatorio publicado com sucesso.",
    "relatorio": {
      "id": "55555555-5555-4555-8555-555555555555",
      "titulo": "Relatório OT nº 004/2025",
      "tipo": "Trimestral",
      "publicadoEm": "2025-06-15",
      "arquivoUrl": "/relatorios/55555555-5555-4555-8555-555555555555/download"
    }
  }
  ```
- **Erros**: 400 (`validation_error`), 401 (`authentication_required`), 403 (`admin_required`).

###### `DELETE /admin/relatorios/:id`

- **Finalidade**: Excluir relatório e respectivo arquivo PDF.
- **Autenticação**: Exige `ADMIN` ou `SUPER_ADMIN`.
- **Resposta Sucesso (200 OK)**:
  ```json
  { "message": "Relatorio removido com sucesso." }
  ```
- **Erros**: 401 (`authentication_required`), 403 (`admin_required`), 404 (`report_not_found`).

---

##### 3.3. Edição e Publicação de Registros de Indicadores

###### `PATCH /admin/registros-indicadores/:id`

- **Finalidade**: Alterar valor, observação, fonte ou período de um registro existente.
- **Autenticação**: Exige `ADMIN` ou `SUPER_ADMIN`.
- **Corpo da Requisição (JSON)**:
  ```json
  {
    "valor": "1350.00",
    "observacao": "Correção de lançamento de leitos.",
    "publicado": true
  }
  ```
- **Resposta Sucesso (200 OK)**:
  ```json
  {
    "message": "Registro atualizado com sucesso.",
    "registro": {
      "id": "44444444-4444-4444-8444-444444444444",
      "indicadorId": "22222222-2222-4222-8222-222222222222",
      "fonteId": "33333333-3333-4333-8333-333333333333",
      "periodo": "2026-09-01",
      "valor": "1350.00",
      "publicado": true,
      "observacao": "Correção de lançamento de leitos.",
      "criadoEm": "2026-09-02T10:00:00.000Z",
      "atualizadoEm": "2026-09-05T14:20:00.000Z"
    }
  }
  ```
- **Erros**: 400 (`validation_error`), 401 (`authentication_required`), 403 (`admin_required`), 404 (`indicator_record_not_found`), 409 (`registro_indicador_conflict`, se conflitar chave única `indicador + fonte + periodo`).

> **Nota sobre publicação/despublicação**: A publicação e a despublicação de registros são feitas exclusivamente via `PATCH /admin/registros-indicadores/:id` com `{ "publicado": boolean }`. Não existe rota dedicada `/publicar` nem rota de exclusão de registros — a proposta pede preservar o histórico entre gestões, então despublica-se em vez de excluir.

---

##### 3.4. Coleta Autônoma por Meios de Hospedagem

###### `POST /coletas`

- **Finalidade**: Envio público de dados mensais pelos estabelecimentos.
- **Autenticação**: Nenhuma (Público, com **Rate Limit rigoroso por IP**).
- **Corpo da Requisição (JSON)**:
  ```json
  {
    "nomeEstabelecimento": "Pousada do Vale",
    "cnpjCadastur": "12.345.678/0001-90",
    "periodoReferencia": "2026-10",
    "leitosOcupados": 48,
    "origemVisitantes": "sudeste"
  }
  ```
- **Regra de Negócio**: Os dados **não** são publicados diretamente; entram com status `PENDENTE`.
- **Resposta Sucesso (201 Created)**:
  ```json
  {
    "message": "Dados de coleta recebidos com sucesso. Agradecemos sua colaboracao!",
    "coleta": {
      "id": "66666666-6666-4666-8666-666666666666",
      "status": "PENDENTE",
      "criadoEm": "2026-10-28T18:00:00.000Z"
    }
  }
  ```
- **Erros**: 400 (`validation_error`), 429 (`too_many_collection_attempts`).

###### `GET /admin/coletas`

- **Finalidade**: Listar coletas enviadas pela rede hoteleira para triagem da SMCELT.
- **Autenticação**: Exige `ADMIN` ou `SUPER_ADMIN`.
- **Query Params**: `status` (`'PENDENTE' | 'APROVADO' | 'REJEITADO'`).
- **Resposta Sucesso (200 OK)**:
  ```json
  {
    "coletas": [
      {
        "id": "66666666-6666-4666-8666-666666666666",
        "nomeEstabelecimento": "Pousada do Vale",
        "cnpjCadastur": "12.345.678/0001-90",
        "periodoReferencia": "2026-10",
        "leitosOcupados": 48,
        "origemVisitantes": "sudeste",
        "status": "PENDENTE",
        "criadoEm": "2026-10-28T18:00:00.000Z"
      }
    ]
  }
  ```
- **Erros**: 401 (`authentication_required`), 403 (`admin_required`).

###### `PATCH /admin/coletas/:id/aprovar`

- **Finalidade**: Validar a coleta autônoma pela equipe da prefeitura.
- **Autenticação**: Exige `ADMIN` ou `SUPER_ADMIN`.
- **Resposta Sucesso (200 OK)**:
  ```json
  { "message": "Coleta aprovada com sucesso." }
  ```
- **Erros**: 401 (`authentication_required`), 403 (`admin_required`), 404 (`collection_not_found`).

###### `PATCH /admin/coletas/:id/rejeitar`

- **Finalidade**: Rejeitar coleta inconsistente com justificativa opcional.
- **Autenticação**: Exige `ADMIN` ou `SUPER_ADMIN`.
- **Corpo da Requisição (JSON)**:
  ```json
  { "motivo": "CNPJ nao localizado na base do Cadastur." }
  ```
- **Resposta Sucesso (200 OK)**:
  ```json
  { "message": "Coleta rejeitada." }
  ```
- **Erros**: 400 (`validation_error`), 401 (`authentication_required`), 403 (`admin_required`), 404 (`collection_not_found`).

---

##### 3.5. Inventário Turístico (PIT)

###### `GET /pit`

- **Finalidade**: Listar atrativos e equipamentos turísticos para exibição no mapa e catálogo público.
- **Autenticação**: Nenhuma (Público).
- **Query Params**:
  - `categoria` (string opcional, ex.: `'Gastronomia'`, `'Atração Natural'`, `'Museu / Cultura'`, etc.).
- **Resposta Sucesso (200 OK)**:
  ```json
  {
    "itens": [
      {
        "id": "77777777-7777-4777-8777-777777777777",
        "nome": "Museu de Ciência e Tecnologia",
        "categoria": "Museu / Cultura",
        "descricao": "Acervo sobre a história tecnológica do Vale da Eletrônica.",
        "imagemUrl": null,
        "localizacao": "Centro",
        "atualizadoEm": "2025-07-05"
      }
    ]
  }
  ```

###### `POST /admin/pit`

- **Finalidade**: Cadastrar novo atrativo no inventário municipal.
- **Autenticação**: Exige `ADMIN` ou `SUPER_ADMIN`.
- **Corpo da Requisição (JSON)**:
  ```json
  {
    "nome": "Teatro Municipal Bibi Ferreira",
    "categoria": "Arte / Cultura",
    "descricao": "Espaço para espetáculos e apresentações culturais.",
    "localizacao": "Centro",
    "imagemUrl": null
  }
  ```
- **Resposta Sucesso (201 Created)**:
  ```json
  {
    "message": "Item do PIT cadastrado com sucesso.",
    "item": {
      "id": "77777777-7777-4777-8777-777777777777",
      "nome": "Teatro Municipal Bibi Ferreira",
      "categoria": "Arte / Cultura",
      "descricao": "Espaço para espetáculos e apresentações culturais.",
      "localizacao": "Centro",
      "imagemUrl": null,
      "atualizadoEm": "2026-10-28"
    }
  }
  ```
- **Erros**: 400 (`validation_error`), 401 (`authentication_required`), 403 (`admin_required`).

###### `PATCH /admin/pit/:id`

- **Finalidade**: Atualizar dados de um atrativo turístico e registrar a nova data de revisão periódica pela SMCELT.
- **Autenticação**: Exige `ADMIN` ou `SUPER_ADMIN`.
- **Resposta Sucesso (200 OK)**:
  ```json
  {
    "message": "Item do PIT atualizado com sucesso.",
    "item": {
      "id": "77777777-7777-4777-8777-777777777777",
      "atualizadoEm": "2026-10-28"
    }
  }
  ```
- **Erros**: 400 (`validation_error`), 401 (`authentication_required`), 403 (`admin_required`), 404 (`pit_item_not_found`).

###### `DELETE /admin/pit/:id`

- **Finalidade**: Remover atrativo desativado do inventário.
- **Autenticação**: Exige `ADMIN` ou `SUPER_ADMIN`.
- **Resposta Sucesso (200 OK)**:
  ```json
  { "message": "Item do PIT removido com sucesso." }
  ```
- **Erros**: 401 (`authentication_required`), 403 (`admin_required`), 404 (`pit_item_not_found`).

---

## 6. Decisões Tomadas

1. **Prefixo das rotas de coleta**: O código legado em `services/coleta.ts` utilizava `/api/coletas`, mas todas as demais rotas existentes no backend (`/auth/*`, `/admin/*`, `/status`) não usam o prefixo `/api`. **Decisão:** O backend implementará `POST /coletas` sem o prefixo `/api` para manter o padrão REST adotado no monorepo. Não há fallback nem compatibilidade com `/api/coletas`.

2. **Exclusão de registros de indicadores**: A proposta pede preservar o histórico entre gestões. **Decisão:** Não há rota de exclusão de registros. A despublicação é feita via `PATCH /admin/registros-indicadores/:id` com `{ "publicado": false }`.

3. **Adaptador API → telas de indicadores**: O endpoint `/indicadores/dados` devolve registros genéricos (`indicadorNome`, `indicadorCodigo`, `valor`). A conversão para `IndicatorRecord[]` é feita por um adaptador puro (`features/indicators/adapter.ts`) que agrupa por período e setor (via `setorNome`). As agregações (soma, média) seguem no cliente em `logic.ts`.

4. **Fallback em produção**: Em build de produção sem `VITE_USE_MOCKS=true`, falha da API não ativa fallback para dados fixos. A decisão é isolada em `services/fallback.ts` (`isMockMode()` e `shouldUseFallback()`).

## 7. Perguntas em Aberto e Suposições Registradas

1. **Identificador do PIT e Relatórios**: Nos dados demonstrativos do frontend (`features/pit/data.ts` e `features/reports/data.ts`), o campo `id` era numérico (`1, 2, 3...`). O backend padroniza chaves primárias em UUID (`@id @default(uuid())`).
   - _Suposição adotada:_ Os novos contratos tipados em `types/` assumirão `id: string` para compatibilidade direta com UUID do Prisma e PostgreSQL. Os tipos `PublicReport`, `PitItem` e os auxiliares `ReportType` e `PitCategory` passam a viver em `types/api.ts`; os `data.ts` importam desses tipos (sem duplicar definições) e usam ids string nos dados fixos.
2. **Download de Relatórios**: O download de PDFs poderá ser servido via endpoint de streaming (`GET /relatorios/:id/download`) ou por URLs estáticas geradas a partir de pasta pública (ex.: `/uploads/relatorios/...`).
   - _Suposição adotada:_ O frontend suportará ambas as abordagens aceitando uma string de URL (`arquivoUrl`). Quando `arquivoUrl` for caminho relativo (ex.: `/relatorios/:id/download`), o frontend o resolve contra `VITE_API_URL` (via helper no serviço de relatórios), porque o site e a API ficam em origens diferentes; URLs absolutas são usadas como vieram.
3. **Agregação de Indicadores Públicos**: Os dados de gráficos (`visitorFlow`) e métricas secundárias do frontend demandam soma ou média por setor e mês.
   - _Suposição adotada:_ O endpoint `/indicadores/dados` devolverá a lista de registros publicados puros, e a lógica de derivação existente em `features/indicators/logic.ts` continuará realizando as agregações no cliente, mantendo o backend leve e flexível.
