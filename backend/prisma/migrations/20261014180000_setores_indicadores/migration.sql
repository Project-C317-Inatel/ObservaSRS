CREATE TABLE "setor" (
    "id" TEXT NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "setor_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "indicador" (
    "id" TEXT NOT NULL,
    "nome" VARCHAR(140) NOT NULL,
    "unidade" VARCHAR(40) NOT NULL,
    "descricao" TEXT,
    "setor_id" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "indicador_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "setor_nome_key" ON "setor"("nome");
CREATE INDEX "indicador_setor_id_idx" ON "indicador"("setor_id");

ALTER TABLE "indicador" ADD CONSTRAINT "indicador_setor_id_fkey"
FOREIGN KEY ("setor_id") REFERENCES "setor"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
