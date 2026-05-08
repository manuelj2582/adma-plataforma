import { createClient } from "@/lib/supabase/server";
import { InsumoForm } from "@/components/insumo-form";
import { PageHeader } from "@/components/page-header";
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
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "Insumos", href: "/insumos" },
          { label: insumo.codigo },
        ]}
        label={insumo.codigo}
        title={insumo.nombre}
      />
      <InsumoForm
        insumo={insumo as Insumo}
        categorias={(categorias as CategoriaInsumo[]) ?? []}
        proveedores={(proveedores as Proveedor[]) ?? []}
      />
    </div>
  );
}
