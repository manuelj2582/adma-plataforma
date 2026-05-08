import { createClient } from "@/lib/supabase/server";
import { SimuladorClient } from "@/components/simulador-client";
import type { Producto } from "@/types";
import Link from "next/link";

export default async function SimuladorPage() {
  const supabase = await createClient();

  // Solo productos que tengan fórmula vigente
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">
          Simulador de viabilidad
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Calcula automáticamente qué insumos faltan para producir una cantidad
          dada
        </p>
      </div>

      {productos.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-sm">
          <p className="font-medium text-amber-900">
            No hay productos con fórmula vigente
          </p>
          <p className="text-amber-800 mt-1">
            Para usar el simulador primero debes definir la fórmula de al menos un
            producto en la sección{" "}
            <Link href="/formulas" className="underline">
              Fórmulas
            </Link>
            .
          </p>
        </div>
      ) : (
        <SimuladorClient productos={productos} />
      )}
    </div>
  );
}
