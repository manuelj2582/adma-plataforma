import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  Calculator,
  ClipboardList,
  BookOpen,
  ArrowUpRight,
  Package,
  FlaskConical,
  Truck,
  Building2,
} from "lucide-react";

const ESTADO_BADGE: Record<string, string> = {
  borrador: "badge-neutral",
  enviada: "badge-info",
  aprobada: "badge-success",
  convertida: "badge-info",
  rechazada: "badge-danger",
  expirada: "badge-warn",
};

const ESTADOS_LABEL: Record<string, string> = {
  borrador: "Borrador",
  enviada: "Enviada",
  aprobada: "Aprobada",
  convertida: "Convertida",
  rechazada: "Rechazada",
  expirada: "Expirada",
};

export default async function HomePage() {
  const supabase = await createClient();

  const [
    { count: insumosCount },
    { count: productosCount },
    { count: proveedoresCount },
    { count: clientesCount },
    { count: formulasVigentesCount },
    { data: cotizacionesActivas },
    { data: insumosBajoStock },
  ] = await Promise.all([
    supabase.from("insumos").select("*", { count: "exact", head: true }).eq("activo", true),
    supabase.from("productos").select("*", { count: "exact", head: true }).eq("activo", true),
    supabase.from("proveedores").select("*", { count: "exact", head: true }).eq("activo", true),
    supabase.from("clientes").select("*", { count: "exact", head: true }).eq("activo", true),
    supabase.from("formulas").select("*", { count: "exact", head: true }).is("vigente_hasta", null),
    supabase
      .from("cotizaciones")
      .select("id, numero, cantidad, estado, fecha_cotizacion, productos(nombre), clientes(nombre)")
      .in("estado", ["borrador", "enviada", "aprobada"])
      .order("creado_en", { ascending: false })
      .limit(5),
    supabase
      .from("insumos_disponibilidad")
      .select("id, codigo, nombre, stock_disponible, stock_minimo, unidad_medida")
      .eq("activo", true)
      .eq("bajo_stock", true)
      .limit(5),
  ]);

  const ahora = new Date();
  const saludo =
    ahora.getHours() < 12 ? "Buenos días" : ahora.getHours() < 19 ? "Buenas tardes" : "Buenas noches";

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="flex items-end justify-between gap-6 pb-2">
        <div>
          <p className="section-label mb-2">Inicio</p>
          <h1 className="font-display text-5xl text-ink tracking-tightest leading-[1] text-balance">
            {saludo}.
          </h1>
          <p className="mt-3 text-ink-mute text-[15px] leading-relaxed max-w-xl">
            Resumen de la operación. Datos actualizados en tiempo real.
          </p>
        </div>
        <div className="hidden md:block text-right">
          <p className="section-label mb-1">Hoy</p>
          <p className="font-mono text-sm text-ink-mute">
            {ahora.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
      </div>

      {/* Acciones principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Link
          href="/simulador"
          className="group relative overflow-hidden rounded-lg bg-olive-900 text-paper p-6 transition-all hover:shadow-lift"
        >
          <div className="absolute inset-0 bg-grid opacity-10"></div>
          <div className="absolute -bottom-8 -right-8 select-none pointer-events-none">
            <span className="font-display text-[12rem] leading-none text-olive-700/40 tracking-tightest">
              s
            </span>
          </div>
          <div className="relative">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-paper/10 backdrop-blur-sm border border-paper/10 mb-4">
              <Calculator className="h-4 w-4" strokeWidth={2} />
            </div>
            <h3 className="font-display text-2xl tracking-tight mb-1">
              Simular un pedido
            </h3>
            <p className="text-olive-200/80 text-sm leading-relaxed max-w-sm">
              Calcula automáticamente qué insumos se necesitan, qué hay y qué falta
            </p>
            <div className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-olive-200 group-hover:gap-2 transition-all">
              Abrir simulador
              <ArrowUpRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </Link>

        <Link
          href="/cotizaciones"
          className="group relative overflow-hidden rounded-lg bg-paper-card border border-paper-edge p-6 transition-all hover:border-ink-mute hover:shadow-card"
        >
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-amber-100 text-amber-700 mb-4">
            <ClipboardList className="h-4 w-4" strokeWidth={2} />
          </div>
          <h3 className="font-display text-2xl tracking-tight text-ink mb-1">
            Cotizaciones
          </h3>
          <p className="text-ink-mute text-sm leading-relaxed max-w-sm">
            Gestiona las cotizaciones a clientes y conviértelas en pedidos
          </p>
          <div className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-ink group-hover:gap-2 transition-all">
            Ver cotizaciones
            <ArrowUpRight className="h-3.5 w-3.5" />
          </div>
        </Link>
      </div>

      {/* Métricas */}
      <div>
        <p className="section-label mb-3">Maestras</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          <StatCard
            href="/insumos"
            label="Insumos"
            value={insumosCount ?? 0}
            icon={Package}
          />
          <StatCard
            href="/productos"
            label="Productos"
            value={productosCount ?? 0}
            icon={FlaskConical}
          />
          <StatCard
            href="/formulas"
            label="Fórmulas"
            value={formulasVigentesCount ?? 0}
            icon={BookOpen}
          />
          <StatCard
            href="/proveedores"
            label="Proveedores"
            value={proveedoresCount ?? 0}
            icon={Truck}
          />
          <StatCard
            href="/clientes"
            label="Clientes"
            value={clientesCount ?? 0}
            icon={Building2}
          />
        </div>
      </div>

      {/* Dos columnas: cotizaciones activas + alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-paper-edge flex items-center justify-between">
              <div>
                <h3 className="font-medium text-[15px] text-ink">Cotizaciones activas</h3>
                <p className="text-xs text-ink-mute mt-0.5">Borradores, enviadas y aprobadas</p>
              </div>
              <Link
                href="/cotizaciones"
                className="text-xs text-ink-mute hover:text-ink inline-flex items-center gap-1"
              >
                Ver todas
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
            {cotizacionesActivas && cotizacionesActivas.length > 0 ? (
              <div className="divide-y divide-paper-edge">
                {cotizacionesActivas.map((c: any) => (
                  <Link
                    key={c.id}
                    href={`/cotizaciones/${c.id}`}
                    className="flex items-center gap-4 px-5 py-3 hover:bg-paper-warm/60 transition-colors"
                  >
                    <span className="font-mono text-[11px] text-ink-mute w-32 shrink-0">
                      {c.numero}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink truncate">
                        {c.productos?.nombre}
                      </p>
                      <p className="text-xs text-ink-mute truncate mt-0.5">
                        {c.clientes?.nombre ?? "Sin cliente"} ·{" "}
                        <span className="font-mono">
                          {c.cantidad.toLocaleString("es-CL")} u
                        </span>
                      </p>
                    </div>
                    <span className={ESTADO_BADGE[c.estado]}>
                      {ESTADOS_LABEL[c.estado]}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="px-5 py-12 text-center">
                <p className="text-sm text-ink-mute">No hay cotizaciones activas.</p>
                <Link
                  href="/simulador"
                  className="mt-3 text-sm text-olive-700 hover:text-olive-800 font-medium inline-flex items-center gap-1"
                >
                  Crear una desde el simulador
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-paper-edge">
              <h3 className="font-medium text-[15px] text-ink">Insumos bajo mínimo</h3>
              <p className="text-xs text-ink-mute mt-0.5">Requieren reposición</p>
            </div>
            {insumosBajoStock && insumosBajoStock.length > 0 ? (
              <div className="divide-y divide-paper-edge">
                {insumosBajoStock.map((i: any) => (
                  <Link
                    key={i.id}
                    href={`/insumos/${i.id}`}
                    className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-paper-warm/60 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ink truncate">{i.nombre}</p>
                      <p className="font-mono text-[11px] text-ink-mute mt-0.5">
                        {i.codigo}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-mono text-sm text-danger-fg font-medium">
                        {Number(i.stock_disponible).toLocaleString("es-CL")} {i.unidad_medida}
                      </p>
                      <p className="text-[10px] text-ink-mute mt-0.5">
                        mín {Number(i.stock_minimo).toLocaleString("es-CL")}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="px-5 py-12 text-center">
                <p className="text-sm text-success-fg">Todos los insumos están sobre el mínimo</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  href,
  label,
  value,
  icon: Icon,
}: {
  href: string;
  label: string;
  value: number;
  icon: typeof Package;
}) {
  return (
    <Link
      href={href}
      className="group bg-paper-card border border-paper-edge rounded-lg p-4 hover:border-ink-mute hover:shadow-card transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <Icon
          className="h-4 w-4 text-ink-subtle group-hover:text-olive-700 transition-colors"
          strokeWidth={2}
        />
        <ArrowUpRight className="h-3.5 w-3.5 text-ink-subtle opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <p className="font-display text-3xl text-ink tracking-tightest tabular-nums leading-none">
        {value}
      </p>
      <p className="text-xs text-ink-mute mt-2">{label}</p>
    </Link>
  );
}
