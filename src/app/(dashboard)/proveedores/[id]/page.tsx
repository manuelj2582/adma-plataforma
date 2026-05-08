import { createClient } from "@/lib/supabase/server";
import { ProveedorForm } from "@/components/proveedor-form";
import { PageHeader } from "@/components/page-header";
import { notFound } from "next/navigation";
import type { Proveedor } from "@/types";

export default async function EditarProveedorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: proveedor } = await supabase
    .from("proveedores")
    .select("*")
    .eq("id", id)
    .single();

  if (!proveedor) notFound();

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "Proveedores", href: "/proveedores" },
          { label: proveedor.nombre },
        ]}
        title={proveedor.nombre}
      />
      <ProveedorForm proveedor={proveedor as Proveedor} />
    </div>
  );
}
