import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const productos = [
  {
    id: 1,
    nombre: "Coca Cola 600ml",
    imagen: "/coca600.svg",
    precioUnitario: 18,
    precioPaquete: 160
  },
  {
    id: 2,
    nombre: "Coca Cola 2L",
    imagen: "/coca2l.svg",
    precioUnitario: 38,
    precioPaquete: 420
  },
  {
    id: 3,
    nombre: "Sprite 600ml",
    imagen: "/sprite600.svg",
    precioUnitario: 17,
    precioPaquete: 150
  },
  {
    id: 4,
    nombre: "Fanta Naranja 600ml",
    imagen: "/fanta600.svg",
    precioUnitario: 17,
    precioPaquete: 150
  },
  {
    id: 5,
    nombre: "Fresca Toronja 600ml",
    imagen: "/fresca600.svg",
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
        imagen: producto.imagen,
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
