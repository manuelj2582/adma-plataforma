import { createClient } from "@/lib/supabase/server";
import { ProductoForm } from "@/components/producto-form";
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">{producto.nombre}</h1>
        <p className="text-sm text-muted-foreground mt-1 font-mono">
          {producto.codigo}
        </p>
      </div>
      <ProductoForm producto={producto as Producto} />
    </div>
  );
}
