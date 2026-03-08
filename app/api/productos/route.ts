import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type ProductoResponse = {
  id: number;
  nombre: string;
  descripcion: string;
  imagen: string;
  activo: boolean;
  precio_unitario: number;
  precio_paquete: number;
  fecha_actualizacion: string;
};

function toApiProducto(producto: {
  id: number;
  nombre: string;
  descripcion: string;
  imagen: string;
  activo: boolean;
  precioUnitario: number;
  precioPaquete: number;
  fechaActualizacion: Date;
}): ProductoResponse {
  return {
    id: producto.id,
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    imagen: producto.imagen.replace(/\.svg$/i, ".png"),
    activo: producto.activo,
    precio_unitario: producto.precioUnitario,
    precio_paquete: producto.precioPaquete,
    fecha_actualizacion: producto.fechaActualizacion.toISOString()
  };
}

function parseId(value: unknown): number {
  return Number(value);
}

function parsePrice(value: unknown): number {
  return Number(value);
}

function parseNombre(value: unknown): string {
  return String(value ?? "").trim();
}

function parseDescripcion(value: unknown): string {
  return String(value ?? "").trim();
}

function parseImagen(value: unknown): string {
  const imagen = String(value ?? "").trim();

  if (imagen.length === 0) {
    return "/coca600.png";
  }

  return imagen.replace(/\.svg$/i, ".png");
}

export async function GET(request: NextRequest) {
  const soloActivos = request.nextUrl.searchParams.get("solo_activos") === "1";

  const productos = await prisma.producto.findMany({
    where: soloActivos ? { activo: true } : undefined,
    orderBy: { id: "asc" }
  });

  return NextResponse.json(productos.map(toApiProducto));
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      nombre?: unknown;
      descripcion?: unknown;
      imagen?: unknown;
      activo?: unknown;
      precio_unitario?: unknown;
      precio_paquete?: unknown;
    };

    const nombre = parseNombre(body.nombre);
    const descripcion = parseDescripcion(body.descripcion);
    const imagen = parseImagen(body.imagen);
    const activo = typeof body.activo === "boolean" ? body.activo : true;
    const precioUnitario = parsePrice(body.precio_unitario);
    const precioPaquete = parsePrice(body.precio_paquete);

    if (nombre.length < 2) {
      return NextResponse.json(
        { ok: false, error: "El nombre del producto es invalido." },
        { status: 400 }
      );
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

    const nuevoProducto = await prisma.producto.create({
      data: {
        nombre,
        descripcion,
        imagen,
        activo,
        precioUnitario: Math.round(precioUnitario),
        precioPaquete: Math.round(precioPaquete)
      }
    });

    revalidatePath("/");
    revalidatePath("/tienda");
    revalidatePath("/admin");

    return NextResponse.json({ ok: true, producto: toApiProducto(nuevoProducto) }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { ok: false, error: "No fue posible crear el producto." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      id?: unknown;
      nombre?: unknown;
      descripcion?: unknown;
      imagen?: unknown;
      activo?: unknown;
      precio_unitario?: unknown;
      precio_paquete?: unknown;
    };

    const id = parseId(body.id);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ ok: false, error: "El id es invalido." }, { status: 400 });
    }

    const data: Prisma.ProductoUpdateInput = {};

    if (body.nombre !== undefined) {
      const nombre = parseNombre(body.nombre);

      if (nombre.length < 2) {
        return NextResponse.json(
          { ok: false, error: "El nombre del producto es invalido." },
          { status: 400 }
        );
      }

      data.nombre = nombre;
    }

    if (body.descripcion !== undefined) {
      data.descripcion = parseDescripcion(body.descripcion);
    }

    if (body.imagen !== undefined) {
      data.imagen = parseImagen(body.imagen);
    }

    if (body.activo !== undefined) {
      if (typeof body.activo !== "boolean") {
        return NextResponse.json({ ok: false, error: "El estado activo es invalido." }, { status: 400 });
      }

      data.activo = body.activo;
    }

    if (body.precio_unitario !== undefined) {
      const precioUnitario = parsePrice(body.precio_unitario);

      if (!Number.isFinite(precioUnitario) || precioUnitario < 0) {
        return NextResponse.json(
          { ok: false, error: "El precio unitario es invalido." },
          { status: 400 }
        );
      }

      data.precioUnitario = Math.round(precioUnitario);
    }

    if (body.precio_paquete !== undefined) {
      const precioPaquete = parsePrice(body.precio_paquete);

      if (!Number.isFinite(precioPaquete) || precioPaquete < 0) {
        return NextResponse.json(
          { ok: false, error: "El precio de paquete es invalido." },
          { status: 400 }
        );
      }

      data.precioPaquete = Math.round(precioPaquete);
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { ok: false, error: "No se enviaron cambios para actualizar." },
        { status: 400 }
      );
    }

    data.fechaActualizacion = new Date();

    const productoActualizado = await prisma.producto.update({
      where: { id },
      data
    });

    revalidatePath("/");
    revalidatePath("/tienda");
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

export async function DELETE(request: NextRequest) {
  try {
    const body = (await request.json()) as { id?: unknown };
    const id = parseId(body.id);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ ok: false, error: "El id es invalido." }, { status: 400 });
    }

    const productoEliminado = await prisma.producto.delete({
      where: { id }
    });

    revalidatePath("/");
    revalidatePath("/tienda");
    revalidatePath("/admin");

    return NextResponse.json({ ok: true, producto: toApiProducto(productoEliminado) });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json(
        { ok: false, error: "No existe un producto con ese id." },
        { status: 404 }
      );
    }

    console.error(error);
    return NextResponse.json(
      { ok: false, error: "No fue posible eliminar el producto." },
      { status: 500 }
    );
  }
}







