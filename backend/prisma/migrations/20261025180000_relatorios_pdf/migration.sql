CREATE TYPE "TipoRelatorio" AS ENUM ('TRIMESTRAL', 'SETORIAL', 'ANUAL');

CREATE TABLE "relatorio" (
    "id" TEXT NOT NULL,
    "titulo" VARCHAR(180) NOT NULL,
    "descricao" TEXT,
    "tipo" "TipoRelatorio" NOT NULL,
    "periodo_referencia" VARCHAR(30) NOT NULL,
    "arquivo_chave" VARCHAR(80),
    "arquivo_nome" VARCHAR(255),
    "arquivo_tamanho" INTEGER,
    "criado_por" TEXT NOT NULL,
    "publicado" BOOLEAN NOT NULL DEFAULT false,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,
    "publicado_em" TIMESTAMP(3),

    CONSTRAINT "relatorio_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "relatorio_arquivo_chave_key" ON "relatorio"("arquivo_chave");
CREATE INDEX "relatorio_criado_por_idx" ON "relatorio"("criado_por");
CREATE INDEX "relatorio_publicado_publicado_em_idx" ON "relatorio"("publicado", "publicado_em");
CREATE INDEX "relatorio_tipo_periodo_referencia_idx" ON "relatorio"("tipo", "periodo_referencia");

ALTER TABLE "relatorio" ADD CONSTRAINT "relatorio_criado_por_fkey"
FOREIGN KEY ("criado_por") REFERENCES "user_admin"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
