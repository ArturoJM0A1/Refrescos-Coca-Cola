import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type ProductoResponse = {
  id: number;
  nombre: string;
  imagen: string;
  precio_unitario: number;
  precio_paquete: number;
  fecha_actualizacion: string;
};

function toApiProducto(producto: {
  id: number;
  nombre: string;
  imagen: string;
  precioUnitario: number;
  precioPaquete: number;
  fechaActualizacion: Date;
}): ProductoResponse {
  return {
    id: producto.id,
    nombre: producto.nombre,
    imagen: producto.imagen,
    precio_unitario: producto.precioUnitario,
    precio_paquete: producto.precioPaquete,
    fecha_actualizacion: producto.fechaActualizacion.toISOString()
  };
}

export async function GET() {
  const productos = await prisma.producto.findMany({
    orderBy: { id: "asc" }
  });

  return NextResponse.json(productos.map(toApiProducto));
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      id?: number;
      precio_unitario?: number;
      precio_paquete?: number;
    };

    const id = Number(body.id);
    const precioUnitario = Number(body.precio_unitario);
    const precioPaquete = Number(body.precio_paquete);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ ok: false, error: "El id es invalido." }, { status: 400 });
    }

    if (!Number.isFinite(precioUnitario) || precioUnitario < 0) {
      return NextResponse.json(
        { ok: false, error: "El precio unitario es invalido." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(precioPaquete) || precioPaquete < 0) {
      return NextResponse.json(
        { ok: false, error: "El precio de paquete es invalido." },
        { status: 400 }
      );
    }

    const productoActualizado = await prisma.producto.update({
      where: { id },
      data: {
        precioUnitario: Math.round(precioUnitario),
        precioPaquete: Math.round(precioPaquete),
        fechaActualizacion: new Date()
      }
    });

    revalidatePath("/");
    revalidatePath("/admin");

    return NextResponse.json({
      ok: true,
      producto: toApiProducto(productoActualizado)
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json(
        { ok: false, error: "No existe un producto con ese id." },
        { status: 404 }
      );
    }

    console.error(error);
    return NextResponse.json(
      { ok: false, error: "No fue posible actualizar el producto." },
      { status: 500 }
    );
  }
}
