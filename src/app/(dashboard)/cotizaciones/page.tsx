import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Calculator } from "lucide-react";
import { ESTADOS_COTIZACION_LABEL } from "@/types";

const ESTADO_BADGE: Record<string, string> = {
  borrador: "bg-gray-100 text-gray-800",
  enviada: "bg-blue-100 text-blue-800",
  aprobada: "bg-green-100 text-green-800",
  convertida: "bg-purple-100 text-purple-800",
  rechazada: "bg-red-100 text-red-800",
  expirada: "bg-amber-100 text-amber-800",
};

export default async function CotizacionesPage() {
  const supabase = await createClient();

  const { data: cotizaciones } = await supabase
    .from("cotizaciones")
    .select("*, productos(nombre, presentacion), clientes(nombre)")
    .order("creado_en", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">Cotizaciones</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Solicitudes de cotización a clientes
          </p>
        </div>
        <Link
          href="/simulador"
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90"
        >
          <Calculator className="h-4 w-4" /> Nueva cotización
        </Link>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Número</th>
              <th className="text-left px-4 py-3 font-medium">Cliente</th>
              <th className="text-left px-4 py-3 font-medium">Producto</th>
              <th className="text-right px-4 py-3 font-medium">Cantidad</th>
              <th className="text-left px-4 py-3 font-medium">Fecha</th>
              <th className="text-center px-4 py-3 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {cotizaciones && cotizaciones.length > 0 ? (
              cotizaciones.map((c: any) => (
                <tr key={c.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link
                      href={`/cotizaciones/${c.id}`}
                      className="font-mono text-xs font-medium hover:underline"
                    >
                      {c.numero}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {c.clientes?.nombre ?? (
                      <span className="text-muted-foreground italic">Sin cliente</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{c.productos?.nombre}</div>
                    {c.productos?.presentacion && (
                      <div className="text-xs text-muted-foreground">
                        {c.productos.presentacion}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {c.cantidad.toLocaleString("es-CL")}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(c.fecha_cotizacion).toLocaleDateString("es-CL")}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${
                        ESTADO_BADGE[c.estado] ?? "bg-gray-100"
                      }`}
                    >
                      {ESTADOS_COTIZACION_LABEL[c.estado as keyof typeof ESTADOS_COTIZACION_LABEL]}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  Aún no hay cotizaciones.{" "}
                  <Link href="/simulador" className="text-foreground underline">
                    Crear desde el simulador
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
