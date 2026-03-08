import Link from "next/link";

export default function HomePage() {
  return (
    <main className="welcome-screen">
      <div className="welcome-orb orb-one" aria-hidden="true" />
      <div className="welcome-orb orb-two" aria-hidden="true" />
      <div className="welcome-orb orb-three" aria-hidden="true" />

      <section className="welcome-card glass">
        <p className="welcome-kicker">Bienvenido</p>
        <h1>Refresca tu dia con nuestra tienda de bebidas</h1>
        <p className="welcome-copy">
          Descubre precios por unidad y por paquete, productos activos y promociones actualizadas.
          Presiona siguiente para entrar al catalogo.
        </p>

        <div className="welcome-actions">
          <Link href="/tienda" className="next-button">
            Siguiente
          </Link>
          <Link href="/admin" className="ghost-button">
            Ir a admin
          </Link>
        </div>

        <div className="welcome-pill-row">
          <span>Catalogo en vivo</span>
          <span>Precios actualizados</span>
          <span>Gestion sencilla</span>
        </div>
      </section>
    </main>
  );
}
