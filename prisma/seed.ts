import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const productos = [
  {
    id: 1,
    nombre: "Coca Cola 600ml",
    descripcion: "Refresco clasico en botella de 600 ml.",
    imagen: "/coca600.png",
    activo: true,
    precioUnitario: 18,
    precioPaquete: 160
  },
  {
    id: 2,
    nombre: "Coca Cola 2L",
    descripcion: "Presentacion familiar de 2 litros.",
    imagen: "/coca2l.png",
    activo: true,
    precioUnitario: 38,
    precioPaquete: 420
  },
  {
    id: 3,
    nombre: "Sprite 600ml",
    descripcion: "Refresco lima-limon de 600 ml.",
    imagen: "/sprite600.png",
    activo: true,
    precioUnitario: 17,
    precioPaquete: 150
  },
  {
    id: 4,
    nombre: "Fanta Naranja 600ml",
    descripcion: "Sabor naranja en presentacion de 600 ml.",
    imagen: "/fanta600.png",
    activo: true,
    precioUnitario: 17,
    precioPaquete: 150
  },
  {
    id: 5,
    nombre: "Fresca Toronja 600ml",
    descripcion: "Refresco sabor toronja de 600 ml.",
    imagen: "/fresca600.png",
    activo: true,
    precioUnitario: 16,
    precioPaquete: 145
  }
];

async function main() {
  for (const producto of productos) {
    await prisma.producto.upsert({
      where: { id: producto.id },
      update: {
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        imagen: producto.imagen,
        activo: producto.activo,
        precioUnitario: producto.precioUnitario,
        precioPaquete: producto.precioPaquete,
        fechaActualizacion: new Date()
      },
      create: producto
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
