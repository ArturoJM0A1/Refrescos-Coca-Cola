import Link from "next/link";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

function formatMx(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0
  }).format(value);
}

export default async function HomePage() {
  const productos = await prisma.producto.findMany({
    orderBy: { id: "asc" }
  });

  return (
    <main>
      <h1>Refrescos Coca-Cola</h1>
      <p className="subtitle">Precios vigentes por unidad y por paquete de 12 piezas.</p>

      <section className="grid">
        {productos.map((producto) => (
          <article className="card" key={producto.id}>
            <img src={producto.imagen} alt={producto.nombre} />
            <h2>{producto.nombre}</h2>
            <p className="price">Precio: {formatMx(producto.precioUnitario)}</p>
            <p className="price">Paquete (12): {formatMx(producto.precioPaquete)}</p>
            <span className="badge">Actualizado: {producto.fechaActualizacion.toLocaleDateString("es-MX")}</span>
          </article>
        ))}
      </section>

      <div className="actions">
        <Link href="/admin">Ir a panel de administracion</Link>
      </div>
    </main>
  );
}
