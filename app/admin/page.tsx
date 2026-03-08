"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type ProductoApi = {
  id: number;
  nombre: string;
  imagen: string;
  precio_unitario: number;
  precio_paquete: number;
  fecha_actualizacion: string;
};

function formatMx(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0
  }).format(value);
}

export default function AdminPage() {
  const [productos, setProductos] = useState<ProductoApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [notice, setNotice] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function loadProductos() {
      try {
        const response = await fetch("/api/productos", { cache: "no-store" });

        if (!response.ok) {
          throw new Error("No se pudieron cargar productos.");
        }

        const data = (await response.json()) as ProductoApi[];
        setProductos(data);
      } catch (loadError) {
        console.error(loadError);
        setError("No se pudo cargar el catalogo.");
      } finally {
        setLoading(false);
      }
    }

    loadProductos();
  }, []);

  const totalProductos = useMemo(() => productos.length, [productos]);

  function updateField(id: number, field: "precio_unitario" | "precio_paquete", value: number) {
    setProductos((current) =>
      current.map((producto) =>
        producto.id === id
          ? {
              ...producto,
              [field]: Number.isNaN(value) ? 0 : value
            }
          : producto
      )
    );
  }

  async function saveProducto(producto: ProductoApi) {
    setNotice("");
    setError("");
    setSavingId(producto.id);

    try {
      const response = await fetch("/api/productos", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id: producto.id,
          precio_unitario: producto.precio_unitario,
          precio_paquete: producto.precio_paquete
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error ?? "No se pudo guardar.");
      }

      const payload = (await response.json()) as { ok: boolean; producto: ProductoApi };
      setProductos((current) =>
        current.map((item) => (item.id === payload.producto.id ? payload.producto : item))
      );
      setNotice(`Se guardo ${producto.nombre}.`);
    } catch (saveError) {
      console.error(saveError);
      setError(saveError instanceof Error ? saveError.message : "Error al guardar.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <main>
      <h1>Panel administrativo</h1>
      <p className="subtitle">Edita precios y guarda cambios en base de datos. Productos: {totalProductos}.</p>

      {loading && <p className="subtitle">Cargando productos...</p>}

      {!loading && (
        <section className="admin-grid">
          {productos.map((producto) => (
            <article key={producto.id} className="admin-item">
              <h3>{producto.nombre}</h3>

              <div className="form-row">
                <label>
                  Precio unitario
                  <input
                    type="number"
                    min={0}
                    value={producto.precio_unitario}
                    onChange={(event) =>
                      updateField(producto.id, "precio_unitario", Number(event.target.value))
                    }
                  />
                </label>

                <label>
                  Precio paquete (12)
                  <input
                    type="number"
                    min={0}
                    value={producto.precio_paquete}
                    onChange={(event) =>
                      updateField(producto.id, "precio_paquete", Number(event.target.value))
                    }
                  />
                </label>
              </div>

              <p className="subtitle">
                Vista rapida: {formatMx(producto.precio_unitario)} / {formatMx(producto.precio_paquete)}
              </p>

              <button
                type="button"
                onClick={() => saveProducto(producto)}
                disabled={savingId === producto.id}
              >
                {savingId === producto.id ? "Guardando..." : "Guardar"}
              </button>
            </article>
          ))}
        </section>
      )}

      {notice && <p className="notice">{notice}</p>}
      {error && <p className="error">{error}</p>}

      <div className="actions">
        <Link href="/">Volver a vista publica</Link>
      </div>
    </main>
  );
}
