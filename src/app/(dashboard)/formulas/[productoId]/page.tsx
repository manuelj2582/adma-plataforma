import { createClient } from "@/lib/supabase/server";
import { FormulaEditor } from "@/components/formula-editor";
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

  // Buscar fórmula vigente
  const { data: formulaActual } = await supabase
    .from("formulas")
    .select("id, version, vigente_desde, notas")
    .eq("producto_id", productoId)
    .is("vigente_hasta", null)
    .maybeSingle();

  // Items de la fórmula vigente (si existe)
  const { data: itemsActuales } = formulaActual
    ? await supabase
        .from("formula_items")
        .select("*, insumos(id, codigo, nombre, unidad_medida)")
        .eq("formula_id", formulaActual.id)
    : { data: [] };

  // Todos los insumos disponibles para elegir
  const { data: insumos } = await supabase
    .from("insumos")
    .select("*")
    .eq("activo", true)
    .order("codigo");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">
          Fórmula · {producto.nombre}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {formulaActual
            ? "Edita la fórmula vigente. Cualquier cambio crea una nueva versión."
            : "Define los insumos que componen este producto."}
        </p>
      </div>

      <FormulaEditor
        producto={producto as Producto}
        formulaActual={formulaActual ?? null}
        itemsActuales={(itemsActuales as FormulaItemConInsumo[]) ?? []}
        insumosDisponibles={(insumos as Insumo[]) ?? []}
      />
    </div>
  );
}
