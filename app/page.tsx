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
    <main className="storefront">
      <header className="site-header glass">
        <div className="logo">Coca-Cola Refrescos</div>
        <nav className="site-nav" aria-label="Navegacion principal">
          <a href="#inicio">Inicio</a>
          <a href="#productos">Productos</a>
          <a href="#promociones">Promociones</a>
          <Link href="/admin">Admin</Link>
        </nav>
      </header>

      <section className="hero" id="inicio">
        <div className="hero-copy">
          <p className="kicker">Sabor que refresca</p>
          <h1>Venta de refrescos Coca-Cola</h1>
          <p className="subtitle">Precios vigentes por unidad y por paquete de 12 piezas.</p>
        </div>

        <div className="hero-image-wrap glass">
          <img className="hero-image" src="/coca600.png" alt="Botella de refresco Coca-Cola" />
        </div>
      </section>

      <section className="products-section" id="productos">
        <div className="section-head">
          <h2>Refrescos disponibles</h2>
          <p>Catálogo actualizado automáticamente desde base de datos.</p>
        </div>

        <div className="grid">
          {productos.map((producto) => (
            <article className="card" key={producto.id}>
              <img src={producto.imagen.replace(/\.svg$/i, ".png")} alt={producto.nombre} />
              <h3>{producto.nombre}</h3>
              <p className="price unit-price">Precio: {formatMx(producto.precioUnitario)}</p>
              <p className="price pack-price">Paquete (12): {formatMx(producto.precioPaquete)}</p>
              <button type="button" className="buy-button">
                Comprar
              </button>
              <span className="badge">
                Actualizado: {producto.fechaActualizacion.toLocaleDateString("es-MX")}
              </span>
            </article>
          ))}
        </div>
      </section>

      <section className="promos" id="promociones">
        <h2>Promociones</h2>
        <div className="promo-grid">
          {productos.slice(0, 2).map((producto) => {
            const ahorro = producto.precioUnitario * 12 - producto.precioPaquete;

            return (
              <article className="promo-card" key={`promo-${producto.id}`}>
                <h3>{producto.nombre}</h3>
                <p>Llevate el paquete de 12 piezas con mejor precio.</p>
                <p className="promo-value">Ahorro estimado: {formatMx(Math.max(ahorro, 0))}</p>
              </article>
            );
          })}
        </div>
      </section>

      <footer className="site-footer">
        <p>Precios sujetos a cambio sin previo aviso.</p>
        <Link href="/admin">Ir a panel de administración</Link>
      </footer>
    </main>
  );
}