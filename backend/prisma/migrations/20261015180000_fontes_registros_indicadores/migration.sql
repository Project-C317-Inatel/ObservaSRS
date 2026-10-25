CREATE TABLE "fonte_dado" (
    "id" TEXT NOT NULL,
    "nome" VARCHAR(150) NOT NULL,
    "descricao" TEXT,
    "tipo" VARCHAR(50) NOT NULL,
    "referencia" TEXT,

    CONSTRAINT "fonte_dado_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "registro_indicador" (
    "id" TEXT NOT NULL,
    "indicador_id" TEXT NOT NULL,
    "fonte_id" TEXT NOT NULL,
    "periodo" DATE NOT NULL,
    "valor" DECIMAL(14,2) NOT NULL,
    "publicado" BOOLEAN NOT NULL DEFAULT false,
    "observacao" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "registro_indicador_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "registro_indicador_indicador_id_fonte_id_periodo_key"
ON "registro_indicador"("indicador_id", "fonte_id", "periodo");
CREATE INDEX "registro_indicador_fonte_id_idx" ON "registro_indicador"("fonte_id");
CREATE INDEX "registro_indicador_periodo_idx" ON "registro_indicador"("periodo");

ALTER TABLE "registro_indicador" ADD CONSTRAINT "registro_indicador_indicador_id_fkey"
FOREIGN KEY ("indicador_id") REFERENCES "indicador"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "registro_indicador" ADD CONSTRAINT "registro_indicador_fonte_id_fkey"
FOREIGN KEY ("fonte_id") REFERENCES "fonte_dado"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
