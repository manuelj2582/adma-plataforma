import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, FlaskConical } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";

export default async function ProductosPage() {
  const supabase = await createClient();
  const { data: productos } = await supabase
    .from("productos")
    .select("*")
    .eq("activo", true)
    .order("nombre");

  return (
    <div>
      <PageHeader
        label="Maestras"
        title="Productos"
        description="Productos terminados que se fabrican en planta."
        action={
          <Link href="/productos/nuevo" className="btn-primary">
            <Plus className="h-4 w-4" /> Nuevo producto
          </Link>
        }
      />

      {productos && productos.length > 0 ? (
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Presentación</th>
                <th className="text-right">Merma</th>
                <th className="text-right">Lead time</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr key={p.id}>
                  <td>
                    <span className="font-mono text-[11px] text-ink-mute">{p.codigo}</span>
                  </td>
                  <td>
                    <Link
                      href={`/productos/${p.id}`}
                      className="font-medium text-ink hover:text-olive-700 transition-colors"
                    >
                      {p.nombre}
                    </Link>
                  </td>
                  <td className="text-ink-mute text-sm">{p.presentacion ?? "—"}</td>
                  <td className="text-right">
                    <span className="font-mono text-sm text-ink tabular-nums">
                      {(Number(p.factor_merma) * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="text-right">
                    <span className="font-mono text-sm text-ink-mute tabular-nums">
                      {p.lead_time_produccion_dias} días
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={FlaskConical}
          title="Aún no hay productos"
          description="Define los productos terminados que fabrica tu planta para empezar a crear fórmulas."
          actionHref="/productos/nuevo"
          actionLabel="Crear el primer producto"
        />
      )}
    </div>
  );
}
