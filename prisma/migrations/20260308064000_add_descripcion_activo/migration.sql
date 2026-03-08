-- AlterTable
ALTER TABLE "productos" ADD COLUMN "descripcion" TEXT NOT NULL DEFAULT '';
ALTER TABLE "productos" ADD COLUMN "activo" BOOLEAN NOT NULL DEFAULT true;
