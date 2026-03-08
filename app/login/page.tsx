"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

async function parseError(response: Response, fallback: string) {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error ?? fallback;
  } catch {
    return fallback;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectTo = useMemo(() => {
    const nextPath = searchParams.get("next")?.trim();
    if (nextPath && nextPath.startsWith("/")) {
      return nextPath;
    }
    return "/admin";
  }, [searchParams]);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          redirect_to: redirectTo
        })
      });

      if (!response.ok) {
        throw new Error(await parseError(response, "No se pudo iniciar sesion."));
      }

      const data = (await response.json()) as { ok: boolean; redirect_to?: string };
      router.push(data.redirect_to ?? redirectTo);
      router.refresh();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "No se pudo iniciar sesion.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-screen">
      <div className="auth-orb auth-orb-one" aria-hidden="true" />
      <div className="auth-orb auth-orb-two" aria-hidden="true" />

      <section className="auth-card glass">
        <p className="auth-kicker">Acceso administrativo</p>
        <h1>Inicia sesion para administrar el catalogo</h1>
        <p className="auth-subtitle">Panel protegido para cambios de precios, productos e imagenes.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Usuario
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Ingresa tu usuario"
              autoComplete="username"
              required
            />
          </label>

          <label>
            Contrasena
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Ingresa tu contrasena"
              autoComplete="current-password"
              required
            />
          </label>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar al admin"}
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        <div className="auth-footer-links">
          <Link href="/">Volver a portada</Link>
          <Link href="/tienda">Ir a tienda</Link>
        </div>
      </section>
    </main>
  );
}


