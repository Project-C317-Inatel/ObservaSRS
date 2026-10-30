# Plano de Implementação: Integração Frontend-Backend, Camada de Serviços e Mocks (Semana 30/10)

## 1. Abordagem Técnica e Arquitetura

O objetivo é transformar a camada de dados do frontend do ObservaSRS em uma estrutura desacoplada, resiliente e pronta para produção, conectando as telas existentes à API REST e garantindo que o desenvolvimento visual não seja bloqueado pelas rotas ainda em construção no backend.

```text
┌───────────────────────────────────────────────────────────────────────────┐
│                           Interface / Componentes                         │
│   (HomePage, HeroSection, IndicatorsPage, ReportsSection, PitPage, etc.)  │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │
                                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                              Camada de Hooks                              │
│         (useIndicators, useReports, usePit, useHighlightMetrics)          │
│   - Avalia isMockMode() e shouldUseFallback() (services/fallback.ts)      │
│   - Tenta consumir serviço da API                                         │
│   - Em dev/mock: falha aplica Fallback transparente (data.ts) com ready   │
│   - Em produção: falha da API devolve status error (sem mascarar falhas)  │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │
                                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                        Camada de Serviços Tipados                         │
│  (services/indicadores, relatorios, pit, registros, coleta, auth, admin)  │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │
                                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                           Cliente HTTP Base (api.ts)                      │
│   - get, post, patch (com body), delete                                   │
│   - Flexibilidade para multipart/form-data (Upload de PDF)                │
│   - Tratamento padronizado de ApiRequestError e NetworkError              │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Decisões Técnicas e Alternativas Descartadas

### 2.1. Flexibilização de `services/api.ts` para Multipart e Métodos HTTP

- **Decisão**:
  1. No método interno `request`, verificar se `options.body instanceof FormData`. Se for `FormData`, não definir o cabeçalho `Content-Type: application/json`, permitindo que a API `fetch` nativa atribua automaticamente `multipart/form-data; boundary=...`.
  2. Ajustar `patch<T>(path: string, body?: unknown)` para aceitar corpo e serializá-lo em JSON quando fornecido, mantendo simetria com `post`.
  3. Adicionar `delete<T>(path: string)` para possibilitar exclusões administrativas (relatórios e PIT). Não há método `put` (atualizações do PIT usam `patch`).
  4. Manter o parser de resposta seguro: caso o status HTTP seja 204 (No Content) ou o cabeçalho não seja JSON, retornar `undefined as T` sem lançar erro de parse inválido.
- **Alternativa descartada**: Criar uma segunda instância ou cliente `uploadApi.ts` isolado. Descartada para evitar duplicidade de código de tratamento de erros, credentials e baseURL.

### 2.2. Estratégia de Fallback e `VITE_USE_MOCKS`

- **Decisão**:
  - A decisão é isolada em `frontend/src/services/fallback.ts`, com duas funções puras e mockáveis nos testes:
    - `isMockMode()`: verdadeira quando `VITE_USE_MOCKS === 'true'`. O hook devolve imediatamente os dados fixos de `data.ts` com `status: 'ready'`, sem chamar a API.
    - `shouldUseFallback()`: verdadeira quando `VITE_USE_MOCKS === 'true'` ou `import.meta.env.DEV`. Define se uma falha da API cai nos dados fixos.
  - Com a flag inativa, o hook chama a API; se responder 200, os dados reais prevalecem.
  - Se a API falhar (HTTP 404, 500 ou `NetworkError`):
    - `shouldUseFallback()` verdadeira (desenvolvimento): o hook emite `console.warn` e carrega os dados fixos com `status: 'ready'`.
    - `shouldUseFallback()` falsa (build de produção sem a flag): **não** usa dados fixos; devolve `status: 'error'` e a interface apresenta o estado de erro existente.
- **Alternativa descartada (MSW - Mock Service Worker)**: Descartada pois adiciona dependência nova sem necessidade, pois a camada de fallback já cobre o caso.

### 2.3. Desacoplamento de Acesso `ADMIN` vs `SUPER_ADMIN`

- **Decisão**:
  - Em `frontend/src/App.tsx`, adotar sub-rotas para separar a visão administrativa geral da aprovação de solicitações:
    - `/admin` com `allowedRoles={['ADMIN', 'SUPER_ADMIN']}` renderiza um componente placeholder mínimo (`AdminPlaceholderPage.tsx` com título "Painel administrativo", botão de sair e, somente para `SUPER_ADMIN`, link para `/admin/solicitacoes`; sem novas telas de dados).
    - `/admin/solicitacoes` com `allowedRoles={['SUPER_ADMIN']}` renderiza a `AdminPage` atual.
  - A `AdminPage` não faz verificação de papel interna, garantindo que um usuário com papel `ADMIN` nunca dispara `GET /admin/solicitacoes` (evitando erro 403 desnecessário).
  - O hook `useAdminSession` passa a tratar usuários com papéis `ADMIN` e `SUPER_ADMIN` como `authenticated`.
  - `ProtectedRoute.tsx` já suporta o array `allowedRoles` e não requer alteração de código.
- **Alternativa descartada**: Manter `/admin` bloqueado para `SUPER_ADMIN` até que todas as telas de dados estejam prontas. Descartada pois impediria que os membros com papel `ADMIN` logassem e testassem suas permissões no frontend.

---

## 3. Arquivos Afetados no Repositório

| Arquivo                                                     | Ação      | Responsabilidade                                                                                                                                                                                                         |
| ----------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `frontend/.env.example`                                     | Criar     | Configuração padrão de variáveis de ambiente com `VITE_API_URL` e `VITE_USE_MOCKS`.                                                                                                                                      |
| `frontend/src/services/api.ts`                              | Modificar | Suporte a `FormData` no `request`, parâmetro `body` em `patch`, inclusão de `delete` (sem `put`).                                                                                                                        |
| `frontend/src/services/api.test.ts`                         | Criar     | Testes unitários do cliente HTTP (`patch` com corpo, `FormData` multipart, `delete`).                                                                                                                                    |
| `frontend/src/services/fallback.ts`                         | Criar     | Funções `isMockMode()` e `shouldUseFallback()` que centralizam a decisão de mock e fallback.                                                                                                                             |
| `frontend/src/services/fallback.test.ts`                    | Criar     | Testes das duas funções usando `vi.stubEnv` (flag ligada, dev, produção).                                                                                                                                                |
| `frontend/src/types/api.ts`                                 | Modificar | Declaração de interfaces (Setores, Indicadores com `codigo`, Registros, Relatórios com `id: string`, PIT com `id: string`, Coletas) e dos tipos auxiliares `ReportType` e `PitCategory` movidos de `features/*/data.ts`. |
| `frontend/src/types/index.ts`                               | Modificar | Reexportação pública de todos os novos tipos de contrato.                                                                                                                                                                |
| `frontend/src/services/indicadores.ts`                      | Criar     | Funções de listagem pública e administrativa de indicadores, setores e séries de registros.                                                                                                                              |
| `frontend/src/services/indicadores.test.ts`                 | Criar     | Testes unitários do serviço de indicadores com `vi.mock('./api')`.                                                                                                                                                       |
| `frontend/src/services/relatorios.ts`                       | Criar     | Listagem pública de relatórios, upload e exclusão administrativos e helper que resolve `arquivoUrl` relativo contra `VITE_API_URL`.                                                                                      |
| `frontend/src/services/relatorios.test.ts`                  | Criar     | Testes unitários do serviço de relatórios.                                                                                                                                                                               |
| `frontend/src/services/pit.ts`                              | Criar     | Listagem pública filtrada e mutações administrativas do PIT via `PATCH` e `DELETE`.                                                                                                                                      |
| `frontend/src/services/pit.test.ts`                         | Criar     | Testes unitários do serviço de PIT.                                                                                                                                                                                      |
| `frontend/src/services/registros.ts`                        | Criar     | Listagem com filtros, cadastro e edição/publicação de registros via `PATCH` (sem rota de exclusão).                                                                                                                      |
| `frontend/src/services/registros.test.ts`                   | Criar     | Testes unitários do serviço de registros de indicadores.                                                                                                                                                                 |
| `frontend/src/services/coleta.ts`                           | Modificar | Alinhamento do endpoint `POST /coletas` e adição de listagem, aprovação e rejeição de coletas.                                                                                                                           |
| `frontend/src/services/coleta.test.ts`                      | Modificar | Atualização dos testes cobrindo envio e operações administrativas.                                                                                                                                                       |
| `frontend/src/features/indicators/adapter.ts`               | Criar     | Adaptador puro que converte `registros` da API em `IndicatorRecord[]` agrupados por período e setor.                                                                                                                     |
| `frontend/src/features/indicators/adapter.test.ts`          | Criar     | Testes unitários do adaptador de registros para o modelo visual da tela.                                                                                                                                                 |
| `frontend/src/features/indicators/useIndicators.ts`         | Modificar | Integração com a API via adaptador com fallback em dev/mock via `shouldUseFallback`.                                                                                                                                     |
| `frontend/src/features/indicators/useIndicators.test.ts`    | Modificar | Testes cobrindo 4 cenários (sucesso, mock, erro em dev, erro em produção).                                                                                                                                               |
| `frontend/src/features/reports/data.ts`                     | Modificar | Importar `PublicReport` de `types/` com `id: string` nos dados fixos.                                                                                                                                                    |
| `frontend/src/features/reports/useReports.ts`               | Criar     | Hook para gerenciar estado assíncrono dos relatórios públicos com `shouldUseFallback`.                                                                                                                                   |
| `frontend/src/features/reports/useReports.test.ts`          | Criar     | Testes unitários do hook `useReports` nos 4 cenários.                                                                                                                                                                    |
| `frontend/src/features/reports/ReportsSection.tsx`          | Modificar | Consumir `useReports` com estados de loading, vazio, erro e pronto e usar o link de download resolvido contra `VITE_API_URL`.                                                                                            |
| `frontend/src/features/reports/ReportsSection.test.tsx`     | Modificar | Atualização dos testes existentes para refletir `id: string` e hook assíncrono.                                                                                                                                          |
| `frontend/src/features/pit/data.ts`                         | Modificar | Importar `PitItem` de `types/` com `id: string` nos dados fixos.                                                                                                                                                         |
| `frontend/src/features/pit/usePit.ts`                       | Criar     | Hook para gerenciar estado assíncrono e filtro por categoria do PIT com `shouldUseFallback`.                                                                                                                             |
| `frontend/src/features/pit/usePit.test.ts`                  | Criar     | Testes unitários do hook `usePit` nos 4 cenários.                                                                                                                                                                        |
| `frontend/src/features/pit/PitPage.tsx`                     | Modificar | Consumir `usePit` e aceitar prop `items` com `id: string`.                                                                                                                                                               |
| `frontend/src/features/pit/PitPage.test.tsx`                | Modificar | Atualização dos testes existentes para refletir `id: string` e hook assíncrono.                                                                                                                                          |
| `frontend/src/features/home/useHighlightMetrics.ts`         | Criar     | Hook para métricas da Hero com fallback controlado via `shouldUseFallback`.                                                                                                                                              |
| `frontend/src/features/home/useHighlightMetrics.test.ts`    | Criar     | Testes unitários do hook de métricas da Home nos 4 cenários.                                                                                                                                                             |
| `frontend/src/features/home/HeroSection.tsx`                | Modificar | Consumir `useHighlightMetrics`.                                                                                                                                                                                          |
| `frontend/src/features/admin/AdminPlaceholderPage.tsx`      | Criar     | Componente placeholder mínimo de `/admin` (título, botão sair, link para solicitações se SUPER_ADMIN).                                                                                                                   |
| `frontend/src/features/admin/AdminPlaceholderPage.test.tsx` | Criar     | Testes unitários do placeholder administrativo (visibilidade do link SUPER_ADMIN vs ADMIN).                                                                                                                              |
| `frontend/src/features/admin/AdminPage.tsx`                 | Modificar | Manter tela de solicitações sem verificação de papel interna, servida em `/admin/solicitacoes`.                                                                                                                          |
| `frontend/src/hooks/useAdminSession.ts`                     | Modificar | Adequação para reconhecer `ADMIN` e `SUPER_ADMIN` como `authenticated`.                                                                                                                                                  |
| `frontend/src/App.tsx`                                      | Modificar | Configuração das sub-rotas `/admin` (`ADMIN` e `SUPER_ADMIN`) e `/admin/solicitacoes` (`SUPER_ADMIN`).                                                                                                                   |
| `frontend/src/App.test.tsx`                                 | Modificar | Testes de acesso de `ADMIN` e `SUPER_ADMIN` às sub-rotas e redirecionamento anônimo.                                                                                                                                     |

---

## 4. Estratégia de Testes

Seguindo o padrão arquitetural do projeto e as convenções do `AGENTS.md`:

1. **Testes de Serviços (`services/*.test.ts`)**:
   - Usar `vi.mock('./api')` simulando os métodos do objeto `api` (`get`, `post`, `patch`, `delete`).
   - Validar que cada função chama a URL exata, envia parâmetros de query formatados corretamente e propaga os dados retornados.
   - Testar o comportamento de propagação de erro quando o cliente `api` rejeita com `ApiRequestError` ou `NetworkError`.
2. **Testes de Adaptador (`features/indicators/adapter.test.ts`)**:
   - Validar agrupamento de registros por período e `setorNome`.
   - Validar mapeamento dos códigos de indicadores (`visitantes`, `pernoites`, `taxa_ocupacao`, `estada_media`) para suas respectivas propriedades em `IndicatorRecord`.
3. **Testes de Hooks (`features/*/use*.test.ts`)**:
   - Usar `renderHook`, `act` e `waitFor` da `@testing-library/react`.
   - Mockar os módulos de serviço (`vi.mock('../../services/...')`) e o módulo `services/fallback` (`isMockMode`, `shouldUseFallback`).
   - Cobrir obrigatoriamente os quatro cenários:
     - **Cenário 1 (Sucesso na API)**: A API responde com dados válidos; o hook reflete os dados recebidos com `status: 'ready'`.
     - **Cenário 2 (Flag de Mock Ativa)**: `isMockMode()` retorna true; o hook, sem chamar a API, devolve imediatamente os dados fixos de `data.ts` com `status: 'ready'`.
     - **Cenário 3 (Erro da API em Desenvolvimento)**: API rejeita com erro (404/500/NetworkError) em ambiente de dev (`isMockMode` falsa e `shouldUseFallback` verdadeira); o hook aplica fallback para `data.ts` com `status: 'ready'`.
     - **Cenário 4 (Erro da API em Produção)**: API rejeita com erro em produção (`isMockMode` e `shouldUseFallback` falsas); o hook devolve `status: 'error'` sem usar fallback.
4. **Testes de Roteamento e Permissão (`App.test.tsx`)**:
   - Testar que usuário com papel `ADMIN` consegue carregar a área `/admin` (placeholder) e é redirecionado ao tentar acessar `/admin/solicitacoes`.
   - Testar que usuário com papel `SUPER_ADMIN` acessa tanto `/admin` quanto `/admin/solicitacoes`.
   - Testar que usuário anônimo é redirecionado para `/login`.

---

## 5. Riscos Identificados e Planos de Mitigação

| Risco                                                                             | Impacto | Mitigação                                                                                                                                                                                                                                                                                                                   |
| --------------------------------------------------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Risco 1: Backend demorar a entregar as novas rotas públicas e administrativas** | Alto    | Implementação da estratégia de fallback automático em desenvolvimento e modo mock via `shouldUseFallback()`/`isMockMode()` e flag `VITE_USE_MOCKS`. Em build de produção, falhas reais não são mascaradas e resultam em `status: 'error'`, garantindo fidelidade de integração sem bloquear o desenvolvimento da interface. |
| **Risco 2: Divergência de formato de dados em valores monetários/decimais**       | Médio   | Centralização dos tipos em `types/api.ts` com documentação explícita de que valores decimais trafegam como string (`"1240.50"`), padronizados com o schema do Prisma e controllers existentes.                                                                                                                              |
| **Risco 3: Upload de PDF quebrar por formatação incorreta de cabeçalho HTTP**     | Médio   | Ajuste preventivo em `services/api.ts` para excluir manualmente `'Content-Type'` quando o corpo for `FormData`, permitindo que o navegador adicione o `boundary` correspondente.                                                                                                                                            |
| **Risco 4: Regressão nos testes unitários existentes do frontend**                | Baixo   | Execução contínua da suíte (`npm run typecheck`, `npm run lint`, `npm test`, `npm run build`) a cada etapa de conclusão das tarefas, atualizando testes de componentes afetados por `id: string`.                                                                                                                           |

---

## 6. Ordem de Execução das Entregas

1. **Fase 1 — Cliente Base e Contratos Tipados**:
   - Criação do arquivo `frontend/.env.example`.
   - Criação de `services/fallback.ts` (`isMockMode()` e `shouldUseFallback()`) e seus testes.
   - Flexibilização do cliente `services/api.ts` e criação de `services/api.test.ts`.
   - Criação dos novos tipos em `types/api.ts` (com `codigo` em indicadores e `id: string` em PIT/relatórios) e reexportação em `types/index.ts`.
2. **Fase 2 — Implementação da Camada de Serviços**:
   - Implementação e testes unitários de `services/indicadores.ts`, `services/relatorios.ts`, `services/pit.ts` (com `PATCH`), `services/registros.ts` (com `PATCH` para publicação, sem exclusão) e atualização de `services/coleta.ts` (`POST /coletas`).
3. **Fase 3 — Adaptador, Hooks com Fallback e Atualização dos Componentes**:
   - Criação do adaptador puro `features/indicators/adapter.ts` e testes.
   - Criação/adaptação dos hooks `useIndicators`, `useReports`, `usePit`, `useHighlightMetrics` com suporte aos quatro cenários via `shouldUseFallback()`.
   - Atualização de `features/reports/data.ts` e `features/pit/data.ts` para `id: string`.
   - Integração nos componentes `ReportsSection.tsx`, `PitPage.tsx`, `HeroSection.tsx` e atualização de `ReportsSection.test.tsx` e `PitPage.test.tsx`.
4. **Fase 4 — Liberação do Papel ADMIN e Sub-rotas do Painel**:
   - Criação do componente `AdminPlaceholderPage.tsx` e testes unitários.
   - Atualização de `App.tsx` (sub-rotas `/admin` e `/admin/solicitacoes`) e `useAdminSession.ts`.
   - Testes de autorização e proteção de rota em `App.test.tsx`.
5. **Fase 5 — Verificação de Qualidade e Integração**:
   - Validação completa dos comandos `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm test` e `npm run build`.
