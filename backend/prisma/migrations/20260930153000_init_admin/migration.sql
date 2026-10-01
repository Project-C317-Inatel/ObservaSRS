CREATE SCHEMA IF NOT EXISTS "public";

CREATE TYPE "PapelAdmin" AS ENUM ('ADMIN', 'EDITOR');

CREATE TABLE "user_admin" (
    "id" TEXT NOT NULL,
    "nome" VARCHAR(120) NOT NULL,
    "email" VARCHAR(160) NOT NULL,
    "senha_hash" VARCHAR(255) NOT NULL,
    "papel" "PapelAdmin" NOT NULL DEFAULT 'ADMIN',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_admin_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_admin_email_key" ON "user_admin"("email");
