# Tarefas de Implementação: Integração Frontend-Backend, Camada de Serviços e Mocks (Semana 30/10)

Legenda de dependência:

- 🟢 **[Pode andar com mock]**: Desenvolvimento, tipagem e testes unitários funcionam 100% de forma desacoplada com mocks/fallbacks.
- 🟡 **[Depende de endpoint do backend para integração fim-a-fim]**: Código e testes com mocks ficam prontos imediatamente, mas o teste com backend real depende da entrega do endpoint pela equipe de backend.

---

### Fase 1: Cliente HTTP Base e Tipos de Contrato

- [x] **Task 1.1: Criar arquivo de variáveis de ambiente `frontend/.env.example`** 🟢 [Pode andar com mock]
  - **Arquivos envolvidos**: `frontend/.env.example`
  - **Critério de aceite**:
    - Criação de `frontend/.env.example` contendo as variáveis padrão `VITE_API_URL=http://localhost:3333` e `VITE_USE_MOCKS=false`.
    - Inclusão de comentário curto orientando o uso das variáveis no ambiente local.
  - **Teste esperado**: Arquivo criado e validado no repositório.

- [x] **Task 1.2: Evoluir cliente HTTP `services/api.ts` para suportar body em PATCH, FormData e método DELETE** 🟢 [Pode andar com mock]
  - **Arquivos envolvidos**: `frontend/src/services/api.ts`, `frontend/src/services/api.test.ts`
  - **Critério de aceite**:
    - `api.patch<T>(path, body)` aceita parâmetro de corpo opcional e o serializa em JSON.
    - O método `request` detecta se `options.body instanceof FormData` e remove o cabeçalho `'Content-Type': 'application/json'`, permitindo o envio automático do boundary multipart.
    - Método `api.delete<T>(path)` é adicionado ao objeto `api` (sem suporte ao método `put`, pois atualizações do PIT usam `patch`).
    - Respostas com status 204 (No Content) ou sem payload JSON não disparam `InvalidApiResponseError`.
  - **Teste esperado**: Teste unitário em `api.test.ts` validando chamada de `patch` com corpo serializado, chamada com `FormData` sem cabeçalho `Content-Type` fixado e chamada de `delete`.

- [x] **Task 1.3: Definir interfaces TypeScript de contratos da API em `types/api.ts` e exportar em `types/index.ts`** 🟢 [Pode andar com mock]
  - **Arquivos envolvidos**: `frontend/src/types/api.ts`, `frontend/src/types/index.ts`
  - **Critério de aceite**:
    - Tipos adicionados: `Setor`, `ListSetoresResponse`, `Indicador` (com campo `codigo: string`), `ListIndicadoresResponse`, `RegistroIndicador` (com `indicadorCodigo: string`), `ListRegistrosResponse`, `PublicReport` (com `id: string`), `ListReportsResponse`, `PitItem` (com `id: string`), `ListPitResponse`, `ListColetasResponse`.
    - Definição centralizada dos tipos `PublicReport` e `PitItem` em `types/api.ts`, junto dos auxiliares `ReportType` e `PitCategory` (hoje em `features/*/data.ts`), para que os `data.ts` passem a importá-los sem duplicação e sem que `types/` dependa de `features/`.
    - DTOs de criação e atualização definidos (`CreateRegistroRequest`, `UpdateRegistroRequest`, `CreateReportFormData`, `CreatePitItemRequest`, `UpdatePitItemRequest`).
    - Nomes e formatos alinhados às convenções (datas em ISO `string`, valores decimais em `string`).
  - **Teste esperado**: `npm run typecheck` executa sem erros de compilação de tipos.

- [x] **Task 1.4: Criar `services/fallback.ts` com `isMockMode()` e `shouldUseFallback()`** 🟢 [Pode andar com mock]
  - **Arquivos envolvidos**: `frontend/src/services/fallback.ts`, `frontend/src/services/fallback.test.ts`
  - **Critério de aceite**:
    - `isMockMode()` retorna `true` somente quando `import.meta.env.VITE_USE_MOCKS === 'true'`.
    - `shouldUseFallback()` retorna `true` quando `VITE_USE_MOCKS === 'true'` ou `import.meta.env.DEV` é verdadeiro; em build de produção sem a flag retorna `false`.
    - Funções puras, sem efeitos colaterais, fáceis de mockar com `vi.mock('../../services/fallback')` nos testes dos hooks.
  - **Teste esperado**: `fallback.test.ts` com `vi.stubEnv` cobrindo flag ligada, dev sem flag e produção sem flag.

---

### Fase 2: Camada de Serviços Tipados

- [x] **Task 2.1: Implementar serviço de indicadores e setores (`services/indicadores.ts`)** 🟡 [Depende de endpoint do backend para integração fim-a-fim]
  - **Arquivos envolvidos**: `frontend/src/services/indicadores.ts`, `frontend/src/services/indicadores.test.ts`
  - **Critério de aceite**:
    - Exporta `listarSetores()`, `listarIndicadores(setorId?)`, `listarRegistrosPublicados(filtros)` e `listarDestaquesHome()`.
    - Usa o cliente `api.get` com tratamento de parâmetros de busca via query string.
  - **Teste esperado**: Teste unitário com `vi.mock('./api')` verificando query strings geradas e respostas tipadas.

- [x] **Task 2.2: Implementar serviço de registros de indicadores (`services/registros.ts`)** 🟡 [Depende de endpoint do backend para integração fim-a-fim]
  - **Arquivos envolvidos**: `frontend/src/services/registros.ts`, `frontend/src/services/registros.test.ts`
  - **Critério de aceite**:
    - Exporta `listarRegistrosAdmin(filtros)`, `criarRegistroIndicador(dados)`, `atualizarRegistroIndicador(id, dados)` e `alterarPublicacaoRegistro(id, publicado)`.
    - A publicação e a despublicação são feitas chamando `PATCH /admin/registros-indicadores/:id` com `{ "publicado": boolean }`.
    - Não inclui função de exclusão de registros (`DELETE`), preservando o histórico de dados entre gestões da prefeitura.
  - **Teste esperado**: Teste unitário cobrindo envio de payload JSON em `criarRegistroIndicador`, `atualizarRegistroIndicador` e `alterarPublicacaoRegistro` via `api.patch`.

- [x] **Task 2.3: Implementar serviço de relatórios públicos e upload administrativo (`services/relatorios.ts`)** 🟡 [Depende de endpoint do backend para integração fim-a-fim]
  - **Arquivos envolvidos**: `frontend/src/services/relatorios.ts`, `frontend/src/services/relatorios.test.ts`
  - **Critério de aceite**:
    - Exporta `listarRelatorios(tipo?)` chamando `GET /relatorios`.
    - Exporta `uploadRelatorio(formData)` chamando `POST /admin/relatorios` com envio de arquivo PDF via multipart.
    - Exporta `excluirRelatorio(id)` chamando `DELETE /admin/relatorios/:id`.
  - **Teste esperado**: Teste unitário validando chamada de listagem, exclusão e envio de `FormData` para upload.

- [x] **Task 2.4: Implementar serviço de Inventário Turístico PIT (`services/pit.ts`)** 🟡 [Depende de endpoint do backend para integração fim-a-fim]
  - **Arquivos envolvidos**: `frontend/src/services/pit.ts`, `frontend/src/services/pit.test.ts`
  - **Critério de aceite**:
    - Exporta `listarItensPit(categoria?)` chamando `GET /pit`.
    - Exporta `criarItemPit(dados)` chamando `POST /admin/pit`, `atualizarItemPit(id, dados)` chamando `PATCH /admin/pit/:id` e `excluirItemPit(id)` chamando `DELETE /admin/pit/:id`.
  - **Teste esperado**: Teste unitário validando filtro por categoria via query string e operações de mutação (`post`, `patch`, `delete`).

- [ ] **Task 2.5: Atualizar serviço de coletas autônomas e adicionar operações de admin (`services/coleta.ts`)** 🟡 [Depende de endpoint do backend para integração fim-a-fim]
  - **Arquivos envolvidos**: `frontend/src/services/coleta.ts`, `frontend/src/services/coleta.test.ts`
  - **Critério de aceite**:
    - Atualiza `enviarColeta(dados)` exclusivamente para a rota oficial `POST /coletas` (sem prefixo `/api` e sem fallback).
    - Adiciona `listarColetasAdmin(status?)`, `aprovarColeta(id)` e `rejeitarColeta(id, motivo?)` chamando as rotas `/admin/coletas`.
  - **Teste esperado**: Testes unitários atualizados cobrindo envio público para `/coletas` e aprovação/rejeição com `vi.mock('./api')`.

---

### Fase 3: Adaptador, Hooks com Suporte a Fallback e Atualização dos Componentes

- [ ] **Task 3.1: Implementar adaptador de registros de indicadores (`features/indicators/adapter.ts`)** 🟢 [Pode andar com mock]
  - **Arquivos envolvidos**: `frontend/src/features/indicators/adapter.ts`, `frontend/src/features/indicators/adapter.test.ts`
  - **Critério de aceite**:
    - Criação de função pura que converte a lista de `registros` da API (`RegistroIndicador[]`) em `IndicatorRecord[]`.
    - Agrupamento dos registros por período e setor utilizando `setorNome` (mantendo o filtro de setor da interface por nome).
    - Mapeamento dos códigos de indicadores (`visitantes` -> `visitors`, `pernoites` -> `secondaryMetrics.overnightStays`, `taxa_ocupacao` -> `secondaryMetrics.occupancyRate`, `estada_media` -> `secondaryMetrics.averageStay`).
    - Agregações e derivações continuam no cliente em `features/indicators/logic.ts`.
  - **Teste esperado**: Teste unitário em `adapter.test.ts` validando o agrupamento correto por período/setor e o preenchimento dos campos principais e secundários.

- [ ] **Task 3.2: Atualizar hook `useIndicators` com suporte a API, adaptador e fallback via `isMockMode()` e `shouldUseFallback()`** 🟢 [Pode andar com mock]
  - **Dependência**: Task 1.4 e Task 3.1
  - **Arquivos envolvidos**: `frontend/src/features/indicators/useIndicators.ts`, `frontend/src/features/indicators/useIndicators.test.ts`
  - **Critério de aceite**:
    - A decisão vem de `services/fallback.ts` (Task 1.4): `isMockMode()` e `shouldUseFallback()`.
    - Se `isMockMode()`, devolve imediatamente os dados de `INDICATOR_DATA` com `status: 'ready'`, sem chamar a API.
    - Caso contrário, consome `listarRegistrosPublicados()` e processa os dados com `adaptIndicatorRecords(registros)`.
    - Em caso de falha da API (404, 500, NetworkError):
      - Se `shouldUseFallback()` for verdadeira (desenvolvimento): aplica fallback transparente para `INDICATOR_DATA` com `status: 'ready'` e aviso no console.
      - Se `shouldUseFallback()` for falsa (produção sem a flag): devolve `status: 'error'`, sem usar dados fixos, permitindo que a tela apresente o estado de erro existente.
  - **Teste esperado**: Testes em `useIndicators.test.ts` cobrindo 4 cenários: (1) sucesso da API com conversão pelo adaptador, (2) flag de mock ativa, (3) erro da API em desenvolvimento (fallback com ready), (4) erro da API em produção (status error).

- [ ] **Task 3.3: Criar hook `useReports` com fallback controlado, atualizar `data.ts`, `ReportsSection.tsx` e testes existentes** 🟢 [Pode andar com mock]
  - **Arquivos envolvidos**: `frontend/src/services/relatorios.ts`, `frontend/src/services/relatorios.test.ts`, `frontend/src/features/reports/data.ts`, `frontend/src/features/reports/useReports.ts`, `frontend/src/features/reports/useReports.test.ts`, `frontend/src/features/reports/ReportsSection.tsx`, `frontend/src/features/reports/ReportsSection.test.tsx`
  - **Critério de aceite**:
    - `features/reports/data.ts` importa o tipo `PublicReport` de `types/` (com `id: string`) e atualiza a constante `PUBLIC_REPORTS` com IDs string.
    - `useReports` gerencia estados `loading`, `error` e `reports` (lista de `PublicReport`), utilizando `isMockMode()` e `shouldUseFallback()`.
    - Com `isMockMode()`, devolve `PUBLIC_REPORTS` sem chamar a API; com `shouldUseFallback()` verdadeira, falhas da API aplicam fallback para `PUBLIC_REPORTS`; em produção, devolvem `error`.
    - `arquivoUrl` relativo (ex.: `/relatorios/:id/download`) é resolvido contra `VITE_API_URL` por um helper em `services/relatorios.ts`, para o botão de download apontar para a API; URLs absolutas e `null` mantêm o comportamento atual (botão desabilitado quando `null`).
    - `ReportsSection.tsx` consome `useReports` e trata os estados de carregamento, lista vazia, erro e pronto.
    - `ReportsSection.test.tsx` é atualizado para cobrir IDs string e comportamento assíncrono.
  - **Teste esperado**: Testes unitários do hook `useReports.test.ts` cobrindo os 4 cenários (sucesso, mock, erro em dev, erro em produção) e testes de renderização de `ReportsSection.test.tsx`.

- [ ] **Task 3.4: Criar hook `usePit` com fallback controlado, atualizar `data.ts`, `PitPage.tsx` e testes existentes** 🟢 [Pode andar com mock]
  - **Arquivos envolvidos**: `frontend/src/features/pit/data.ts`, `frontend/src/features/pit/usePit.ts`, `frontend/src/features/pit/usePit.test.ts`, `frontend/src/features/pit/PitPage.tsx`, `frontend/src/features/pit/PitPage.test.tsx`
  - **Critério de aceite**:
    - `features/pit/data.ts` importa o tipo `PitItem` de `types/` (com `id: string`) e atualiza a constante `PIT_ITEMS` com IDs string.
    - `usePit` gerencia filtro ativo de categoria, busca e fallback controlado via `isMockMode()` e `shouldUseFallback()`.
    - Com `isMockMode()`, devolve `PIT_ITEMS` sem chamar a API; com `shouldUseFallback()` verdadeira, falhas da API aplicam fallback para `PIT_ITEMS`; em produção, devolvem `error`.
    - `PitPage.tsx` consome `usePit` e aceita prop `items` com `id: string`, tratando estados de carregamento, vazio, erro e pronto.
    - `PitPage.test.tsx` é atualizado para refletir IDs string e carregamento assíncrono.
  - **Teste esperado**: Testes unitários do hook `usePit.test.ts` cobrindo os 4 cenários (sucesso, mock, erro em dev, erro em produção) e testes de renderização de `PitPage.test.tsx`.

- [ ] **Task 3.5: Criar hook `useHighlightMetrics` com fallback controlado e integrar em `HeroSection.tsx`** 🟢 [Pode andar com mock]
  - **Arquivos envolvidos**: `frontend/src/features/home/useHighlightMetrics.ts`, `frontend/src/features/home/useHighlightMetrics.test.ts`, `frontend/src/features/home/HeroSection.tsx`
  - **Critério de aceite**:
    - Hook busca destaques da API (`listarDestaquesHome()`) com fallback controlado via `isMockMode()` e `shouldUseFallback()`.
    - Com `isMockMode()`, usa `HIGHLIGHT_METRICS` sem chamar a API; com `shouldUseFallback()` verdadeira, usa `HIGHLIGHT_METRICS` em caso de falha; em produção, devolve erro sem dados fixos.
    - `HeroSection.tsx` renderiza as métricas dinamicamente.
  - **Teste esperado**: Testes unitários do hook cobrindo os 4 cenários (sucesso, mock, erro em dev, erro em produção).

---

### Fase 4: Autorização do Painel Administrativo (`ADMIN` vs `SUPER_ADMIN`)

- [ ] **Task 4.1: Ajustar regras de acesso no `App.tsx`, `useAdminSession.ts` e criar placeholder de ADMIN** 🟢 [Pode andar com mock]
  - **Arquivos envolvidos**: `frontend/src/App.tsx`, `frontend/src/App.test.tsx`, `frontend/src/hooks/useAdminSession.ts`, `frontend/src/features/admin/AdminPlaceholderPage.tsx`, `frontend/src/features/admin/AdminPlaceholderPage.test.tsx`, `frontend/src/features/admin/AdminPage.tsx`
  - **Critério de aceite**:
    - Criar componente `AdminPlaceholderPage.tsx` contendo título "Painel administrativo", botão de sair e, somente para usuário `SUPER_ADMIN`, link de navegação para `/admin/solicitacoes`.
    - Em `App.tsx`, configurar sub-rotas:
      - Rota `/admin` com `allowedRoles={['ADMIN', 'SUPER_ADMIN']}` renderiza `AdminPlaceholderPage`.
      - Sub-rota `/admin/solicitacoes` com `allowedRoles={['SUPER_ADMIN']}` renderiza a `AdminPage` atual.
    - `AdminPage` não faz verificação de papel interna, garantindo que um `ADMIN` nunca dispara `GET /admin/solicitacoes` (evitando erro 403 desnecessário).
    - `ProtectedRoute.tsx` já suporta `allowedRoles` e permanece inalterado.
    - O hook `useAdminSession` marca `status: 'authenticated'` tanto para `ADMIN` quanto para `SUPER_ADMIN`.
  - **Teste esperado**: Testes em `AdminPlaceholderPage.test.tsx` e `App.test.tsx` validando que: (1) `ADMIN` acessa `/admin` e vê o placeholder sem link para solicitações; (2) `ADMIN` é redirecionado ao tentar acessar `/admin/solicitacoes`; (3) `SUPER_ADMIN` acessa ambas as rotas e vê o link; (4) usuário anônimo é redirecionado para `/login`.

---

### Fase 5: Verificação de Qualidade e Integração

- [ ] **Task 5.1: Executar bateria completa de verificação de qualidade no frontend** 🟢 [Pode andar com mock]
  - **Arquivos envolvidos**: Todo o diretório `frontend/`
  - **Critério de aceite**:
    - Execução com sucesso de: `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm test` e `npm run build`.
    - Zero erros e zero advertências de lint ou tipos.
  - **Teste esperado**: Todos os comandos do pipeline frontend finalizam com código de saída 0.
