FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ENV DATABASE_URL="postgresql://build:build@localhost:5432/build?schema=public"

RUN npm run build

FROM build AS migrate

CMD ["npm", "run", "db:deploy"]

FROM build AS production-deps

RUN npm prune --omit=dev

FROM node:22-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production

COPY --from=production-deps /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/dist ./dist

EXPOSE 3333

CMD ["node", "dist/server.js"]
