import { createClient } from "@/lib/supabase/server";
import { SimuladorClient } from "@/components/simulador-client";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { BookOpen } from "lucide-react";
import type { Producto } from "@/types";

export default async function SimuladorPage() {
  const supabase = await createClient();

  const { data: productosConFormula } = await supabase
    .from("formulas")
    .select("producto_id, productos(*)")
    .is("vigente_hasta", null);

  const productos: Producto[] = (productosConFormula ?? [])
    .map((row: { productos: Producto | Producto[] | null }) => {
      const p = row.productos;
      return Array.isArray(p) ? p[0] : p;
    })
    .filter((p: Producto | null | undefined): p is Producto => !!p && p.activo);

  return (
    <div>
      <PageHeader
        title="Simulador de viabilidad"
        description="Selecciona un producto y cantidad. El sistema calcula los insumos requeridos según la fórmula vigente y los compara contra el stock disponible."
      />

      {productos.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No hay productos con fórmula vigente"
          description="Para usar el simulador primero define la fórmula de al menos un producto."
          actionHref="/formulas"
          actionLabel="Ir a fórmulas"
        />
      ) : (
        <SimuladorClient productos={productos} />
      )}
    </div>
  );
}
