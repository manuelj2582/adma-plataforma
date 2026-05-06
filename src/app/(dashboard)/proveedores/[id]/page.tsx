import { createClient } from "@/lib/supabase/server";
import { ProveedorForm } from "@/components/proveedor-form";
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">{proveedor.nombre}</h1>
      </div>
      <ProveedorForm proveedor={proveedor as Proveedor} />
    </div>
  );
}
