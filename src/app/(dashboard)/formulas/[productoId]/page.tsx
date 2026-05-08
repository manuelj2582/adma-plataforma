import { createClient } from "@/lib/supabase/server";
import { FormulaEditor } from "@/components/formula-editor";
import { PageHeader } from "@/components/page-header";
import { notFound } from "next/navigation";
import type { Producto, Insumo, FormulaItemConInsumo } from "@/types";

export default async function EditarFormulaPage({
  params,
}: {
  params: Promise<{ productoId: string }>;
}) {
  const { productoId } = await params;
  const supabase = await createClient();

  const { data: producto } = await supabase
    .from("productos")
    .select("*")
    .eq("id", productoId)
    .single();

  if (!producto) notFound();

  const { data: formulaActual } = await supabase
    .from("formulas")
    .select("id, version, vigente_desde, notas")
    .eq("producto_id", productoId)
    .is("vigente_hasta", null)
    .maybeSingle();

  const { data: itemsActuales } = formulaActual
    ? await supabase
        .from("formula_items")
        .select("*, insumos(id, codigo, nombre, unidad_medida)")
        .eq("formula_id", formulaActual.id)
    : { data: [] };

  const { data: insumos } = await supabase
    .from("insumos")
    .select("*")
    .eq("activo", true)
    .order("codigo");

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "Fórmulas", href: "/formulas" },
          { label: producto.nombre },
        ]}
        label={formulaActual ? `Versión ${formulaActual.version} vigente` : "Sin fórmula"}
        title={`Fórmula · ${producto.nombre}`}
        description={
          formulaActual
            ? "Edita la fórmula vigente. Cualquier cambio crea una nueva versión y conserva la anterior en histórico."
            : "Define los insumos que componen este producto."
        }
      />

      <FormulaEditor
        producto={producto as Producto}
        formulaActual={formulaActual ?? null}
        itemsActuales={(itemsActuales as FormulaItemConInsumo[]) ?? []}
        insumosDisponibles={(insumos as Insumo[]) ?? []}
      />
    </div>
  );
}
