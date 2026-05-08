import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, Truck } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";

export default async function ProveedoresPage() {
  const supabase = await createClient();
  const { data: proveedores } = await supabase
    .from("proveedores")
    .select("*")
    .eq("activo", true)
    .order("nombre");

  return (
    <div>
      <PageHeader
        label="Maestras"
        title="Proveedores"
        description="Empresas que abastecen materias primas y materiales."
        action={
          <Link href="/proveedores/nuevo" className="btn-primary">
            <Plus className="h-4 w-4" /> Nuevo proveedor
          </Link>
        }
      />

      {proveedores && proveedores.length > 0 ? (
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Contacto</th>
                <th className="text-right">Lead time típico</th>
              </tr>
            </thead>
            <tbody>
              {proveedores.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link
                      href={`/proveedores/${p.id}`}
                      className="font-medium text-ink hover:text-olive-700 transition-colors"
                    >
                      {p.nombre}
                    </Link>
                    {p.rut && (
                      <div className="font-mono text-[11px] text-ink-mute mt-0.5">
                        {p.rut}
                      </div>
                    )}
                  </td>
                  <td>
                    {p.contacto_nombre && (
                      <div className="font-medium text-sm text-ink">{p.contacto_nombre}</div>
                    )}
                    {p.contacto_email && (
                      <div className="text-xs text-ink-mute mt-0.5">{p.contacto_email}</div>
                    )}
                  </td>
                  <td className="text-right">
                    <span className="font-mono text-sm text-ink tabular-nums">
                      {p.lead_time_tipico_dias} días
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={Truck}
          title="Aún no hay proveedores"
          description="Registra a tus proveedores con su lead time típico para que el simulador estime plazos correctamente."
          actionHref="/proveedores/nuevo"
          actionLabel="Crear el primer proveedor"
        />
      )}
    </div>
  );
}
