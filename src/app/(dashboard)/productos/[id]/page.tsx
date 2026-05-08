import { createClient } from "@/lib/supabase/server";
import { ProductoForm } from "@/components/producto-form";
import { PageHeader } from "@/components/page-header";
import { notFound } from "next/navigation";
import type { Producto } from "@/types";

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: producto } = await supabase
    .from("productos")
    .select("*")
    .eq("id", id)
    .single();

  if (!producto) notFound();

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "Productos", href: "/productos" },
          { label: producto.codigo },
        ]}
        label={producto.codigo}
        title={producto.nombre}
      />
      <ProductoForm producto={producto as Producto} />
    </div>
  );
}
