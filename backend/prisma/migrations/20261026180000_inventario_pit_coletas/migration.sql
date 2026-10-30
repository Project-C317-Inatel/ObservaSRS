BEGIN;

CREATE TYPE "StatusColeta" AS ENUM ('PENDENTE', 'APROVADO', 'REJEITADO');

CREATE TABLE "item_pit" (
    "id" TEXT NOT NULL,
    "nome" VARCHAR(150) NOT NULL,
    "categoria" VARCHAR(80) NOT NULL,
    "descricao" TEXT,
    "imagem_url" TEXT,
    "localizacao" VARCHAR(150) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,
    "revisado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revisao_prevista_em" DATE NOT NULL,
    CONSTRAINT "item_pit_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "estabelecimento" (
    "id" TEXT NOT NULL,
    "nome" VARCHAR(150) NOT NULL,
    "cnpj_cadastur" VARCHAR(30) NOT NULL,
    "tipo" VARCHAR(80) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "estabelecimento_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "submissao_coleta" (
    "id" TEXT NOT NULL,
    "estabelecimento_id" TEXT NOT NULL,
    "nome_estabelecimento" VARCHAR(150) NOT NULL,
    "cnpj_cadastur" VARCHAR(30) NOT NULL,
    "periodo" DATE NOT NULL,
    "leitos_ocupados" INTEGER NOT NULL,
    "origem_visitantes" VARCHAR(120) NOT NULL,
    "status" "StatusColeta" NOT NULL DEFAULT 'PENDENTE',
    "publicado" BOOLEAN NOT NULL DEFAULT false,
    "enviado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,
    "validado_em" TIMESTAMP(3),
    "validado_por" TEXT,
    "publicado_em" TIMESTAMP(3),
    CONSTRAINT "submissao_coleta_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "submissao_coleta_leitos_nao_negativos" CHECK ("leitos_ocupados" >= 0),
    CONSTRAINT "submissao_coleta_periodo_mensal" CHECK (EXTRACT(DAY FROM "periodo") = 1),
    CONSTRAINT "submissao_coleta_publicacao_valida" CHECK (
      (NOT "publicado" AND "publicado_em" IS NULL) OR
      ("publicado" AND "status" = 'APROVADO' AND "publicado_em" IS NOT NULL)
    )
);

CREATE INDEX "item_pit_ativo_categoria_idx" ON "item_pit"("ativo", "categoria");
CREATE INDEX "item_pit_revisao_prevista_em_idx" ON "item_pit"("revisao_prevista_em");
CREATE UNIQUE INDEX "estabelecimento_cnpj_cadastur_key" ON "estabelecimento"("cnpj_cadastur");
CREATE INDEX "estabelecimento_ativo_idx" ON "estabelecimento"("ativo");
CREATE INDEX "submissao_coleta_status_periodo_idx" ON "submissao_coleta"("status", "periodo");
CREATE INDEX "submissao_coleta_validado_por_idx" ON "submissao_coleta"("validado_por");
CREATE UNIQUE INDEX "submissao_coleta_estabelecimento_id_periodo_key" ON "submissao_coleta"("estabelecimento_id", "periodo");

ALTER TABLE "submissao_coleta" ADD CONSTRAINT "submissao_coleta_estabelecimento_id_fkey"
  FOREIGN KEY ("estabelecimento_id") REFERENCES "estabelecimento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "submissao_coleta" ADD CONSTRAINT "submissao_coleta_validado_por_fkey"
  FOREIGN KEY ("validado_por") REFERENCES "user_admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT;
