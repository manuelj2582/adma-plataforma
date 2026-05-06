import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function ProveedoresPage() {
  const supabase = await createClient();
  const { data: proveedores } = await supabase
    .from("proveedores")
    .select("*")
    .eq("activo", true)
    .order("nombre");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">Proveedores</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Empresas que abastecen los insumos
          </p>
        </div>
        <Link
          href="/proveedores/nuevo"
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Nuevo proveedor
        </Link>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Nombre</th>
              <th className="text-left px-4 py-3 font-medium">Contacto</th>
              <th className="text-right px-4 py-3 font-medium">Lead time típico</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {proveedores && proveedores.length > 0 ? (
              proveedores.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link
                      href={`/proveedores/${p.id}`}
                      className="font-medium hover:underline"
                    >
                      {p.nombre}
                    </Link>
                    {p.rut && (
                      <div className="text-xs text-muted-foreground">RUT: {p.rut}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {p.contacto_nombre && (
                      <div className="font-medium">{p.contacto_nombre}</div>
                    )}
                    {p.contacto_email && (
                      <div className="text-xs text-muted-foreground">{p.contacto_email}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {p.lead_time_tipico_dias} días
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-4 py-12 text-center text-muted-foreground">
                  Aún no hay proveedores cargados.{" "}
                  <Link href="/proveedores/nuevo" className="text-foreground underline">
                    Crear el primero
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
