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
    |-- services/     comunicação com a API
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
