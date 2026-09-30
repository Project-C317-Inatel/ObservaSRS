# Backend ObservaSRS

API HTTP do ObservaSRS, construida com Node.js, Express e TypeScript.

## Preparacao

```powershell
npm ci
Copy-Item .env.example .env
```

## Comandos

```powershell
npm run dev          # inicia a API com recarga automatica
npm run build        # gera a aplicacao em dist/
npm start            # executa o build gerado
npm run typecheck    # verifica os tipos TypeScript
npm run lint         # verifica a qualidade do codigo
npm run format:check # verifica a formatacao
```

## Endpoint inicial

```http
GET /status
```

Resposta esperada:

```json
{
  "status": "positivo",
  "servico": "observasrs-api"
}
```

## Proximas etapas

1. Configurar a conexao local com PostgreSQL.
2. Adicionar Prisma e criar a primeira migration.
3. Criar o usuario administrativo inicial.
4. Implementar login e protecao das rotas administrativas.
