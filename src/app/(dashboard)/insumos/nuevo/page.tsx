import { createClient } from "@/lib/supabase/server";
import { InsumoForm } from "@/components/insumo-form";
import { PageHeader } from "@/components/page-header";
import type { CategoriaInsumo, Proveedor } from "@/types";

export default async function NuevoInsumoPage() {
  const supabase = await createClient();
  const [{ data: categorias }, { data: proveedores }] = await Promise.all([
    supabase.from("categorias_insumo").select("*").order("nombre"),
    supabase.from("proveedores").select("*").eq("activo", true).order("nombre"),
  ]);

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "Insumos", href: "/insumos" },
          { label: "Nuevo" },
        ]}
        title="Nuevo insumo"
        description="Agrega una materia prima, envase o material al inventario."
      />
      <InsumoForm
        categorias={(categorias as CategoriaInsumo[]) ?? []}
        proveedores={(proveedores as Proveedor[]) ?? []}
      />
    </div>
  );
}
