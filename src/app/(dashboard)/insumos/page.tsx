import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function InsumosPage() {
  const supabase = await createClient();
  const { data: insumos } = await supabase
    .from("insumos_disponibilidad")
    .select("*, categorias_insumo(nombre), proveedores(nombre)")
    .eq("activo", true)
    .order("nombre");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">Insumos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Materias primas, envases y materiales
          </p>
        </div>
        <Link
          href="/insumos/nuevo"
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Nuevo insumo
        </Link>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Código</th>
              <th className="text-left px-4 py-3 font-medium">Nombre</th>
              <th className="text-left px-4 py-3 font-medium">Categoría</th>
              <th className="text-right px-4 py-3 font-medium">Stock disponible</th>
              <th className="text-right px-4 py-3 font-medium">Mínimo</th>
              <th className="text-center px-4 py-3 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {insumos && insumos.length > 0 ? (
              insumos.map((i: any) => (
                <tr key={i.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs">{i.codigo}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/insumos/${i.id}`}
                      className="font-medium hover:underline"
                    >
                      {i.nombre}
                    </Link>
                    {i.proveedores && (
                      <div className="text-xs text-muted-foreground">
                        {i.proveedores.nombre}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {i.categorias_insumo?.nombre ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {Number(i.stock_disponible).toLocaleString("es-CL")} {i.unidad_medida}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                    {Number(i.stock_minimo).toLocaleString("es-CL")}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {i.bajo_stock ? (
                      <span className="inline-block px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded">
                        Bajo stock
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded">
                        OK
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  Aún no hay insumos cargados.{" "}
                  <Link href="/insumos/nuevo" className="text-foreground underline">
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
