# Frontend ObservaSRS

Aplicação web do ObservaSRS, construída com React, TypeScript, Vite e Tailwind CSS e mantida
separadamente da API e da persistência localizadas em `backend/`.

## Preparação

```powershell
npm ci
```

## Comandos

```powershell
npm run dev          # inicia o servidor de desenvolvimento em http://localhost:5173
npm run build        # gera a aplicação em dist/
npm run preview      # serve o build gerado
npm run typecheck    # verifica os tipos TypeScript
npm run lint         # verifica a qualidade do código
npm run format:check # verifica a formatação
```

## Estrutura

```text
frontend/
`-- src/
    |-- components/
    |   |-- layout/   cabeçalho, rodapé e estrutura das páginas
    |   `-- ui/       componentes base (Button etc.)
    |-- features/     funcionalidades do sistema
    |-- pages/        páginas da aplicação
    |-- services/     cliente HTTP e serviços por domínio
    |-- types/        tipos compartilhados
    `-- index.css     paleta de cores e estilos globais
```

## Contratos tipados

Os componentes devem declarar interfaces próprias para suas props e evitar o uso de `any`.
Os contratos de dados da API ficam isolados em `src/types/api.ts` e são exportados por
`src/types/index.ts`. Esses tipos representam as entradas e respostas de autenticação, usuários,
solicitações de acesso, status da API e erros, seguindo os schemas e o OpenAPI do backend.

Ao criar uma chamada de API, use os tipos correspondentes para os dados enviados e recebidos.
Datas permanecem como `string`, pois são recebidas serializadas em JSON:

```ts
import type { LoginRequest, LoginResponse } from './types';

async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await fetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Falha ao realizar login.');
  }

  return response.json() as Promise<LoginResponse>;
}
```

## Responsividade

O frontend segue uma abordagem mobile-first. Em telas menores, os elementos devem começar
empilhados e ocupar o espaço disponível; a partir dos breakpoints do Tailwind, podem assumir
layouts horizontais ou tamanhos naturais. Use classes como `sm:`, `md:` e `lg:` em grids,
containers flexíveis, menus, modais e ações para adaptar a interface sem criar estilos
específicos por dispositivo.

Na tela inicial, por exemplo, os botões ocupam toda a largura no mobile (`w-full`) e retornam ao
tamanho do conteúdo a partir de `sm` (`sm:w-auto`). Para validar alterações visuais, use o modo
de dispositivo das Developer Tools do navegador e verifique especialmente larguras próximas de
celulares, tablets e desktop.

## Estados e lógica da interface

O estado deve permanecer local enquanto o comportamento pertencer a um único componente. O
`LoginForm` usa o hook `useLoginForm` para controlar valores dos campos, erros de validação,
feedback e o status assíncrono (`idle`, `loading`, `success` ou `error`). Durante o envio, os
campos e o botão são desabilitados para impedir solicitações duplicadas.

A comunicação de autenticação fica em `src/services/auth.ts` e usa os contratos de
`src/types/api.ts`. O serviço valida a resposta da API antes de disponibilizá-la ao componente e
converte erros HTTP em mensagens exibíveis. Um Context global ou `useAuth` será adicionado quando
mais de uma tela precisar compartilhar a sessão do usuário; formulários e modais isolados não
devem ser promovidos ao estado global sem essa necessidade.

## Integração com a API

As chamadas HTTP são centralizadas em `src/services/api.ts`. O cliente usa a variável
`VITE_API_URL` como URL base, envia cookies de sessão com `credentials: 'include'` e converte
falhas HTTP e de rede em erros tipados. Se a variável não for definida, o frontend usa
`http://localhost:3333` para desenvolvimento local.

Para apontar para outra API, crie um arquivo `.env.local` na pasta `frontend/`:

```env
VITE_API_URL=http://localhost:3333
```

Os serviços são separados por domínio:

- `src/services/auth.ts`: login, sessão atual e logout;
- `src/services/admin.ts`: listagem, aprovação e rejeição de solicitações;
- `src/services/status.ts`: verificação de disponibilidade da API.

Erros `401`, `403`, `404`, `409`, respostas `5xx` e falhas de rede recebem mensagens adequadas
para a interface. Os componentes devem chamar esses serviços, em vez de usar `fetch` diretamente.
