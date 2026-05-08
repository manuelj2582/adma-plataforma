import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function ClientesPage() {
  const supabase = await createClient();
  const { data: clientes } = await supabase
    .from("clientes")
    .select("*")
    .eq("activo", true)
    .order("nombre");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">Clientes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Empresas que compran tus productos
          </p>
        </div>
        <Link
          href="/clientes/nuevo"
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Nuevo cliente
        </Link>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Nombre</th>
              <th className="text-left px-4 py-3 font-medium">RUT</th>
              <th className="text-left px-4 py-3 font-medium">Contacto</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {clientes && clientes.length > 0 ? (
              clientes.map((c) => (
                <tr key={c.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link
                      href={`/clientes/${c.id}`}
                      className="font-medium hover:underline"
                    >
                      {c.nombre}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {c.rut ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    {c.contacto_nombre && (
                      <div className="font-medium">{c.contacto_nombre}</div>
                    )}
                    {c.contacto_email && (
                      <div className="text-xs text-muted-foreground">{c.contacto_email}</div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-4 py-12 text-center text-muted-foreground">
                  Aún no hay clientes cargados.{" "}
                  <Link href="/clientes/nuevo" className="text-foreground underline">
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
