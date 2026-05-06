import { createClient } from "@/lib/supabase/server";
import { InsumoForm } from "@/components/insumo-form";
import { notFound } from "next/navigation";
import type { CategoriaInsumo, Proveedor, Insumo } from "@/types";

export default async function EditarInsumoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: insumo }, { data: categorias }, { data: proveedores }] =
    await Promise.all([
      supabase.from("insumos").select("*").eq("id", id).single(),
      supabase.from("categorias_insumo").select("*").order("nombre"),
      supabase.from("proveedores").select("*").eq("activo", true).order("nombre"),
    ]);

  if (!insumo) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">{insumo.nombre}</h1>
        <p className="text-sm text-muted-foreground mt-1 font-mono">
          {insumo.codigo}
        </p>
      </div>
      <InsumoForm
        insumo={insumo as Insumo}
        categorias={(categorias as CategoriaInsumo[]) ?? []}
        proveedores={(proveedores as Proveedor[]) ?? []}
      />
    </div>
  );
}
