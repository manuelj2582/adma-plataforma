# ADMA Plataforma — Fase 1

Sistema de gestión de producción para ADMA Chile.

## Stack
- Next.js 15 (App Router)
- Supabase (Postgres + Auth + RLS)
- Tailwind CSS
- TypeScript

## Setup local

1. Copia `.env.local.example` a `.env.local` y completa con tus credenciales de Supabase.
2. Instala dependencias: `npm install`
3. Corre el dev server: `npm run dev`
4. Abre `http://localhost:3000`

## Variables de entorno (Vercel)

En el dashboard de Vercel → Settings → Environment Variables:

- `NEXT_PUBLIC_SUPABASE_URL` — URL de tu proyecto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Anon key de Supabase

## Estructura

- `src/app/login` — Login con magic link
- `src/app/(dashboard)` — Layout autenticado con sidebar
- `src/app/(dashboard)/insumos` — Gestión de insumos
- `src/app/(dashboard)/productos` — Gestión de productos
- `src/app/(dashboard)/proveedores` — Gestión de proveedores
- `src/app/(dashboard)/usuarios` — Gestión de usuarios (solo admin)
- `src/lib/supabase` — Clientes de Supabase (cliente y servidor)

## Fase actual: 1 — Fundación
- [x] Auth con magic link
- [x] Layout principal con sidebar
- [x] CRUD de insumos
- [x] CRUD de productos
- [x] CRUD de proveedores
- [x] Gestión de roles de usuarios

## Próximas fases
- Fase 2: Fórmulas + simulador de viabilidad
- Fase 3: Cotizaciones, pedidos y timeline
- Fase 4: Inventario en vivo + KPIs
