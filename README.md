# Venta de refrescos - Next.js + Prisma

Aplicacion web con dos vistas:

- Vista publica (`/`): muestra refrescos con imagen y precios.
- Vista administrativa (`/admin`): permite editar `precio_unitario` y `precio_paquete`.

La API se implementa en `app/api/productos/route.ts` con metodos `GET` y `PUT`.

## Tecnologias

- Next.js (App Router)
- React
- Node.js
- Prisma ORM
- SQLite (desarrollo local)

Si quieres usar PostgreSQL, cambia `provider` y `DATABASE_URL` en `prisma/schema.prisma` y `.env`.

## Modelo

Tabla: `productos`

Campos:

- `id`
- `nombre`
- `imagen`
- `precio_unitario`
- `precio_paquete`
- `fecha_actualizacion`

## Scripts

- `npm run dev`: inicia Next.js en desarrollo.
- `npm run build`: genera build de produccion.
- `npm run start`: arranca build de produccion.
- `npm run prisma:generate`: genera Prisma Client.
- `npm run prisma:migrate`: ejecuta migraciones Prisma.
- `npm run prisma:seed`: carga catalogo inicial (`node prisma/seed.js`).

## Arranque rapido (Windows / PowerShell)

1. Instala dependencias.

```powershell
npm install
```

2. Crea el archivo de entorno.

```powershell
Copy-Item .env.example .env
```

3. Genera cliente Prisma.

```powershell
npx prisma generate
```

4. Crea la base con migracion inicial.

```powershell
npx prisma migrate dev --name init
```

5. Inserta productos base.

```powershell
npm run prisma:seed
```

6. Ejecuta la aplicacion.

```powershell
npm run dev
```

7. Abre las rutas.

- `http://localhost:3000/` vista publica.
- `http://localhost:3000/admin` panel administrativo.

## Flujo funcional

1. El administrador entra a `/admin`.
2. Cambia precios y presiona `Guardar`.
3. La API ejecuta `PUT /api/productos`.
4. Prisma actualiza la tabla `productos`.
5. La vista publica `/` refleja precios actualizados.

## Solucion de problemas

### Error `Unexpected token "﻿"` en JSON o Prisma schema

Hay un BOM (caracter oculto UTF-8) al inicio del archivo.

Reescribe el archivo sin BOM:

```powershell
$path = "prisma/schema.prisma"
$content = Get-Content -Raw $path
$enc = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText((Resolve-Path $path), $content, $enc)
```

Aplica la misma idea si el error sale en `package.json`.

### Error de SWC en Next.js (`not a valid Win32 application`)

Normalmente es instalacion corrupta de binarios nativos. Limpia e instala de nuevo:

```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm cache verify
npm install
```