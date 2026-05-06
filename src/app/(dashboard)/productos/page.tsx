import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function ProductosPage() {
  const supabase = await createClient();
  const { data: productos } = await supabase
    .from("productos")
    .select("*")
    .eq("activo", true)
    .order("nombre");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">Productos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Productos terminados que se fabrican
          </p>
        </div>
        <Link
          href="/productos/nuevo"
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Nuevo producto
        </Link>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Código</th>
              <th className="text-left px-4 py-3 font-medium">Nombre</th>
              <th className="text-left px-4 py-3 font-medium">Presentación</th>
              <th className="text-right px-4 py-3 font-medium">Merma</th>
              <th className="text-right px-4 py-3 font-medium">Lead time</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {productos && productos.length > 0 ? (
              productos.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs">{p.codigo}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/productos/${p.id}`}
                      className="font-medium hover:underline"
                    >
                      {p.nombre}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {p.presentacion ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {(Number(p.factor_merma) * 100).toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {p.lead_time_produccion_dias} días
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                  Aún no hay productos cargados.{" "}
                  <Link href="/productos/nuevo" className="text-foreground underline">
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
