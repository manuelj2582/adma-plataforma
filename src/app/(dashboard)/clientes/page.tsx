import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, Building2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";

export default async function ClientesPage() {
  const supabase = await createClient();
  const { data: clientes } = await supabase
    .from("clientes")
    .select("*")
    .eq("activo", true)
    .order("nombre");

  return (
    <div>
      <PageHeader
        label="Maestras"
        title="Clientes"
        description="Empresas que compran tus productos terminados."
        action={
          <Link href="/clientes/nuevo" className="btn-primary">
            <Plus className="h-4 w-4" /> Nuevo cliente
          </Link>
        }
      />

      {clientes && clientes.length > 0 ? (
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>RUT</th>
                <th>Contacto</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link
                      href={`/clientes/${c.id}`}
                      className="font-medium text-ink hover:text-olive-700 transition-colors"
                    >
                      {c.nombre}
                    </Link>
                  </td>
                  <td className="font-mono text-[11px] text-ink-mute">
                    {c.rut ?? "—"}
                  </td>
                  <td>
                    {c.contacto_nombre && (
                      <div className="font-medium text-sm text-ink">{c.contacto_nombre}</div>
                    )}
                    {c.contacto_email && (
                      <div className="text-xs text-ink-mute mt-0.5">{c.contacto_email}</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={Building2}
          title="Aún no hay clientes"
          description="Registra a tus clientes para asignarlos a las cotizaciones que generes desde el simulador."
          actionHref="/clientes/nuevo"
          actionLabel="Crear el primer cliente"
        />
      )}
    </div>
  );
}
