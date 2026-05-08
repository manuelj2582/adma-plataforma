import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";

export default async function FormulasPage() {
  const supabase = await createClient();

  const { data: productos } = await supabase
    .from("productos")
    .select("*")
    .eq("activo", true)
    .order("nombre");

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
    <div>
      <PageHeader
        label="Maestras"
        title="Fórmulas"
        description="Define los insumos y cantidades de cada producto. Las fórmulas son versionadas: cada cambio queda registrado."
      />

      {productosConFormula.length > 0 ? (
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th className="text-center">Versión vigente</th>
                <th className="text-right">Insumos</th>
                <th className="text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {productosConFormula.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="font-medium text-ink">{p.nombre}</div>
                    <div className="font-mono text-[11px] text-ink-mute mt-0.5">
                      {p.codigo}
                      {p.presentacion && (
                        <span className="ml-1.5 text-ink-subtle">· {p.presentacion}</span>
                      )}
                    </div>
                  </td>
                  <td className="text-center">
                    {p.formula ? (
                      <span className="badge-success font-mono">v{p.formula.version}</span>
                    ) : (
                      <span className="badge-warn">Sin fórmula</span>
                    )}
                  </td>
                  <td className="text-right">
                    <span className="font-mono text-sm text-ink tabular-nums">
                      {p.itemsCount}
                    </span>
                  </td>
                  <td className="text-right">
                    <Link
                      href={`/formulas/${p.id}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-olive-700 hover:text-olive-800 transition-colors"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      {p.formula ? "Editar" : "Crear"}
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="Aún no hay productos"
          description="Primero crea productos en la sección correspondiente para luego definir su fórmula."
          actionHref="/productos/nuevo"
          actionLabel="Crear un producto"
        />
      )}
    </div>
  );
}
