# ObservaSRS

Aplicacao web para o Observatorio do Turismo de Santa Rita do Sapucai, com indicadores,
relatorios, inventario turistico, coleta de dados e painel administrativo.

## Estrutura do repositorio

```text
ObservaSRS/
|-- back/   API e persistencia
`-- front/  Aplicacao web
```

As duas aplicacoes sao independentes. Cada pasta possui suas proprias dependencias e instrucoes,
evitando que o desenvolvimento do frontend e do backend interfiram um no outro.

## Backend

### Requisitos

- Node.js 22 ou superior
- npm 10 ou superior
- PostgreSQL local, necessario a partir da proxima etapa

### Executar a API

```powershell
cd back
npm ci
Copy-Item .env.example .env
npm run dev
```

A API ficara disponivel em `http://localhost:3333`. Para confirmar que o ambiente esta
funcionando, acesse `GET http://localhost:3333/status`.

Consulte [back/README.md](back/README.md) para ver os demais comandos.

## Frontend

A pasta `front/` esta reservada para a aplicacao web. A tecnologia e os comandos do frontend
serao documentados pelo responsavel por essa parte do projeto.
