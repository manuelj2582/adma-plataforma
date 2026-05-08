import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Calculator, ClipboardList, BookOpen } from "lucide-react";

export default async function HomePage() {
  const supabase = await createClient();

  const [
    { count: insumosCount },
    { count: productosCount },
    { count: proveedoresCount },
    { count: clientesCount },
    { count: formulasVigentesCount },
    { data: cotizacionesActivas },
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
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">Inicio</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Resumen de tu operación
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <Link
          href="/insumos"
          className="p-4 bg-card border rounded-lg hover:border-foreground/20 transition-colors"
        >
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Insumos
          </p>
          <p className="text-2xl font-medium mt-1 tabular-nums">
            {insumosCount ?? 0}
          </p>
        </Link>
        <Link
          href="/productos"
          className="p-4 bg-card border rounded-lg hover:border-foreground/20 transition-colors"
        >
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Productos
          </p>
          <p className="text-2xl font-medium mt-1 tabular-nums">
            {productosCount ?? 0}
          </p>
        </Link>
        <Link
          href="/formulas"
          className="p-4 bg-card border rounded-lg hover:border-foreground/20 transition-colors"
        >
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Fórmulas
          </p>
          <p className="text-2xl font-medium mt-1 tabular-nums">
            {formulasVigentesCount ?? 0}
          </p>
        </Link>
        <Link
          href="/proveedores"
          className="p-4 bg-card border rounded-lg hover:border-foreground/20 transition-colors"
        >
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Proveedores
          </p>
          <p className="text-2xl font-medium mt-1 tabular-nums">
            {proveedoresCount ?? 0}
          </p>
        </Link>
        <Link
          href="/clientes"
          className="p-4 bg-card border rounded-lg hover:border-foreground/20 transition-colors"
        >
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Clientes
          </p>
          <p className="text-2xl font-medium mt-1 tabular-nums">
            {clientesCount ?? 0}
          </p>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/simulador"
          className="p-5 bg-card border rounded-lg hover:border-foreground/20 transition-colors"
        >
          <div className="flex items-start gap-3">
            <Calculator className="h-5 w-5 mt-0.5 text-muted-foreground" />
            <div>
              <p className="font-medium">Simular un pedido</p>
              <p className="text-sm text-muted-foreground mt-1">
                Calcula qué insumos se necesitan y si hay stock para producir
              </p>
            </div>
          </div>
        </Link>
        <Link
          href="/formulas"
          className="p-5 bg-card border rounded-lg hover:border-foreground/20 transition-colors"
        >
          <div className="flex items-start gap-3">
            <BookOpen className="h-5 w-5 mt-0.5 text-muted-foreground" />
            <div>
              <p className="font-medium">Editar fórmulas</p>
              <p className="text-sm text-muted-foreground mt-1">
                Define o actualiza las recetas de tus productos
              </p>
            </div>
          </div>
        </Link>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h3 className="font-medium text-sm flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
              Cotizaciones activas
            </h3>
          </div>
          <Link
            href="/cotizaciones"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Ver todas →
          </Link>
        </div>
        {cotizacionesActivas && cotizacionesActivas.length > 0 ? (
          <table className="w-full text-sm">
            <tbody className="divide-y">
              {cotizacionesActivas.map((c: any) => (
                <tr key={c.id} className="hover:bg-muted/30">
                  <td className="px-4 py-2.5 w-32">
                    <Link
                      href={`/cotizaciones/${c.id}`}
                      className="font-mono text-xs font-medium hover:underline"
                    >
                      {c.numero}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="font-medium text-sm">
                      {c.productos?.nombre}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {c.clientes?.nombre ?? "Sin cliente"} ·{" "}
                      {c.cantidad.toLocaleString("es-CL")} u
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right text-xs text-muted-foreground">
                    {new Date(c.fecha_cotizacion).toLocaleDateString("es-CL")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            No hay cotizaciones activas.{" "}
            <Link href="/simulador" className="text-foreground underline">
              Crear una desde el simulador
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
