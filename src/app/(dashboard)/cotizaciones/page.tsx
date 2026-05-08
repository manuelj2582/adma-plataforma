import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Calculator, ClipboardList } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { ESTADOS_COTIZACION_LABEL } from "@/types";

const ESTADO_BADGE: Record<string, string> = {
  borrador: "badge-neutral",
  enviada: "badge-info",
  aprobada: "badge-success",
  convertida: "badge-info",
  rechazada: "badge-danger",
  expirada: "badge-warn",
};

export default async function CotizacionesPage() {
  const supabase = await createClient();

  const { data: cotizaciones } = await supabase
    .from("cotizaciones")
    .select("*, productos(nombre, presentacion), clientes(nombre)")
    .order("creado_en", { ascending: false });

  return (
    <div>
      <PageHeader
        title="Cotizaciones"
        description="Solicitudes de cotización a clientes con su estado actual."
        action={
          <Link href="/simulador" className="btn-primary">
            <Calculator className="h-4 w-4" /> Nueva cotización
          </Link>
        }
      />

      {cotizaciones && cotizaciones.length > 0 ? (
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Número</th>
                <th>Cliente</th>
                <th>Producto</th>
                <th className="text-right">Cantidad</th>
                <th>Fecha</th>
                <th className="text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              {cotizaciones.map((c: any) => (
                <tr key={c.id}>
                  <td>
                    <Link
                      href={`/cotizaciones/${c.id}`}
                      className="font-mono text-[11px] font-medium text-ink hover:text-olive-700 transition-colors"
                    >
                      {c.numero}
                    </Link>
                  </td>
                  <td>
                    {c.clientes?.nombre ? (
                      <span className="text-sm text-ink">{c.clientes.nombre}</span>
                    ) : (
                      <span className="text-sm text-ink-subtle italic">Sin cliente</span>
                    )}
                  </td>
                  <td>
                    <div className="font-medium text-ink text-sm">
                      {c.productos?.nombre}
                    </div>
                    {c.productos?.presentacion && (
                      <div className="text-xs text-ink-mute mt-0.5">
                        {c.productos.presentacion}
                      </div>
                    )}
                  </td>
                  <td className="text-right">
                    <span className="font-mono text-sm text-ink tabular-nums">
                      {c.cantidad.toLocaleString("es-CL")}
                    </span>
                  </td>
                  <td className="text-ink-mute text-sm">
                    {new Date(c.fecha_cotizacion).toLocaleDateString("es-CL", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="text-center">
                    <span
                      className={
                        ESTADO_BADGE[c.estado as keyof typeof ESTADO_BADGE] ?? "badge-neutral"
                      }
                    >
                      {
                        ESTADOS_COTIZACION_LABEL[
                          c.estado as keyof typeof ESTADOS_COTIZACION_LABEL
                        ]
                      }
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={ClipboardList}
          title="Aún no hay cotizaciones"
          description="Crea la primera cotización desde el simulador. Antes de comprometer un plazo con el cliente, calcula los insumos disponibles."
          actionHref="/simulador"
          actionLabel="Abrir simulador"
        />
      )}
    </div>
  );
}
