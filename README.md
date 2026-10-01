# ObservaSRS

Plataforma web desenvolvida para o Observatório do Turismo de Santa Rita do Sapucaí (OT-SRS), em parceria com a Secretaria Municipal de Cultura, Esporte, Lazer e Turismo (SMCELT). O sistema disponibiliza indicadores turísticos, relatórios e visualizações de dados, além de funcionalidades administrativas para gerenciamento das informações utilizadas pelo observatório.

## Equipe

Breno Carvalho · Lilyan Oliveira · Lucas David · Rodrigo Armengol

INATEL | C317 | 2026.2

## Funcionalidades

**Escopo essencial**

- Indicadores turísticos (hospedagem, leitos, empresas e empregos)
- Relatórios públicos em PDF
- Dashboard visual com gráficos e cards
- Filtros por período e setor
- Painel administrativo

**(desejável)**

- Coleta autônoma de dados por estabelecimentos, com validação da SMCELT
- Painel informativo Cadastur e FNRH Digital
- Módulo de Inventário Turístico (PIT)

## Tecnologias

| Camada        | Tecnologias                          |
| ------------- | ------------------------------------ |
| Frontend      | React, TypeScript, Tailwind CSS      |
| Backend       | Node.js, Express, TypeScript, Zod    |
| Persistência  | PostgreSQL, Prisma                   |
| Automação     | GitHub Actions                       |

## Estrutura do repositório

```text
ObservaSRS/
|-- backend/   API e persistência
`-- frontend/  Aplicação web
```

As duas aplicações são independentes. Cada pasta possui suas próprias dependências e instruções,
evitando que o desenvolvimento do frontend e do backend interfiram um no outro.

## Backend

### Requisitos

- Node.js 22 ou superior
- npm 10 ou superior
- PostgreSQL local

### Executar a API

```powershell
cd backend
npm ci
Copy-Item .env.example .env
npm run dev
```

A API ficará disponível em `http://localhost:3333`. Para confirmar que o ambiente está
funcionando, acesse `GET http://localhost:3333/status`.

Consulte [backend/README.md](backend/README.md) para ver os demais comandos.

## Frontend

O frontend está localizado na pasta frontend/ e utiliza React, TypeScript e Tailwind CSS.
A aplicação web ainda está em configuração. As instruções de execução ficarão em
[frontend/README.md](frontend/README.md).

## Links

- Protótipo no Figma: <https://poodle-zero-14367780.figma.site/>
- Quadro no Trello: (adicionar link)
