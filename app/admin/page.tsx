"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type ProductoApi = {
  id: number;
  nombre: string;
  descripcion: string;
  imagen: string;
  activo: boolean;
  precio_unitario: number;
  precio_paquete: number;
  fecha_actualizacion: string;
};

type ProductoNuevo = {
  nombre: string;
  descripcion: string;
  imagen: string;
  activo: boolean;
  precio_unitario: number;
  precio_paquete: number;
};

const EMPTY_NEW_PRODUCT: ProductoNuevo = {
  nombre: "",
  descripcion: "",
  imagen: "/coca600.png",
  activo: true,
  precio_unitario: 0,
  precio_paquete: 0
};

function formatMx(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0
  }).format(value);
}

async function parseError(response: Response, fallback: string) {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error ?? fallback;
  } catch {
    return fallback;
  }
}

export default function AdminPage() {
  const [productos, setProductos] = useState<ProductoApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingIds, setSavingIds] = useState<Set<number>>(new Set());
  const [uploadingIds, setUploadingIds] = useState<Set<number>>(new Set());
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [uploadingNew, setUploadingNew] = useState(false);
  const [nuevoProducto, setNuevoProducto] = useState<ProductoNuevo>(EMPTY_NEW_PRODUCT);
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

  function markSaving(id: number, isSaving: boolean) {
    setSavingIds((current) => {
      const next = new Set(current);
      if (isSaving) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }

  function markUploading(id: number, isUploading: boolean) {
    setUploadingIds((current) => {
      const next = new Set(current);
      if (isUploading) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }

  function updateProductoField<K extends keyof ProductoApi>(id: number, field: K, value: ProductoApi[K]) {
    setProductos((current) =>
      current.map((producto) =>
        producto.id === id
          ? {
              ...producto,
              [field]: value
            }
          : producto
      )
    );
  }

  function replaceProductoInState(productoActualizado: ProductoApi) {
    setProductos((current) =>
      current.map((item) => (item.id === productoActualizado.id ? productoActualizado : item))
    );
  }

  async function updateProductoRequest(
    id: number,
    updates: Partial<Omit<ProductoApi, "id" | "fecha_actualizacion">>
  ) {
    const response = await fetch("/api/productos", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ id, ...updates })
    });

    if (!response.ok) {
      throw new Error(await parseError(response, "No se pudo actualizar el producto."));
    }

    const payload = (await response.json()) as { ok: boolean; producto: ProductoApi };
    replaceProductoInState(payload.producto);
    return payload.producto;
  }

  async function saveProducto(producto: ProductoApi) {
    setNotice("");
    setError("");
    markSaving(producto.id, true);

    try {
      await updateProductoRequest(producto.id, {
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        imagen: producto.imagen,
        activo: producto.activo,
        precio_unitario: producto.precio_unitario,
        precio_paquete: producto.precio_paquete
      });
      setNotice(`Se guardo ${producto.nombre}.`);
    } catch (saveError) {
      console.error(saveError);
      setError(saveError instanceof Error ? saveError.message : "Error al guardar.");
    } finally {
      markSaving(producto.id, false);
    }
  }

  async function toggleProducto(producto: ProductoApi) {
    setNotice("");
    setError("");
    markSaving(producto.id, true);

    try {
      const updated = await updateProductoRequest(producto.id, { activo: !producto.activo });
      setNotice(
        `${updated.nombre} ahora esta ${updated.activo ? "visible" : "oculto"} en el catalogo publico.`
      );
    } catch (toggleError) {
      console.error(toggleError);
      setError(toggleError instanceof Error ? toggleError.message : "No se pudo cambiar el estado.");
    } finally {
      markSaving(producto.id, false);
    }
  }

  async function deleteProducto(producto: ProductoApi) {
    const confirmed = window.confirm(`Se eliminara ${producto.nombre} del catalogo. Esta accion no se puede deshacer.`);

    if (!confirmed) {
      return;
    }

    setNotice("");
    setError("");
    setDeletingId(producto.id);

    try {
      const response = await fetch("/api/productos", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ id: producto.id })
      });

      if (!response.ok) {
        throw new Error(await parseError(response, "No se pudo eliminar el producto."));
      }

      setProductos((current) => current.filter((item) => item.id !== producto.id));
      setNotice(`Se elimino ${producto.nombre}.`);
    } catch (deleteError) {
      console.error(deleteError);
      setError(deleteError instanceof Error ? deleteError.message : "No se pudo eliminar.");
    } finally {
      setDeletingId(null);
    }
  }

  async function uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("imagen", file);

    const response = await fetch("/api/productos/imagen", {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      throw new Error(await parseError(response, "No se pudo subir la imagen."));
    }

    const payload = (await response.json()) as { ok: boolean; imagen: string };
    return payload.imagen;
  }

  async function uploadImageForProduct(producto: ProductoApi, file: File) {
    setNotice("");
    setError("");
    markUploading(producto.id, true);

    try {
      const imagen = await uploadImage(file);
      const actualizado = await updateProductoRequest(producto.id, { imagen });
      setNotice(`Imagen actualizada para ${actualizado.nombre}.`);
    } catch (uploadError) {
      console.error(uploadError);
      setError(uploadError instanceof Error ? uploadError.message : "No se pudo actualizar la imagen.");
    } finally {
      markUploading(producto.id, false);
    }
  }

  async function uploadImageForNewProduct(file: File) {
    setNotice("");
    setError("");
    setUploadingNew(true);

    try {
      const imagen = await uploadImage(file);
      setNuevoProducto((current) => ({ ...current, imagen }));
      setNotice("Imagen cargada para el nuevo producto.");
    } catch (uploadError) {
      console.error(uploadError);
      setError(uploadError instanceof Error ? uploadError.message : "No se pudo subir la imagen.");
    } finally {
      setUploadingNew(false);
    }
  }

  async function createProducto() {
    setNotice("");
    setError("");
    setCreating(true);

    try {
      const response = await fetch("/api/productos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(nuevoProducto)
      });

      if (!response.ok) {
        throw new Error(await parseError(response, "No se pudo crear el producto."));
      }

      const payload = (await response.json()) as { ok: boolean; producto: ProductoApi };
      setProductos((current) => [...current, payload.producto]);
      setNuevoProducto(EMPTY_NEW_PRODUCT);
      setNotice(`Se creo ${payload.producto.nombre}.`);
    } catch (createError) {
      console.error(createError);
      setError(createError instanceof Error ? createError.message : "No se pudo crear el producto.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="admin-panel">
      <h1>Panel administrativo</h1>
      <p className="subtitle">
        Administra catalogo completo. Productos registrados: {totalProductos}.
      </p>

      <section className="admin-item create-item">
        <h3>Crear producto nuevo</h3>

        <div className="form-row">
          <label>
            Nombre
            <input
              type="text"
              value={nuevoProducto.nombre}
              onChange={(event) =>
                setNuevoProducto((current) => ({ ...current, nombre: event.target.value }))
              }
              placeholder="Ej. Coca Cola Light 600ml"
            />
          </label>

          <label>
            Precio unitario
            <input
              type="number"
              min={0}
              value={nuevoProducto.precio_unitario}
              onChange={(event) =>
                setNuevoProducto((current) => ({
                  ...current,
                  precio_unitario: Number(event.target.value)
                }))
              }
            />
          </label>

          <label>
            Precio paquete o caja
            <input
              type="number"
              min={0}
              value={nuevoProducto.precio_paquete}
              onChange={(event) =>
                setNuevoProducto((current) => ({
                  ...current,
                  precio_paquete: Number(event.target.value)
                }))
              }
            />
          </label>
        </div>

        <label>
          Descripcion
          <textarea
            value={nuevoProducto.descripcion}
            onChange={(event) =>
              setNuevoProducto((current) => ({ ...current, descripcion: event.target.value }))
            }
            rows={3}
            placeholder="Describe el producto para el catalogo publico"
          />
        </label>

        <div className="image-tools">
          <img src={nuevoProducto.imagen.replace(/\.svg$/i, ".png")} alt="Previsualizacion del nuevo producto" className="thumb" />

          <label className="file-field">
            Imagen del producto
            <input
              type="file"
              accept="image/png"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  void uploadImageForNewProduct(file);
                }
                event.target.value = "";
              }}
              disabled={uploadingNew}
            />
          </label>

          <p className="path">Ruta actual: {nuevoProducto.imagen}</p>
        </div>

        <label className="toggle-label">
          <input
            type="checkbox"
            checked={nuevoProducto.activo}
            onChange={(event) =>
              setNuevoProducto((current) => ({ ...current, activo: event.target.checked }))
            }
          />
          Producto visible en catalogo publico
        </label>

        <button type="button" onClick={() => void createProducto()} disabled={creating || uploadingNew}>
          {creating ? "Creando..." : "Crear producto"}
        </button>
      </section>

      {loading && <p className="subtitle">Cargando productos...</p>}

      {!loading && (
        <section className="admin-grid">
          {productos.map((producto) => {
            const saving = savingIds.has(producto.id);
            const uploading = uploadingIds.has(producto.id);
            const deleting = deletingId === producto.id;
            const busy = saving || uploading || deleting;

            return (
              <article key={producto.id} className="admin-item">
                <h3>{producto.nombre}</h3>

                <div className="form-row">
                  <label>
                    Nombre del producto
                    <input
                      type="text"
                      value={producto.nombre}
                      onChange={(event) =>
                        updateProductoField(producto.id, "nombre", event.target.value)
                      }
                    />
                  </label>

                  <label>
                    Precio unitario
                    <input
                      type="number"
                      min={0}
                      value={producto.precio_unitario}
                      onChange={(event) =>
                        updateProductoField(
                          producto.id,
                          "precio_unitario",
                          Number(event.target.value)
                        )
                      }
                    />
                  </label>

                  <label>
                    Precio paquete o caja
                    <input
                      type="number"
                      min={0}
                      value={producto.precio_paquete}
                      onChange={(event) =>
                        updateProductoField(producto.id, "precio_paquete", Number(event.target.value))
                      }
                    />
                  </label>
                </div>

                <label>
                  Descripcion
                  <textarea
                    value={producto.descripcion}
                    onChange={(event) =>
                      updateProductoField(producto.id, "descripcion", event.target.value)
                    }
                    rows={3}
                  />
                </label>

                <div className="image-tools">
                  <img src={producto.imagen.replace(/\.svg$/i, ".png")} alt={`Imagen de ${producto.nombre}`} className="thumb" />

                  <label className="file-field">
                    Subir o cambiar imagen
                    <input
                      type="file"
                      accept="image/png"
                      onChange={(event) => {
                        const file = event.target.files?.[0];

                        if (file) {
                          void uploadImageForProduct(producto, file);
                        }

                        event.target.value = "";
                      }}
                      disabled={uploading || saving || deleting}
                    />
                  </label>

                  <p className="path">Ruta actual: {producto.imagen}</p>
                </div>

                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={producto.activo}
                    onChange={(event) =>
                      updateProductoField(producto.id, "activo", event.target.checked)
                    }
                  />
                  Visible en catalogo publico
                </label>

                <p className="subtitle">
                  Vista rapida: {formatMx(producto.precio_unitario)} / {formatMx(producto.precio_paquete)}
                </p>

                <div className="button-row">
                  <button type="button" onClick={() => void saveProducto(producto)} disabled={busy}>
                    {saving ? "Guardando..." : "Guardar cambios"}
                  </button>

                  <button
                    type="button"
                    className="secondary"
                    onClick={() => void toggleProducto(producto)}
                    disabled={busy}
                  >
                    {producto.activo ? "Desactivar" : "Activar"}
                  </button>

                  <button
                    type="button"
                    className="danger"
                    onClick={() => void deleteProducto(producto)}
                    disabled={busy}
                  >
                    {deleting ? "Eliminando..." : "Eliminar"}
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {notice && <p className="notice">{notice}</p>}
      {error && <p className="error">{error}</p>}

      <div className="actions">
        <Link href="/tienda">Volver a tienda</Link>
      </div>
    </main>
  );
}





