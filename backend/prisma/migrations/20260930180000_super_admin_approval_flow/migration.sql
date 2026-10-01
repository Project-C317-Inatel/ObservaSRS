ALTER TYPE "PapelAdmin" ADD VALUE 'SUPER_ADMIN' BEFORE 'ADMIN';

CREATE TYPE "StatusContaAdmin" AS ENUM ('PENDENTE', 'APROVADO', 'REJEITADO');

ALTER TABLE "user_admin"
ADD COLUMN "status" "StatusContaAdmin",
ADD COLUMN "avaliado_em" TIMESTAMP(3),
ADD COLUMN "avaliado_por_id" TEXT;

UPDATE "user_admin"
SET "status" = 'APROVADO', "ativo" = true;

ALTER TABLE "user_admin"
ALTER COLUMN "status" SET NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PENDENTE',
ALTER COLUMN "ativo" SET DEFAULT false;

ALTER TABLE "user_admin"
ADD CONSTRAINT "user_admin_avaliado_por_id_fkey"
FOREIGN KEY ("avaliado_por_id") REFERENCES "user_admin"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "user_admin_status_idx" ON "user_admin"("status");
CREATE INDEX "user_admin_avaliado_por_id_idx" ON "user_admin"("avaliado_por_id");
