import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, Package } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";

export default async function InsumosPage() {
  const supabase = await createClient();
  const { data: insumos } = await supabase
    .from("insumos_disponibilidad")
    .select("*, categorias_insumo(nombre), proveedores(nombre)")
    .eq("activo", true)
    .order("nombre");

  return (
    <div>
      <PageHeader
        label="Maestras"
        title="Insumos"
        description="Materias primas, envases y materiales con stock en tiempo real."
        action={
          <Link href="/insumos/nuevo" className="btn-primary">
            <Plus className="h-4 w-4" />
            Nuevo insumo
          </Link>
        }
      />

      {insumos && insumos.length > 0 ? (
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th className="text-right">Stock disponible</th>
                <th className="text-right">Mínimo</th>
                <th className="text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              {insumos.map((i: any) => (
                <tr key={i.id}>
                  <td>
                    <span className="font-mono text-[11px] text-ink-mute">{i.codigo}</span>
                  </td>
                  <td>
                    <Link
                      href={`/insumos/${i.id}`}
                      className="font-medium text-ink hover:text-olive-700 transition-colors"
                    >
                      {i.nombre}
                    </Link>
                    {i.proveedores && (
                      <div className="text-xs text-ink-mute mt-0.5">
                        {i.proveedores.nombre}
                      </div>
                    )}
                  </td>
                  <td className="text-ink-mute text-sm">
                    {i.categorias_insumo?.nombre ?? "—"}
                  </td>
                  <td className="text-right">
                    <span className="font-mono text-sm text-ink tabular-nums">
                      {Number(i.stock_disponible).toLocaleString("es-CL")} {i.unidad_medida}
                    </span>
                  </td>
                  <td className="text-right">
                    <span className="font-mono text-sm text-ink-mute tabular-nums">
                      {Number(i.stock_minimo).toLocaleString("es-CL")}
                    </span>
                  </td>
                  <td className="text-center">
                    {i.bajo_stock ? (
                      <span className="badge-danger">Bajo stock</span>
                    ) : (
                      <span className="badge-success">OK</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={Package}
          title="Aún no hay insumos"
          description="Carga tus materias primas, envases y materiales para empezar a gestionar el inventario."
          actionHref="/insumos/nuevo"
          actionLabel="Crear el primer insumo"
        />
      )}
    </div>
  );
}
