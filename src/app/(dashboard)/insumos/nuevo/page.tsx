import { createClient } from "@/lib/supabase/server";
import { InsumoForm } from "@/components/insumo-form";
import type { CategoriaInsumo, Proveedor } from "@/types";

export default async function NuevoInsumoPage() {
  const supabase = await createClient();
  const [{ data: categorias }, { data: proveedores }] = await Promise.all([
    supabase.from("categorias_insumo").select("*").order("nombre"),
    supabase.from("proveedores").select("*").eq("activo", true).order("nombre"),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">Nuevo insumo</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Agrega una materia prima, envase o material
        </p>
      </div>
      <InsumoForm
        categorias={(categorias as CategoriaInsumo[]) ?? []}
        proveedores={(proveedores as Proveedor[]) ?? []}
      />
    </div>
  );
}
