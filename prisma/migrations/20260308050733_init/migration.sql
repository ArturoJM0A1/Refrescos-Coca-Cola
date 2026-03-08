-- CreateTable
CREATE TABLE "productos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "imagen" TEXT NOT NULL,
    "precio_unitario" INTEGER NOT NULL,
    "precio_paquete" INTEGER NOT NULL,
    "fecha_actualizacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
