import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { BookOpen } from "lucide-react";

export default async function FormulasPage() {
  const supabase = await createClient();

  const { data: productos } = await supabase
    .from("productos")
    .select("*")
    .eq("activo", true)
    .order("nombre");

  // Por cada producto, contar items de fórmula vigente
  const productosConFormula = await Promise.all(
    (productos ?? []).map(async (p) => {
      const { data: formula } = await supabase
        .from("formulas")
        .select("id, version, vigente_desde")
        .eq("producto_id", p.id)
        .is("vigente_hasta", null)
        .maybeSingle();

      let itemsCount = 0;
      if (formula) {
        const { count } = await supabase
          .from("formula_items")
          .select("*", { count: "exact", head: true })
          .eq("formula_id", formula.id);
        itemsCount = count ?? 0;
      }

      return { ...p, formula, itemsCount };
    })
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">Fórmulas</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Define los insumos y cantidades de cada producto
        </p>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Producto</th>
              <th className="text-center px-4 py-3 font-medium">Versión vigente</th>
              <th className="text-right px-4 py-3 font-medium">Insumos</th>
              <th className="text-right px-4 py-3 font-medium">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {productosConFormula.length > 0 ? (
              productosConFormula.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="font-medium">{p.nombre}</div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {p.codigo}
                      {p.presentacion && ` · ${p.presentacion}`}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {p.formula ? (
                      <span className="inline-block px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded">
                        v{p.formula.version}
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 rounded">
                        Sin fórmula
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {p.itemsCount}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/formulas/${p.id}`}
                      className="inline-flex items-center gap-1 text-sm text-foreground hover:underline"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      {p.formula ? "Editar" : "Crear"}
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">
                  Primero crea productos en la sección{" "}
                  <Link href="/productos" className="text-foreground underline">
                    Productos
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
